"use client";

import { Button } from '@/components/ui/button';
import { RefreshCw, Check, X } from 'lucide-react';

interface GenerationActionsProps {
  onRegenerate: () => void;
  onAccept: () => void;
  onCancel: () => void;
  disabled?: boolean;
}

export function GenerationActions({ onRegenerate, onAccept, onCancel, disabled }: GenerationActionsProps) {
  return (
    <div className="flex gap-3">
      <Button
        variant="outline"
        onClick={onRegenerate}
        disabled={disabled}
        className="flex-1"
      >
        <RefreshCw className="h-4 w-4 mr-2" />
        重新生成
      </Button>
      <Button
        variant="outline"
        onClick={onCancel}
        className="flex-1"
      >
        <X className="h-4 w-4 mr-2" />
        取消
      </Button>
      <Button
        onClick={onAccept}
        disabled={disabled}
        className="flex-1"
      >
        <Check className="h-4 w-4 mr-2" />
        采纳
      </Button>
    </div>
  );
}
