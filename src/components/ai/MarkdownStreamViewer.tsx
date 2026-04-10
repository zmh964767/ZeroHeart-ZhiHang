"use client";

interface MarkdownStreamViewerProps {
  content: string;
  isGenerating: boolean;
}

function cleanContent(text: string): string {
  let cleaned = text;

  try {
    const parsed = JSON.parse(text);
    if (parsed.content) {
      cleaned = parsed.content;
    } else if (parsed.result) {
      cleaned = parsed.result;
    }
  } catch {
    cleaned = text;
  }

  return cleaned
    .replace(/^[\-\*\•]\s+/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/^\s+|\s+$/g, '')
    .trim();
}

export function MarkdownStreamViewer({ content, isGenerating }: MarkdownStreamViewerProps) {
  const cleanedContent = cleanContent(content);

  if (!cleanedContent && !isGenerating) {
    return (
      <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-400">
        AI 正在生成中...
      </div>
    );
  }

  return (
    <div className="bg-white border rounded-lg p-4 min-h-[200px]">
      <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
        {cleanedContent}
        {isGenerating && <span className="inline-block w-2 h-4 bg-primary animate-pulse ml-1" />}
      </pre>
    </div>
  );
}
