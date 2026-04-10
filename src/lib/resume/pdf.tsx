import { Resume } from "./types";

export async function generatePDF(resume: Resume): Promise<void> {
  try {
    const response = await fetch("/api/resume/pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(resume),
    });

    if (!response.ok) throw new Error("PDF generation failed");

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    
    // 检测是否为移动端
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
      // 移动端：在新窗口打开 PDF
      window.open(url, "_blank");
    } else {
      // 桌面端：直接下载
      const link = document.createElement("a");
      link.href = url;
      link.download = `${resume.name || "简历"}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    
    // 延迟释放 URL，确保下载完成
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 10000);
  } catch (e) {
    console.error("PDF生成失败:", e);
    alert("PDF生成失败，请重试");
  }
}
