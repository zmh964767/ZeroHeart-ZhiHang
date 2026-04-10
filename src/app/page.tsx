"use client";

import { ResumeList } from "@/components/resume/ResumeList";
import { DemoDialog } from "@/components/resume/DemoDialog";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, FileText, Download, Brain, Star, Zap } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: "linear-gradient(160deg, #f8f6ff 0%, #fff5f5 40%, #f0faff 100%)" }}>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        @keyframes floatReverse {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(20px) rotate(-5deg); }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes glow {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-reverse { animation: floatReverse 7s ease-in-out infinite; }
        .animate-twinkle { animation: twinkle 3s ease-in-out infinite; }
        .animate-slide-up { animation: slideUp 0.6s ease-out forwards; }
        .animate-glow { animation: glow 4s ease-in-out infinite; }
        .feature-card:hover .feature-icon { transform: scale(1.1) rotate(-5deg); }
        .glass-card {
          background: rgba(255, 255, 255, 0.6);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255, 154, 158, 0.2);
        }
        .glass-card:hover {
          background: rgba(255, 255, 255, 0.75);
          border: 1px solid rgba(255, 154, 158, 0.35);
          transform: translateY(-4px);
        }
      `}</style>

      {/* 浮动装饰元素 */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-20 left-16 w-16 h-16 rounded-full opacity-20 animate-float" style={{ background: "linear-gradient(135deg, #ffd1dc 0%, #ff9a9e 100%)" }} />
        <div className="absolute top-40 right-24 w-12 h-12 rounded-full opacity-15 animate-float-reverse" style={{ background: "linear-gradient(135deg, #a8e6cf 0%, #88d8b0 100%)" }} />
        <div className="absolute bottom-32 left-24 w-10 h-10 rounded-full opacity-18 animate-twinkle" style={{ background: "linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)" }} />
        <div className="absolute top-1/2 right-16 w-8 h-8 rounded-full opacity-12 animate-float" style={{ background: "linear-gradient(135deg, #fcd5ce 0%, #ffb3c6 100%)", animationDelay: "1.5s" }} />
      </div>

      <header className="sticky top-0 z-50" style={{ background: "rgba(255, 255, 255, 0.55)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", borderBottom: "1px solid rgba(255, 154, 158, 0.18)" }}>
        <div className="container mx-auto px-4 py-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
                style={{ background: "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)" }}
              >
                <span className="text-white font-bold text-lg">Z</span>
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight" style={{ color: "#4a4a4a" }}>ZeroHeart职航</h1>
                <p className="text-xs" style={{ color: "#b8b8b8" }}>AI简历助手</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-500 hover:text-pink-500 transition-colors"
              onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
            >
              了解更多
            </Button>
          </div>
        </div>
      </header>

      <section className="relative py-24">
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center">
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-10 animate-slide-up glass-card"
              style={{ color: "#e07a7a" }}
            >
              <Star className="w-3.5 h-3.5" />
              AI驱动 · 智能优化 · 高效求职
            </div>

            <h2
              className="text-5xl md:text-6xl font-bold mb-8 leading-tight animate-slide-up"
              style={{ animationDelay: "0.1s", color: "#3d3d3d" }}
            >
              让简历成为你
              <br />
              <span style={{ background: "linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #a8e6cf 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                求职的利器
              </span>
            </h2>

            <p
              className="text-lg mb-12 leading-relaxed animate-slide-up"
              style={{ animationDelay: "0.2s", color: "#7a7a7a" }}
            >
              ZeroHeart职航是一款面向大学生的AI简历助手，帮助你快速生成专业简历，
              <br className="hidden md:block" />
              让求职之路更加顺畅。
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{ animationDelay: "0.3s" }}>
              <a href="#create">
                <Button
                  size="lg"
                  className="text-white shadow-xl shadow-pink-200/50 hover:shadow-2xl hover:shadow-pink-300/50 transition-all px-10 py-6 text-base rounded-2xl hover:scale-105"
                  style={{ background: "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)", border: "none" }}
                >
                  开始创建简历
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </a>
              <DemoDialog>
                <Button
                  size="lg"
                  variant="outline"
                  className="px-10 py-6 text-base rounded-2xl border-2 transition-all hover:scale-105 glass-card"
                  style={{ borderColor: "rgba(255,154,158,0.4)", color: "#e07a7a" }}
                >
                  观看演示
                </Button>
              </DemoDialog>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div
              className="feature-card group p-8 rounded-3xl glass-card transition-all duration-400 cursor-default shadow-xl"
            >
              <div
                className="feature-icon w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-lg transition-transform duration-300"
                style={{ background: "linear-gradient(135deg, #ffb3c6 0%, #ff9a9e 100%)" }}
              >
                <Brain className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3" style={{ color: "#4a4a4a" }}>AI智能生成</h3>
              <p className="leading-relaxed" style={{ color: "#8a8a8a" }}>
                输入你的经历描述，AI自动帮你生成专业、简洁、有针对性的简历内容。
              </p>
            </div>

            <div
              className="feature-card group p-8 rounded-3xl glass-card transition-all duration-400 cursor-default shadow-xl"
              style={{ animationDelay: "0.1s" }}
            >
              <div
                className="feature-icon w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-lg transition-transform duration-300"
                style={{ background: "linear-gradient(135deg, #a8e6cf 0%, #88d8b0 100%)" }}
              >
                <FileText className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3" style={{ color: "#4a4a4a" }}>模块化编辑</h3>
              <p className="leading-relaxed" style={{ color: "#8a8a8a" }}>
                6大简历模块自由组合，教育经历、实习经历、项目经验按需启用，灵活调整。
              </p>
            </div>

            <div
              className="feature-card group p-8 rounded-3xl glass-card transition-all duration-400 cursor-default shadow-xl"
              style={{ animationDelay: "0.2s" }}
            >
              <div
                className="feature-icon w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-lg transition-transform duration-300"
                style={{ background: "linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)" }}
              >
                <Download className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3" style={{ color: "#4a4a4a" }}>PDF导出</h3>
              <p className="leading-relaxed" style={{ color: "#8a8a8a" }}>
                简约模板实时预览，一键导出PDF格式，格式兼容任何招聘平台。
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="create" className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-4 glass-card" style={{ color: "#5ab88a" }}>
                <Zap className="w-3 h-3" />
                本地存储 · 无需注册
              </div>
              <h2 className="text-3xl font-bold mb-4" style={{ color: "#4a4a4a" }}>随时开始创作</h2>
              <p className="text-gray-500">所有数据保存在本地浏览器中，无需注册登录</p>
            </div>
            <ResumeList />
          </div>
        </div>
      </section>

      <footer className="py-10" style={{ background: "rgba(255,154,158,0.04)", borderTop: "1px solid rgba(255, 154, 158, 0.12)" }}>
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)" }}>
              <span className="text-white text-xs font-bold">Z</span>
            </div>
            <span className="text-sm font-medium" style={{ color: "#7a7a7a" }}>ZeroHeart职航</span>
          </div>
          <p className="text-xs" style={{ color: "#b0b0b0" }}>
            © 2026 ZeroHeart职航 · 让求职更简单
          </p>
        </div>
      </footer>
    </div>
  );
}
