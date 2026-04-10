"use client";

import { useResumeStore } from "@/stores/resume";
import { cn } from "@/lib/utils";
import type { TemplateType } from "@/lib/resume/types";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

const A4_WIDTH_PX = 794;
const A4_HEIGHT_PX = 1123;

const TEMPLATE_STYLES = {
  simple: {
    headerClass: "text-sm text-black border-black",
    nameClass: "text-xl text-black",
    titleClass: "text-sm text-gray-600",
    infoClass: "text-xs text-gray-500",
    sectionHeader: "font-bold border-b-2 pb-2 mb-4 text-sm text-black border-black",
  },
  modern: {
    headerClass: "text-base text-blue-900 border-blue-700",
    nameClass: "text-2xl text-gray-900",
    titleClass: "text-base text-blue-600",
    infoClass: "text-xs text-gray-500",
    sectionHeader: "font-bold border-b-2 pb-2 mb-4 text-base text-blue-900 border-blue-700",
  },
  classic: {
    headerClass: "text-sm text-gray-800 border-gray-600",
    nameClass: "text-xl text-gray-800",
    titleClass: "text-sm text-gray-600",
    infoClass: "text-xs text-gray-600",
    sectionHeader: "font-bold border-b-2 pb-2 mb-4 text-sm text-gray-800 border-gray-600",
  },
  creative: {
    headerClass: "text-base text-purple-900 border-purple-700",
    nameClass: "text-2xl text-purple-900",
    titleClass: "text-base text-purple-600",
    infoClass: "text-xs text-purple-700",
    sectionHeader: "font-bold border-b-2 pb-2 mb-4 text-base text-purple-900 border-purple-700",
  },
} as const;

const TEMPLATE_BG = {
  simple: "bg-white",
  modern: "bg-slate-50",
  classic: "bg-white border-2 border-gray-200",
  creative: "bg-gradient-to-br from-blue-50 to-purple-50",
} as const;

function formatDateForDisplay(dateStr: string): string {
  if (!dateStr) return "";
  return dateStr.replace(/-/g, ".");
}

function SectionHeader({ title, template }: { title: string; template: TemplateType }) {
  return <h2 className={TEMPLATE_STYLES[template].sectionHeader}>{title}</h2>;
}

interface PreviewPanelProps {
  onClose?: () => void;
}

export function PreviewPanel({ onClose }: PreviewPanelProps) {
  const { currentResume } = useResumeStore();

  if (!currentResume) {
    return (
      <div className="w-full md:w-1/2 border-l bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500">预览区</p>
      </div>
    );
  }

  const { content, modules, template } = currentResume;

  return (
    <div className="fixed inset-0 md:relative md:w-1/2 border-l bg-gray-100 overflow-y-auto z-30 md:z-auto">
      {onClose && (
        <div className="sticky top-0 z-10 flex justify-end p-2 md:hidden bg-gray-100">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            className="p-1.5"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      )}
      <div className="p-2 md:p-4 flex justify-center">
        <div
          id="preview-content"
          className="bg-white shadow-lg overflow-hidden"
          style={{ width: "100%", maxWidth: `${A4_WIDTH_PX}px`, minHeight: `${A4_HEIGHT_PX}px` }}
        >
          <div className={cn("p-4 md:p-8", TEMPLATE_BG[template])}>
            {modules.profile && (
              <div className="flex gap-6 mb-2">
                <div>
                  <h1 className={cn("font-bold mb-5", TEMPLATE_STYLES[template].nameClass)}>
                    {content.profile.name || "姓名"}
                  </h1>
                  <p className={cn("mb-2", TEMPLATE_STYLES[template].titleClass)}>
                    {content.profile.title || "求职意向"}
                  </p>
                  <div className={TEMPLATE_STYLES[template].infoClass}>
                    {content.profile.email && <div>{content.profile.email}</div>}
                    {content.profile.phone && <div>{content.profile.phone}</div>}
                    {content.profile.location && <div>{content.profile.location}</div>}
                  </div>
                </div>
                {content.profile.photo && (
                  <div className="flex-shrink-0 ml-auto">
                    <img
                      src={content.profile.photo}
                      alt="证件照"
                      className="w-24 h-32 object-cover rounded"
                    />
                  </div>
                )}
              </div>
            )}

            {modules.education && content.education.length > 0 && (
              <div className="mb-6">
                <SectionHeader title="教育经历" template={template} />
                {content.education.map((edu, i) => (
                  <div key={i} className="mb-2 text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium">{edu.school}</span>
                      <span className="text-gray-500">
                        {formatDateForDisplay(edu.startDate)} - {formatDateForDisplay(edu.endDate)}
                      </span>
                    </div>
                    <div className="text-gray-600">{edu.degree} | {edu.major}</div>
                    {edu.gpa && <div className="text-gray-500 text-xs">GPA: {edu.gpa}</div>}
                    {edu.courses && (
                      <div className="text-gray-500 text-xs whitespace-pre-wrap">{edu.courses}</div>
                    )}
                    {edu.awards && (
                      <div className="text-gray-500 text-xs whitespace-pre-wrap">{edu.awards}</div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {modules.work && content.work.length > 0 && (
              <div className="mb-6">
                <SectionHeader title="工作经历" template={template} />
                {content.work.map((item, i) => (
                  <div key={i} className="mb-2 text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium">{item.company}</span>
                      <span className="text-gray-500">
                        {formatDateForDisplay(item.startDate)} - {formatDateForDisplay(item.endDate)}
                      </span>
                    </div>
                    <div className="text-gray-600">{item.position}</div>
                    {item.description && (
                      <div className="text-gray-500 text-xs mt-1 whitespace-pre-wrap">{item.description}</div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {modules.internship && content.internship.length > 0 && (
              <div className="mb-6">
                <SectionHeader title="实习经历" template={template} />
                {content.internship.map((item, i) => (
                  <div key={i} className="mb-2 text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium">{item.company}</span>
                      <span className="text-gray-500">
                        {formatDateForDisplay(item.startDate)} - {formatDateForDisplay(item.endDate)}
                      </span>
                    </div>
                    <div className="text-gray-600">{item.position}</div>
                    {item.description && (
                      <div className="text-gray-500 text-xs mt-1 whitespace-pre-wrap">{item.description}</div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {modules.project && content.project.length > 0 && (
              <div className="mb-6">
                <SectionHeader title="项目经历" template={template} />
                {content.project.map((item, i) => (
                  <div key={i} className="mb-2 text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium">{item.name}</span>
                      <span className="text-gray-500">
                        {formatDateForDisplay(item.startDate)} - {formatDateForDisplay(item.endDate)}
                      </span>
                    </div>
                    <div className="text-gray-600">{item.role}</div>
                    {item.description && (
                      <div className="text-gray-500 text-xs mt-1 whitespace-pre-wrap">{item.description}</div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {modules.campus && content.campus.length > 0 && (
              <div className="mb-6">
                <SectionHeader title="校园经历" template={template} />
                {content.campus.map((item, i) => (
                  <div key={i} className="mb-2 text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium">{item.organization}</span>
                      <span className="text-gray-500">
                        {formatDateForDisplay(item.startDate)} - {formatDateForDisplay(item.endDate)}
                      </span>
                    </div>
                    <div className="text-gray-600">{item.position}</div>
                    {item.description && (
                      <div className="text-gray-500 text-xs mt-1 whitespace-pre-wrap">{item.description}</div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {modules.evaluation && content.evaluation.content && (
              <div className="mb-6">
                <SectionHeader title="自我评价" template={template} />
                <div className="text-gray-600 text-sm whitespace-pre-wrap">{content.evaluation.content}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
