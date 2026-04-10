"use client";

import Link from "next/link";
import { Resume } from "@/lib/resume/types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Trash2, Copy } from "lucide-react";
import { useResumeStore } from "@/stores/resume";
import { toast } from "sonner";

interface ResumeCardProps {
  resume: Resume;
}

export function ResumeCard({ resume }: ResumeCardProps) {
  const { deleteResume, duplicateResume } = useResumeStore();

  const handleDelete = async () => {
    if (confirm(`确定删除简历 "${resume.name}" 吗？`)) {
      await deleteResume(resume.id);
      toast.success(`简历「${resume.name}」已删除`);
    }
  };

  const handleDuplicate = async () => {
    await duplicateResume(resume.id);
    toast.success(`简历「${resume.name}」已复制`);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("zh-CN");
  };

  return (
    <div 
      className="rounded-3xl cursor-pointer h-full transition-all duration-400 hover:-translate-y-2 hover:shadow-2xl"
      style={{ 
        background: "rgba(255, 255, 255, 0.6)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        border: "1px solid rgba(255, 154, 158, 0.2)",
      }}
    >
      <Link href={`/resume/${resume.id}`} className="block">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div 
                className="p-2 rounded-xl shadow-lg"
                style={{ background: "linear-gradient(135deg, #ffb3c6 0%, #ff9a9e 100%)" }}
              >
                <FileText className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">{resume.name}</h3>
                <p className="text-sm text-gray-500">
                  更新于 {formatDate(resume.updatedAt)}
                </p>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 mb-4">
            {resume.content.profile.name && (
              <p className="text-sm text-gray-700">{resume.content.profile.name}</p>
            )}
            {resume.content.profile.title && (
              <p className="text-sm text-gray-500">{resume.content.profile.title}</p>
            )}
          </div>
        </CardContent>
      </Link>
      <CardContent className="pt-0">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={handleDuplicate}
            style={{ 
              background: "rgba(255, 255, 255, 0.5)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              borderColor: "rgba(255, 154, 158, 0.3)",
            }}
          >
            <Copy className="h-4 w-4 mr-1" />
            复制
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            style={{ 
              background: "rgba(255, 255, 255, 0.5)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              borderColor: "rgba(255, 154, 158, 0.3)",
            }}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </CardContent>
    </div>
  );
}
