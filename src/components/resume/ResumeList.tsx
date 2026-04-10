"use client";

import { useResumeStore } from "@/stores/resume";
import { ResumeCard } from "./ResumeCard";
import { CreateResumeModal } from "./CreateResumeModal";
import { FileText } from "lucide-react";

export function ResumeList() {
  const { resumes, isLoading } = useResumeStore();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (resumes.length === 0) {
    return (
      <div className="text-center py-16">
        <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">暂无简历</h3>
        <p className="text-gray-500 mb-6">创建你的第一份简历，开启求职之旅</p>
        <CreateResumeModal>
          <button className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
            创建简历
          </button>
        </CreateResumeModal>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between relative z-10">
        <h2 className="text-xl font-semibold text-gray-900">
          我的简历 ({resumes.length})
        </h2>
        <CreateResumeModal>
          <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm relative z-20">
            新建简历
          </button>
        </CreateResumeModal>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {resumes.map(resume => (
          <ResumeCard key={resume.id} resume={resume} />
        ))}
      </div>
    </div>
  );
}
