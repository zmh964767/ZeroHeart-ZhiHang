"use client";

import { useState, useEffect } from "react";
import { EvaluationBlock as EvaluationBlockType } from "@/lib/resume/types";
import { Textarea } from "@/components/ui/textarea";
import { useResumeStore } from "@/stores/resume";

interface EvaluationBlockProps {
  data: EvaluationBlockType;
}

export function EvaluationBlockEditor({ data }: EvaluationBlockProps) {
  const { updateContent } = useResumeStore();
  const [localContent, setLocalContent] = useState(data.content);

  useEffect(() => {
    setLocalContent(data.content);
  }, [data]);

  const handleContentChange = (value: string) => {
    setLocalContent(value);
    updateContent({ evaluation: { ...data, content: value } });
  };

  return (
    <div className="space-y-6">
      <h3 className="font-medium text-gray-900">自我评价</h3>

      <div className="space-y-3">
        <Textarea
          value={localContent}
          onChange={(e) => handleContentChange(e.target.value)}
          placeholder="在这里填写你的自我评价..."
          rows={3}
          style={{ 
            background: "rgba(255, 255, 255, 0.6)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            borderColor: "rgba(255, 154, 158, 0.25)",
          }}
        />
        <p className="text-xs text-gray-500">
          建议：可以从以下几个方面展开，包括你的核心优势、职业规划、工作风格和其他亮点等。
        </p>
      </div>
    </div>
  );
}
