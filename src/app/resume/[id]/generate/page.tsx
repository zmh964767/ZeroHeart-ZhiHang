"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useResumeStore } from "@/stores/resume";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function GeneratePage() {
  const params = useParams();
  const router = useRouter();
  const { currentResume, selectResume } = useResumeStore();

  useEffect(() => {
    const id = params.id as string;
    if (id) {
      selectResume(id);
      setTimeout(() => {
        router.push(`/resume/${id}`);
      }, 100);
    }
  }, [params.id, router, selectResume]);

  const handleBack = () => {
    router.push(`/resume/${params.id}`);
  };

  if (!currentResume) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Button onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          返回编辑页面
        </Button>
      </div>
    </div>
  );
}
