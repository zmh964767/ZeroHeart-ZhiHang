"use client";

import { ModuleType } from "@/lib/resume/types";
import { useResumeStore } from "@/stores/resume";
import { cn } from "@/lib/utils";

const modules: { type: ModuleType; name: string; description: string }[] = [
  { type: "profile", name: "个人信息", description: "必填" },
  { type: "education", name: "教育经历", description: "选填" },
  { type: "work", name: "工作经历", description: "选填" },
  { type: "internship", name: "实习经历", description: "选填" },
  { type: "project", name: "项目经历", description: "选填" },
  { type: "campus", name: "校园经历", description: "选填" },
  { type: "evaluation", name: "自我评价", description: "选填" },
];

export function ModuleSidebar() {
  const { currentResume, toggleModule } = useResumeStore();

  if (!currentResume) return null;

  return (
    <div className="w-48 md:w-64 border-r bg-gray-50 p-2 md:p-4">
      <h3 className="font-medium text-gray-900 mb-3 md:mb-4 text-sm md:text-base">简历模块</h3>
      <div className="space-y-1.5 md:space-y-2">
        {modules.map((module) => {
          const isEnabled = currentResume.modules[module.type];
          return (
            <button
              key={module.type}
              onClick={() => toggleModule(module.type)}
              className={cn(
                "w-full p-2 md:p-3 rounded-lg text-left transition-all flex items-center gap-2 md:gap-3",
                isEnabled
                  ? "bg-white border border-primary/30 shadow-sm"
                  : "bg-gray-100 border border-transparent hover:bg-gray-200"
              )}
            >
              <div
                className={cn(
                  "w-5 h-5 rounded border-2 flex items-center justify-center transition-colors",
                  isEnabled ? "border-primary bg-primary" : "border-gray-300"
                )}
              >
                {isEnabled && (
                  <svg
                    className="w-3 h-3 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{module.name}</p>
                <p className="text-xs text-gray-500">{module.description}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
