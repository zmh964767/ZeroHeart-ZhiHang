"use client";

import { ModuleType } from '@/lib/resume/types';
import { useResumeStore } from '@/stores/resume';
import { cn } from '@/lib/utils';

const MODULE_CONFIG: { type: ModuleType; name: string; icon: string }[] = [
  { type: 'education', name: '教育经历', icon: '🎓' },
  { type: 'work', name: '工作经历', icon: '💼' },
  { type: 'internship', name: '实习经历', icon: '💼' },
  { type: 'project', name: '项目经历', icon: '🚀' },
  { type: 'campus', name: '校园经历', icon: '🎯' },
  { type: 'evaluation', name: '自我评价', icon: '💡' },
];

interface ModuleSelectorProps {
  selectedModules: ModuleType[];
  onToggle: (module: ModuleType) => void;
  disabled?: boolean;
}

export function ModuleSelector({ selectedModules, onToggle, disabled }: ModuleSelectorProps) {
  const { currentResume } = useResumeStore();

  if (!currentResume) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-gray-700">选择要生成的模块</h3>
      <div className="flex flex-wrap gap-2">
        {MODULE_CONFIG.map(({ type, name, icon }) => {
          const isEnabled = currentResume.modules[type];
          const isSelected = selectedModules.includes(type);

          return (
            <button
              key={type}
              onClick={() => isEnabled && onToggle(type)}
              disabled={!isEnabled || disabled}
              className={cn(
                "px-3 py-2 rounded-lg text-sm transition-all flex items-center gap-2",
                !isEnabled && "opacity-40 cursor-not-allowed",
                isEnabled && !isSelected && "bg-gray-100 hover:bg-gray-200",
                isSelected && "bg-primary text-white"
              )}
            >
              <span>{icon}</span>
              <span>{name}</span>
            </button>
          );
        })}
      </div>
      {selectedModules.length === 0 && (
        <p className="text-xs text-gray-500">请选择至少一个模块</p>
      )}
    </div>
  );
}
