"use client";

import { useResumeStore } from '@/stores/resume';

export function ContextPreview() {
  const { currentResume } = useResumeStore();

  if (!currentResume) return null;

  const { profile, education, internship, work, project, campus } = currentResume.content;

  const hasAnyInfo = profile.name || profile.title ||
    education.length > 0 || internship.length > 0 || work.length > 0 ||
    project.length > 0 || campus.length > 0;

  if (!hasAnyInfo) return null;

  return (
    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
      <h3 className="text-sm font-medium text-gray-700">已读取的信息</h3>

      <div className="space-y-2 text-sm">
        {profile.name && (
          <div className="flex items-start gap-2">
            <span className="text-gray-500 min-w-[60px]">姓名：</span>
            <span className="font-medium">{profile.name}</span>
          </div>
        )}
        {profile.title && (
          <div className="flex items-start gap-2">
            <span className="text-gray-500 min-w-[60px]">求职意向：</span>
            <span>{profile.title}</span>
          </div>
        )}

        {education.length > 0 && (
          <div className="mt-3">
            <div className="text-gray-500 mb-1">教育经历</div>
            {education.map((e, i) => (
              <div key={i} className="pl-2 text-xs text-gray-600 border-l-2 border-blue-200">
                {e.school} | {e.major} | {e.startDate}-{e.endDate}
              </div>
            ))}
          </div>
        )}

        {work.length > 0 && (
          <div className="mt-3">
            <div className="text-gray-500 mb-1">工作经历</div>
            {work.map((e, i) => (
              <div key={i} className="pl-2 text-xs text-gray-600 border-l-2 border-yellow-200">
                {e.company} | {e.position}
              </div>
            ))}
          </div>
        )}

        {internship.length > 0 && (
          <div className="mt-3">
            <div className="text-gray-500 mb-1">实习经历</div>
            {internship.map((e, i) => (
              <div key={i} className="pl-2 text-xs text-gray-600 border-l-2 border-green-200">
                {e.company} | {e.position}
              </div>
            ))}
          </div>
        )}

        {project.length > 0 && (
          <div className="mt-3">
            <div className="text-gray-500 mb-1">项目经历</div>
            {project.map((e, i) => (
              <div key={i} className="pl-2 text-xs text-gray-600 border-l-2 border-purple-200">
                {e.name} | {e.role}
              </div>
            ))}
          </div>
        )}

        {campus.length > 0 && (
          <div className="mt-3">
            <div className="text-gray-500 mb-1">校园经历</div>
            {campus.map((e, i) => (
              <div key={i} className="pl-2 text-xs text-gray-600 border-l-2 border-orange-200">
                {e.organization} | {e.position}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
