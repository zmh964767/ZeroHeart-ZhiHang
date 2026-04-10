"use client";

import { useState } from "react";
import { ArrowRight, Sparkles, FileText, Download, Brain, Star, Zap, Moon, Sun } from "lucide-react";

const DesignOptions = [
  {
    id: "minimal",
    name: "极简主义",
    description: "极致简约，留白美学",
    colors: {
      bg: "#0f0f0f",
      text: "#ffffff",
      accent: "#6366f1",
      card: "#1a1a1a"
    }
  },
  {
    id: "glass",
    name: "玻璃拟态",
    description: "毛玻璃效果，层次分明",
    colors: {
      bg: "#1a1a2e",
      text: "#ffffff",
      accent: "#00d9ff",
      card: "rgba(255,255,255,0.08)"
    }
  },
  {
    id: "gradient",
    name: "渐变奢华",
    description: "动态渐变，视觉冲击力强",
    colors: {
      bg: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      text: "#ffffff",
      accent: "#ffd700",
      card: "rgba(255,255,255,0.15)"
    }
  }
];

export default function DesignPrototype() {
  const [selectedDesign, setSelectedDesign] = useState("glass");
  const currentDesign = DesignOptions.find(d => d.id === selectedDesign)!;

  return (
    <div className="min-h-screen transition-all duration-700" style={{ background: currentDesign.colors.bg }}>
      {/* 顶部导航 */}
      <header className="sticky top-0 z-50 backdrop-blur-xl border-b transition-all duration-500" style={{ 
        background: selectedDesign === "minimal" ? "rgba(15,15,15,0.95)" : "rgba(255,255,255,0.05)",
        borderColor: selectedDesign === "minimal" ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.1)"
      }}>
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
                style={{ background: currentDesign.colors.accent }}
              >
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight" style={{ color: currentDesign.colors.text }}>设计原型</h1>
                <p className="text-xs opacity-60" style={{ color: currentDesign.colors.text }}>探索不同的视觉风格</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 设计选择器 */}
      <section className="py-8 border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
        <div className="container mx-auto px-6">
          <h2 className="text-lg font-semibold mb-6" style={{ color: currentDesign.colors.text }}>选择设计风格</h2>
          <div className="flex gap-4 flex-wrap">
            {DesignOptions.map(design => (
              <button
                key={design.id}
                onClick={() => setSelectedDesign(design.id)}
                className={`px-6 py-3 rounded-2xl transition-all duration-300 border-2 ${selectedDesign === design.id ? 'scale-105 shadow-xl' : 'opacity-70 hover:opacity-100'}`}
                style={{ 
                  background: design.colors.card,
                  borderColor: selectedDesign === design.id ? design.colors.accent : "transparent",
                  color: design.colors.text
                }}
              >
                <div className="font-semibold">{design.name}</div>
                <div className="text-xs opacity-70">{design.description}</div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Hero 区域 */}
      <section className="relative py-24 overflow-hidden">
        {/* 装饰元素 */}
        <div className="absolute top-10 left-10 w-32 h-32 rounded-full opacity-20 blur-3xl" style={{ background: currentDesign.colors.accent }} />
        <div className="absolute bottom-20 right-20 w-48 h-48 rounded-full opacity-15 blur-3xl" style={{ background: currentDesign.colors.accent }} />

        <div className="container mx-auto px-6 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-8"
              style={{ background: `rgba(${selectedDesign === "minimal" ? "255,255,255" : "255,255,255"},0.1)`, color: currentDesign.colors.text, border: `1px solid ${currentDesign.colors.accent}30` }}
            >
              <Star className="w-4 h-4" style={{ color: currentDesign.colors.accent }} />
              {currentDesign.name} · 高级视觉体验
            </div>

            <h2 className="text-5xl md:text-7xl font-bold mb-8 leading-tight" style={{ color: currentDesign.colors.text }}>
              让设计成为
              <br />
              <span style={{ color: currentDesign.colors.accent }}>品牌的核心</span>
            </h2>

            <p className="text-lg mb-12 leading-relaxed opacity-80" style={{ color: currentDesign.colors.text }}>
              打破千篇一律的设计模式，探索更有质感的视觉表达。
              <br className="hidden md:block" />
              每一个细节都经过精心打磨。
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                className="px-10 py-6 text-base rounded-2xl font-semibold shadow-xl transition-all hover:scale-105 hover:shadow-2xl"
                style={{ background: currentDesign.colors.accent, color: "#fff" }}
              >
                开始体验
                <ArrowRight className="w-4 h-4 ml-2 inline" />
              </button>
              <button
                className="px-10 py-6 text-base rounded-2xl font-semibold border-2 transition-all hover:scale-105"
                style={{ borderColor: currentDesign.colors.accent, color: currentDesign.colors.text, background: "transparent" }}
              >
                了解更多
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 特性卡片 */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              { icon: <Brain />, title: "智能交互", desc: "流畅的微交互反馈，每一个操作都有惊喜" },
              { icon: <FileText />, title: "层次分明", desc: "通过阴影、透明度和动效构建清晰的视觉层级" },
              { icon: <Download />, title: "动效流畅", desc: "60fps 丝滑动画，提升整体体验质感" }
            ].map((feature, i) => (
              <div
                key={i}
                className="group p-8 rounded-3xl transition-all duration-500 hover:-translate-y-2 cursor-default"
                style={{ 
                  background: currentDesign.colors.card,
                  border: `1px solid ${currentDesign.colors.accent}20`,
                  backdropFilter: "blur(20px)"
                }}
              >
                <div 
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-3"
                  style={{ background: currentDesign.colors.accent }}
                >
                  <div className="w-8 h-8 text-white">{feature.icon}</div>
                </div>
                <h3 className="text-xl font-bold mb-3" style={{ color: currentDesign.colors.text }}>{feature.title}</h3>
                <p className="leading-relaxed opacity-70" style={{ color: currentDesign.colors.text }}>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 编辑界面原型 */}
      <section className="py-20" style={{ background: "rgba(0,0,0,0.2)" }}>
        <div className="container mx-auto px-6">
          <h2 className="text-2xl font-bold mb-10 text-center" style={{ color: currentDesign.colors.text }}>编辑器界面</h2>
          
          <div className="max-w-6xl mx-auto rounded-3xl overflow-hidden shadow-2xl" style={{ 
            background: currentDesign.colors.card,
            border: `1px solid ${currentDesign.colors.accent}20`,
            backdropFilter: "blur(30px)"
          }}>
            <div className="flex items-center gap-2 px-6 py-4 border-b" style={{ borderColor: `${currentDesign.colors.accent}15` }}>
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full" style={{ background: "#ff5f57" }} />
                <div className="w-3 h-3 rounded-full" style={{ background: "#febc2e" }} />
                <div className="w-3 h-3 rounded-full" style={{ background: "#28c840" }} />
              </div>
              <span className="text-sm opacity-60 ml-4" style={{ color: currentDesign.colors.text }}>resume-editor.tsx</span>
            </div>
            
            <div className="grid md:grid-cols-3 gap-0">
              {/* 左侧边栏 */}
              <div className="p-6 border-r" style={{ borderColor: `${currentDesign.colors.accent}15` }}>
                <h3 className="font-semibold mb-4" style={{ color: currentDesign.colors.text }}>简历模块</h3>
                <div className="space-y-2">
                  {["个人信息", "教育经历", "实习经历", "工作经历", "项目经历", "校园经历", "自我评价"].map((item, i) => (
                    <div 
                      key={i}
                      className={`p-3 rounded-xl transition-all ${i === 2 ? 'ring-2' : 'hover:opacity-80'}`}
                      style={{ 
                        background: i === 2 ? `${currentDesign.colors.accent}20` : "transparent",
                        ringColor: currentDesign.colors.accent,
                        color: currentDesign.colors.text
                      }}
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* 中间编辑区 */}
              <div className="p-6 border-r" style={{ borderColor: `${currentDesign.colors.accent}15` }}>
                <h3 className="font-semibold mb-6" style={{ color: currentDesign.colors.text }}>编辑</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm opacity-60 block mb-2" style={{ color: currentDesign.colors.text }}>公司名称</label>
                    <div className="w-full h-10 rounded-xl px-4" style={{ background: "rgba(255,255,255,0.05)", color: currentDesign.colors.text }} />
                  </div>
                  <div>
                    <label className="text-sm opacity-60 block mb-2" style={{ color: currentDesign.colors.text }}>职位</label>
                    <div className="w-full h-10 rounded-xl px-4" style={{ background: "rgba(255,255,255,0.05)", color: currentDesign.colors.text }} />
                  </div>
                  <div>
                    <label className="text-sm opacity-60 block mb-2" style={{ color: currentDesign.colors.text }}>工作描述</label>
                    <div className="w-full h-32 rounded-xl px-4 pt-2" style={{ background: "rgba(255,255,255,0.05)", color: currentDesign.colors.text }} />
                  </div>
                </div>
              </div>
              
              {/* 右侧预览 */}
              <div className="p-6">
                <h3 className="font-semibold mb-6" style={{ color: currentDesign.colors.text }}>预览</h3>
                <div 
                  className="w-full aspect-[210/297] rounded-xl p-4 shadow-inner"
                  style={{ background: "#fff" }}
                >
                  <div className="h-4 w-24 rounded" style={{ background: currentDesign.colors.accent }} />
                  <div className="mt-4 h-2 w-32 rounded opacity-40" style={{ background: "#333" }} />
                  <div className="mt-6 space-y-2">
                    <div className="h-2 w-full rounded opacity-20" style={{ background: "#333" }} />
                    <div className="h-2 w-5/6 rounded opacity-20" style={{ background: "#333" }} />
                    <div className="h-2 w-4/6 rounded opacity-20" style={{ background: "#333" }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 border-t" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
        <div className="container mx-auto px-6 text-center">
          <p className="text-sm opacity-60" style={{ color: currentDesign.colors.text }}>
            © 2026 设计原型 · 探索更高级的视觉表达
          </p>
        </div>
      </footer>
    </div>
  );
}
