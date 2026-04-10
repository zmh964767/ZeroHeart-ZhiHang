"use client";

import { useState, lazy, Suspense } from 'react';
import { useResumeStore } from "@/stores/resume";
import { ProfileBlockEditor } from "./blocks/ProfileBlock";
import { EducationBlockEditor } from "./blocks/EducationBlock";
import { InternshipBlockEditor } from "./blocks/InternshipBlock";
import { WorkBlockEditor } from "./blocks/WorkBlock";
import { ProjectBlockEditor } from "./blocks/ProjectBlock";
import { CampusBlockEditor } from "./blocks/CampusBlock";
import { EvaluationBlockEditor } from "./blocks/EvaluationBlock";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

const AISidebar = lazy(() => 
  import("@/components/ai/AISidebar").then(module => ({
    default: module.AISidebar
  }))
);

export function EditorCanvas() {
  const { currentResume } = useResumeStore();
  const [aiSidebarOpen, setAiSidebarOpen] = useState(false);

  if (!currentResume) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-gray-500">未选择简历</p>
      </div>
    );
  }

  const { content, modules } = currentResume;

  return (
    <>
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto p-4 md:p-8 space-y-6 md:space-y-8">
          {modules.profile && <ProfileBlockEditor data={content.profile} />}

          {modules.education && <EducationBlockEditor data={content.education} />}

          {modules.work && <WorkBlockEditor data={content.work} />}

          {modules.internship && <InternshipBlockEditor data={content.internship} />}

          {modules.project && <ProjectBlockEditor data={content.project} />}

          {modules.campus && <CampusBlockEditor data={content.campus} />}

          {modules.evaluation && <EvaluationBlockEditor data={content.evaluation} />}

          <div className="flex justify-center pt-4">
            <Button onClick={() => setAiSidebarOpen(true)}>
              <Sparkles className="h-4 w-4 mr-2" />
              AI 写作建议
            </Button>
          </div>
        </div>
      </div>

      {aiSidebarOpen && (
        <Suspense fallback={null}>
          <AISidebar
            open={aiSidebarOpen}
            onClose={() => setAiSidebarOpen(false)}
          />
        </Suspense>
      )}
    </>
  );
}
