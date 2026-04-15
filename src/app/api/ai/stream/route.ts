import { NextRequest, NextResponse } from 'next/server';
import { AI_PROVIDERS, getAIProvider } from '@/lib/ai';

interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: string;
  };
}

function createErrorResponse(code: string, message: string, status: number, details?: string): NextResponse<ErrorResponse> {
  return NextResponse.json(
    {
      error: {
        code,
        message,
        ...(details && { details }),
      },
    },
    { status }
  );
}

const SUPPORTED_PROVIDERS = ['zhipu', 'wenxin', 'tongyi', 'kimi', 'deepseek'] as const;
type ProviderName = typeof SUPPORTED_PROVIDERS[number];

function isValidProvider(name: string): name is ProviderName {
  return SUPPORTED_PROVIDERS.includes(name as ProviderName);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { prompt, provider: requestedProvider = 'zhipu' } = body;

    if (!prompt || typeof prompt !== 'string') {
      return createErrorResponse(
        'INVALID_REQUEST',
        '请求参数无效，需要提供 prompt',
        400
      );
    }

    if (prompt.length > 10000) {
      return createErrorResponse(
        'PROMPT_TOO_LONG',
        'Prompt 长度超过限制 (10000 字符)',
        400
      );
    }

    if (!isValidProvider(requestedProvider)) {
      return createErrorResponse(
        'INVALID_PROVIDER',
        `不支持的 AI 提供商: ${requestedProvider}。支持的提供商: ${SUPPORTED_PROVIDERS.join(', ')}`,
        400
      );
    }

    const aiProvider = getAIProvider(requestedProvider);

    if (!aiProvider.apiKey) {
      const envVarName = `${requestedProvider.toUpperCase()}_API_KEY`;
      return createErrorResponse(
        'MISSING_API_KEY',
        `${envVarName} 环境变量未设置`,
        500,
        `请在 .env.local 文件中配置 ${envVarName}`
      );
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    let response: Response;
    try {
      response = await fetch(aiProvider.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${aiProvider.apiKey}`,
        },
        body: JSON.stringify({
          model: aiProvider.name === '智谱清言' ? 'glm-4' : 'default',
          messages: [{ role: 'user', content: prompt }],
        }),
        signal: controller.signal,
      });
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        return createErrorResponse(
          'REQUEST_TIMEOUT',
          '请求超时 (30秒)，请稍后再试',
          504
        );
      }
      return createErrorResponse(
        'NETWORK_ERROR',
        '网络请求失败，请检查网络连接',
        500
      );
    }

    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorData: any;
      try {
        errorData = await response.json();
      } catch {
        errorData = {};
      }

      const errorMessage = errorData.error?.message || errorData.error || `API error: ${response.status}`;

      if (response.status === 401) {
        return createErrorResponse(
          'UNAUTHORIZED',
          'API Key 无效或已过期',
          401,
          `请检查 ${requestedProvider.toUpperCase()}_API_KEY 是否正确`
        );
      }

      if (response.status === 429) {
        return createErrorResponse(
          'RATE_LIMIT',
          '请求过于频繁，请稍后再试',
          429
        );
      }

      if (response.status >= 500) {
        return createErrorResponse(
          'SERVER_ERROR',
          'AI 服务端错误，请稍后再试',
          response.status
        );
      }

      return createErrorResponse(
        'API_ERROR',
        errorMessage,
        response.status
      );
    }

    let data;
    try {
      data = await response.json();
    } catch {
      return createErrorResponse(
        'INVALID_RESPONSE',
        '无法解析 AI 响应',
        500
      );
    }

    let content = data.choices?.[0]?.message?.content || '';

    try {
      const parsed = JSON.parse(content);
      if (parsed.content) {
        content = parsed.content;
      } else if (parsed.result) {
        content = parsed.result;
      } else if (parsed.text) {
        content = parsed.text;
      } else if (parsed.description) {
        content = parsed.description;
      }
    } catch {
      // content 保持不变，可能是纯文本回复
    }

    if (!content) {
      return createErrorResponse(
        'EMPTY_RESPONSE',
        'AI 返回了空内容，请重试',
        500
      );
    }

    return NextResponse.json({ 
      content,
      provider: requestedProvider,
    });
  } catch (error) {
    console.error('AI stream API error:', error);

    if (error instanceof SyntaxError) {
      return createErrorResponse(
        'INVALID_JSON',
        '请求 JSON 格式无效',
        400
      );
    }

    return createErrorResponse(
      'INTERNAL_ERROR',
      error instanceof Error ? error.message : '服务器内部错误',
      500
    );
  }
}
