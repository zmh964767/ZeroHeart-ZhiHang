import { useState, useCallback, useRef } from 'react';

const MIN_REQUEST_INTERVAL = 3000; // 3秒最小请求间隔
const MAX_REQUESTS_PER_MINUTE = 10; // 每分钟最大请求数

type GenerationStatus = 'idle' | 'generating' | 'generated' | 'error';

interface AIError {
  code: string;
  message: string;
  details?: string;
}

interface UseAIGenerateOptions {
  onChunk?: (chunk: string) => void;
  onComplete?: (fullText: string) => void;
  onError?: (error: AIError) => void;
}

function parseAIError(response: Response, text?: string): AIError {
  if (!text) {
    return {
      code: 'NETWORK_ERROR',
      message: '网络请求失败，请检查网络连接',
    };
  }

  try {
    const data = JSON.parse(text);
    if (data.error) {
      if (typeof data.error === 'string') {
        return {
          code: 'API_ERROR',
          message: data.error,
        };
      }
      return {
        code: data.error.code || 'API_ERROR',
        message: data.error.message || 'API 返回了错误',
        details: data.error.details,
      };
    }
  } catch {
    // not JSON
  }

  if (response.status === 401) {
    return {
      code: 'UNAUTHORIZED',
      message: 'API Key 无效或已过期',
      details: '请检查 ZHIPU_API_KEY 环境变量',
    };
  }

  if (response.status === 429) {
    return {
      code: 'RATE_LIMIT',
      message: '请求过于频繁，请稍后再试',
    };
  }

  if (response.status >= 500) {
    return {
      code: 'SERVER_ERROR',
      message: 'AI 服务端错误，请稍后再试',
    };
  }

  return {
    code: 'UNKNOWN_ERROR',
    message: `请求失败 (${response.status})`,
    details: text.substring(0, 200),
  };
}

export function useAIGenerate(options: UseAIGenerateOptions = {}) {
  const [status, setStatus] = useState<GenerationStatus>('idle');
  const [generatedText, setGeneratedText] = useState('');
  const [error, setError] = useState<AIError | null>(null);
  const lastRequestTime = useRef(0);
  const requestTimestamps = useRef<number[]>([]);

  const checkRateLimit = useCallback((): { allowed: boolean; waitTime?: number } => {
    const now = Date.now();
    
    if (now - lastRequestTime.current < MIN_REQUEST_INTERVAL) {
      return { 
        allowed: false, 
        waitTime: MIN_REQUEST_INTERVAL - (now - lastRequestTime.current) 
      };
    }

    requestTimestamps.current = requestTimestamps.current.filter(
      ts => now - ts < 60000
    );

    if (requestTimestamps.current.length >= MAX_REQUESTS_PER_MINUTE) {
      const oldestTimestamp = requestTimestamps.current[0];
      return { 
        allowed: false, 
        waitTime: 60000 - (now - oldestTimestamp) 
      };
    }

    return { allowed: true };
  }, []);

  const generate = useCallback(async (prompt: string) => {
    const rateLimit = checkRateLimit();
    if (!rateLimit.allowed) {
      const waitSeconds = Math.ceil((rateLimit.waitTime || 0) / 1000);
      const aiError: AIError = {
        code: 'RATE_LIMIT',
        message: `请求过于频繁，请 ${waitSeconds} 秒后重试`,
      };
      setStatus('error');
      setError(aiError);
      options.onError?.(aiError);
      return;
    }

    setStatus('generating');
    setGeneratedText('');
    setError(null);

    try {
      const response = await fetch('/api/ai/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        const aiError = parseAIError(response, errorText);
        setStatus('error');
        setError(aiError);
        options.onError?.(aiError);
        return;
      }

      const data = await response.json();
      const fullText = data.content || '';
      
      if (!fullText) {
        const aiError: AIError = {
          code: 'EMPTY_RESPONSE',
          message: 'AI 返回了空内容，请重试',
        };
        setStatus('error');
        setError(aiError);
        options.onError?.(aiError);
        return;
      }

      const now = Date.now();
      lastRequestTime.current = now;
      requestTimestamps.current.push(now);

      setGeneratedText(fullText);
      setStatus('generated');
      options.onComplete?.(fullText);
      
    } catch (err) {
      const aiError: AIError = {
        code: 'NETWORK_ERROR',
        message: err instanceof Error ? err.message : '网络请求失败',
      };
      setStatus('error');
      setError(aiError);
      options.onError?.(aiError);
    }
  }, [options, checkRateLimit]);

  const reset = useCallback(() => {
    setStatus('idle');
    setGeneratedText('');
    setError(null);
  }, []);

  return {
    status,
    generatedText,
    error,
    generate,
    reset,
    isGenerating: status === 'generating',
    isError: status === 'error',
    isGenerated: status === 'generated',
  };
}

export type { AIError };
