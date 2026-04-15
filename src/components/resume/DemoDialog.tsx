"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Download, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const DEMO_RESUME = {
  profile: { name: "张明远", title: "前端开发工程师", email: "zhangmingyuan@example.com", phone: "138-0000-1234", location: "北京", photo: "" },
  education: [{ school: "北京大学", degree: "本科", major: "计算机科学与技术", startDate: "2022-09", endDate: "2026-06", gpa: "3.8/4.0", courses: "数据结构与算法\n计算机网络\n操作系统", awards: "ACM 国际大学生程序设计竞赛金奖\n国家奖学金", highlights: [] }],
  internship: [{ company: "字节跳动", position: "前端开发实习生", startDate: "2023-06", endDate: "2023-08", highlights: ["参与抖音 web 端开发", "首屏加载优化 40%"] }],
  project: [{ name: "在线简历生成器", role: "项目负责人", startDate: "2025-01", endDate: "2025-03", highlights: ["支持多模板切换", "PDF 一键导出"] }],
  campus: [{ organization: "计算机协会", position: "技术部长", startDate: "2021-09", endDate: "2023-06", highlights: ["举办 10+ 场技术讲座", "会员 200+ 人"] }],
  advantage: { summary: "熟悉 React、Vue、TypeScript 等前端技术栈，有多个项目经验，热爱技术，善于学习。" },
};

const SIMPLE_STYLES = {
  nameClass: "text-xl text-black",
  titleClass: "text-sm text-gray-600",
  infoClass: "text-xs text-gray-500",
  headerClass: "text-sm text-black border-black",
  sectionHeader: "font-bold border-b-2 pb-2 mb-4 text-sm text-black border-black",
};

export function DemoDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const { profile, education, internship, project, campus, advantage } = DEMO_RESUME;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl w-full p-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex flex-row items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <DialogTitle className="m-0">简历演示</DialogTitle>
            <span className="text-sm text-gray-500">简约模板</span>
          </div>
          <DialogDescription className="text-sm text-gray-500 mt-1">
            查看一份示例简历，了解我们的简约模板效果
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 bg-gray-100 flex justify-center items-center overflow-auto max-h-[70vh]">
          <div
            className="bg-white shadow-xl overflow-hidden"
            style={{ width: "400px", minHeight: "566px" }}
          >
            <div className="p-6">
              <div className="flex gap-4 mb-4">
                <div>
                  <h1 className={cn("font-bold mb-2", SIMPLE_STYLES.nameClass)}>{profile.name}</h1>
                  <p className={cn("mb-2", SIMPLE_STYLES.titleClass)}>{profile.title}</p>
                  <div className={SIMPLE_STYLES.infoClass}>
                    <div>{profile.email}</div>
                    <div>{profile.phone}</div>
                    <div>{profile.location}</div>
                  </div>
                </div>
                {profile.photo && (
                  <div className="flex-shrink-0 ml-auto">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={profile.photo} alt="证件照" className="w-20 h-24 object-cover rounded" />
                  </div>
                )}
              </div>

              <div className="mb-3">
                <div className={cn("font-bold text-sm border-b border-gray-300 pb-1 mb-2", "text-black")}>
                  教育经历
                </div>
                <div className="text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium">{education[0].school}</span>
                    <span className="text-gray-500 text-xs">{education[0].startDate} - {education[0].endDate}</span>
                  </div>
                  <div className="text-gray-600 text-xs">{education[0].degree} | {education[0].major}</div>
                  <div className="text-gray-500 text-xs">GPA: {education[0].gpa}</div>
                  <div className="text-gray-500 text-xs whitespace-pre-wrap">{education[0].courses}</div>
                  <div className="text-gray-500 text-xs whitespace-pre-wrap">{education[0].awards}</div>
                </div>
              </div>

              <div className="mb-3">
                <div className={cn("font-bold text-sm border-b border-gray-300 pb-1 mb-2", "text-black")}>
                  实习经历
                </div>
                <div className="text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium">{internship[0].company}</span>
                    <span className="text-gray-500 text-xs">{internship[0].startDate} - {internship[0].endDate}</span>
                  </div>
                  <div className="text-gray-600 text-xs">{internship[0].position}</div>
                  {internship[0].highlights.map((h, i) => (
                    <div key={i} className="text-gray-500 text-xs">• {h}</div>
                  ))}
                </div>
              </div>

              <div className="mb-3">
                <div className={cn("font-bold text-sm border-b border-gray-300 pb-1 mb-2", "text-black")}>
                  项目经历
                </div>
                <div className="text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium">{project[0].name}</span>
                    <span className="text-gray-500 text-xs">{project[0].startDate} - {project[0].endDate}</span>
                  </div>
                  <div className="text-gray-600 text-xs">{project[0].role}</div>
                  {project[0].highlights.map((h, i) => (
                    <div key={i} className="text-gray-500 text-xs">• {h}</div>
                  ))}
                </div>
              </div>

              <div className="mb-3">
                <div className={cn("font-bold text-sm border-b border-gray-300 pb-1 mb-2", "text-black")}>
                  个人优势
                </div>
                <div className="text-gray-500 text-xs">{advantage.summary}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-3 border-t bg-gray-50 flex items-center justify-between">
          <div />
          <Button size="sm" className="gap-1" onClick={() => { setOpen(false); setTimeout(() => document.getElementById("create")?.scrollIntoView({ behavior: "smooth" }), 300); }}>
            <Download className="w-3 h-3" />
            开始使用
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
