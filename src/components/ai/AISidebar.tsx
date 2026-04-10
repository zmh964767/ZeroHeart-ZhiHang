"use client";

import { useState, useEffect, useCallback } from 'react';
import { useResumeStore } from '@/stores/resume';
import { ModuleType } from '@/lib/resume/types';
import { ContextPreview } from './ContextPreview';
import { useAIGenerate } from '@/hooks/useAIGenerate';
import { buildPrompt, PromptContext } from '@/lib/ai/prompt-templates';
import { X, Sparkles, Loader2, Copy, RefreshCw, AlertCircle, Info, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface AISidebarProps {
  open: boolean;
  onClose: () => void;
}

const MODULE_NAMES: Record<ModuleType, string> = {
  profile: '个人信息',
  education: '教育经历',
  internship: '实习经历',
  work: '工作经历',
  project: '项目经历',
  campus: '校园经历',
  evaluation: '自我评价',
};

const AI_ENABLED_MODULES: ModuleType[] = ['internship', 'work', 'project', 'campus', 'evaluation'];

export function AISidebar({ open, onClose }: AISidebarProps) {
  const { currentResume } = useResumeStore();
  const [selectedModule, setSelectedModule] = useState<ModuleType | null>(null);

  const { status, generatedText, error, generate, reset, isGenerating } = useAIGenerate({
    onError: (err) => {
      toast.error(err.message);
    },
    onComplete: () => {
      toast.success('AI 生成完成');
    },
  });

  const buildContext = useCallback((): PromptContext | null => {
    if (!currentResume) return null;
    return {
      profile: currentResume.content.profile,
      education: currentResume.content.education,
      internship: currentResume.content.internship,
      work: currentResume.content.work,
      project: currentResume.content.project,
      campus: currentResume.content.campus,
      evaluation: currentResume.content.evaluation,
    };
  }, [currentResume]);

  useEffect(() => {
    if (!open) {
      reset();
      setSelectedModule(null);
    }
  }, [open, reset]);

  const handleStartGenerate = async (module: ModuleType) => {
    if (!currentResume) return;

    setSelectedModule(module);
    reset();

    const context = buildContext();
    if (!context) return;

    const prompt = buildPrompt(module, context);
    await generate(prompt);
  };

  const handleRegenerate = async () => {
    if (!currentResume || !selectedModule) return;
    reset();

    const context = buildContext();
    if (!context) return;

    const prompt = buildPrompt(selectedModule, context);
    await generate(prompt);
  };

  const handleCopy = () => {
    if (!generatedText) return;
    navigator.clipboard.writeText(generatedText);
    toast.success('已复制到剪贴板，可直接粘贴使用');
  };

  const canGenerate = currentResume?.content.profile.name && currentResume?.content.profile.title;

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={onClose} />
      <div className="fixed inset-0 md:inset-auto md:right-0 md:top-0 md:h-full md:w-[420px] lg:w-[480px] w-full bg-white shadow-xl z-50 flex flex-col">
        <header className="flex items-center justify-between px-4 py-3 border-b">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="font-medium">AI 写作建议</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {!canGenerate && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-amber-800">请先填写姓名和求职意向</p>
                  <p className="text-xs text-amber-600 mt-1">才能使用 AI 写作建议</p>
                </div>
              </div>
            </div>
          )}

          {canGenerate && !selectedModule && (
            <>
              <div className="text-sm text-gray-600">
                <p className="mb-3">选择一个模块，AI 将基于已有信息生成写作建议。</p>
                <p className="text-gray-400">生成的内容仅作参考，可复制后自行调整使用。</p>
              </div>
              <div className="space-y-3">
                {AI_ENABLED_MODULES.map(module => (
                  <button
                    key={module}
                    onClick={() => handleStartGenerate(module)}
                    className="w-full p-4 border rounded-lg hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{MODULE_NAMES[module]}</span>
                      <Sparkles className="h-4 w-4 text-gray-400" />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {module === 'internship' && '基于实习信息优化描述'}
                      {module === 'work' && '基于工作经历优化描述'}
                      {module === 'project' && '基于项目信息优化描述'}
                      {module === 'campus' && '基于校园经历优化描述'}
                      {module === 'evaluation' && '基于自我评价优化润色'}
                    </p>
                  </button>
                ))}
              </div>
              <ContextPreview />
            </>
          )}

          {selectedModule && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{MODULE_NAMES[selectedModule]}</span>
                  {isGenerating && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
                </div>
                <button
                  onClick={() => setSelectedModule(null)}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  返回选择
                </button>
              </div>

              {isGenerating && (
                <div className="text-sm text-gray-500 py-8 text-center">
                  AI 正在生成写作建议，请稍候...
                </div>
              )}

              {!isGenerating && generatedText && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-green-800">生成完成</p>
                      <p className="text-xs text-green-600 mt-1">可复制内容到简历中使用</p>
                    </div>
                  </div>
                </div>
              )}

              {!isGenerating && generatedText && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <pre className="whitespace-pre-wrap text-sm leading-relaxed font-sans">
                    {generatedText}
                  </pre>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-red-800">{error.message}</p>
                      {error.details && (
                        <p className="text-xs text-red-600 mt-1">{error.details}</p>
                      )}
                      <p className="text-xs text-red-400 mt-2">
                        错误代码: {error.code}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {selectedModule && (
          <div className="p-3 md:p-4 border-t bg-gray-50">
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <Button
                variant="outline"
                onClick={handleRegenerate}
                disabled={isGenerating}
                className="flex-1"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                重新生成
              </Button>
              <Button
                onClick={handleCopy}
                disabled={isGenerating || !generatedText}
                className="flex-1"
              >
                <Copy className="h-4 w-4 mr-2" />
                复制内容
              </Button>
              <Button
                variant="ghost"
                onClick={onClose}
                className="flex-1"
              >
                关闭
              </Button>
            </div>
            <p className="text-xs text-gray-400 text-center mt-2">
              复制内容后，可粘贴到对应的简历编辑框中使用
            </p>
          </div>
        )}
      </div>
    </>
  );
}
