"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useResumeStore } from "@/stores/resume";
import { ModuleSidebar } from "@/components/resume/ModuleSidebar";
import { EditorCanvas } from "@/components/resume/EditorCanvas";
import { PreviewPanel } from "@/components/resume/PreviewPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Download, Eye, EyeOff, PanelLeftClose, PanelLeft } from "lucide-react";
import { generatePDF } from "@/lib/resume/pdf";

export default function EditorPage() {
  const params = useParams();
  const router = useRouter();
  const { currentResume, selectResume, updateResume, isLoading } = useResumeStore();
  const [editingName, setEditingName] = useState(false);
  const [resumeName, setResumeName] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);

  useEffect(() => {
    const id = params.id as string;
    if (id) {
      selectResume(id);
    }
  }, [params.id, selectResume]);

  useEffect(() => {
    if (currentResume) {
      setResumeName(currentResume.name);
    }
  }, [currentResume?.id, currentResume?.name]);

  const handleBack = () => {
    router.push("/");
  };

  const handleExportPDF = async () => {
    if (!currentResume) return;
    await generatePDF(currentResume);
  };

  const handleNameSave = () => {
    if (currentResume && resumeName.trim() && resumeName !== currentResume.name) {
      updateResume({ ...currentResume, name: resumeName.trim() });
    }
    setEditingName(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(160deg, #f8f6ff 0%, #fff5f5 40%, #f0faff 100%)" }}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: "#ff9a9e" }}></div>
      </div>
    );
  }

  if (!currentResume) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(160deg, #f8f6ff 0%, #fff5f5 40%, #f0faff 100%)" }}>
        <div className="text-center p-8 rounded-3xl" style={{ 
          background: "rgba(255, 255, 255, 0.6)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "1px solid rgba(255, 154, 158, 0.2)",
        }}>
          <p className="text-gray-500 mb-4">简历不存在</p>
          <Button onClick={handleBack}>返回首页</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden" style={{ background: "linear-gradient(160deg, #f8f6ff 0%, #fff5f5 40%, #f0faff 100%)" }}>
      {/* 氛围光晕装饰 */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 left-1/4 w-80 h-80 rounded-full opacity-20 blur-3xl" style={{ background: "linear-gradient(135deg, #ffd1dc 0%, #ff9a9e 100%)" }} />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full opacity-15 blur-3xl" style={{ background: "linear-gradient(135deg, #a8e6cf 0%, #88d8b0 100%)" }} />
      </div>

      <header className="sticky top-0 z-50 px-2 md:px-4 py-2 flex items-center justify-between gap-2" style={{ 
        background: "rgba(255, 255, 255, 0.55)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderBottom: "1px solid rgba(255, 154, 158, 0.18)"
      }}>
        <div className="flex items-center gap-2 md:gap-4 min-w-0">
          <Button variant="ghost" size="sm" onClick={handleBack} className="p-1.5 md:p-2">
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline ml-1">返回</span>
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => setShowSidebar(!showSidebar)}
            className="p-1.5 md:p-2 hover:scale-105 transition-transform"
            style={{ 
              background: "rgba(255, 154, 158, 0.15)",
              border: "1px solid rgba(255, 154, 158, 0.3)",
              color: "#e07a7a"
            }}
          >
            {showSidebar ? (
              <>
                <PanelLeftClose className="h-4 w-4" />
                <span className="hidden sm:inline ml-1">关闭模块</span>
              </>
            ) : (
              <>
                <PanelLeft className="h-4 w-4" />
                <span className="hidden sm:inline ml-1">简历模块</span>
              </>
            )}
          </Button>
          {editingName ? (
            <Input
              value={resumeName}
              onChange={(e) => setResumeName(e.target.value)}
              onBlur={handleNameSave}
              onKeyDown={(e) => e.key === "Enter" && handleNameSave()}
              className="w-24 md:w-48 h-8 text-sm"
              autoFocus
            />
          ) : (
            <h1
              className="font-medium text-sm md:text-base cursor-pointer hover:text-primary truncate"
              onClick={() => setEditingName(true)}
              title="点击修改简历名称"
              style={{ color: "#4a4a4a" }}
            >
              {currentResume.name}
            </h1>
          )}
        </div>
        <div className="flex items-center gap-1 md:gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
            className="p-1.5 md:p-2 hover:scale-105 transition-transform"
            style={{ 
              background: "rgba(255, 255, 255, 0.5)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              borderColor: "rgba(255, 154, 158, 0.3)",
            }}
          >
            {showPreview ? (
              <>
                <EyeOff className="h-4 w-4 md:mr-1" />
                <span className="hidden md:inline">关闭预览</span>
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 md:mr-1" />
                <span className="hidden md:inline">预览</span>
              </>
            )}
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportPDF} className="p-1.5 md:p-2 hover:scale-105 transition-transform"
            style={{ 
              background: "rgba(255, 255, 255, 0.5)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              borderColor: "rgba(255, 154, 158, 0.3)",
            }}
          >
            <Download className="h-4 w-4 md:mr-1" />
            <span className="hidden md:inline">导出 PDF</span>
          </Button>
        </div>
      </header>
      <div className="flex-1 flex overflow-hidden">
        {showSidebar && (
          <>
            <div 
              className="fixed inset-0 bg-black/30 z-40 md:hidden"
              onClick={() => setShowSidebar(false)}
            />
            <div className="fixed left-0 top-0 h-full w-48 border-r overflow-y-auto z-50 md:relative md:w-48 lg:w-64" style={{ 
              background: "rgba(255, 255, 255, 0.55)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              borderRight: "1px solid rgba(255, 154, 158, 0.18)"
            }}>
              <ModuleSidebar />
            </div>
          </>
        )}
        {!showSidebar && (
          <button 
            className="hidden md:flex flex-col justify-center items-center p-2 cursor-pointer transition-colors w-16 group" 
            onClick={() => setShowSidebar(true)}
            style={{ 
              background: "rgba(255, 154, 158, 0.08)",
              borderRight: "1px solid rgba(255, 154, 158, 0.15)"
            }}
          >
            <PanelLeft className="h-6 w-6 mb-1 group-hover:scale-110 transition-transform" style={{ color: "#e07a7a" }} />
            <span className="text-xs font-medium" style={{ color: "#e07a7a" }}>打开模块</span>
          </button>
        )}
        <EditorCanvas />
        {showPreview && <PreviewPanel onClose={() => setShowPreview(false)} />}
      </div>
    </div>
  );
}
