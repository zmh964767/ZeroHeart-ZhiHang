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
    
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const fileName = (resume.name || "简历").trim() || "简历";
    
    if (isMobile) {
      try {
        if (navigator.share && navigator.canShare) {
          const file = new File([blob], `${fileName}.pdf`, { type: "application/pdf" });
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({
              title: `${fileName} - PDF简历`,
              files: [file],
            });
            setTimeout(() => URL.revokeObjectURL(url), 10000);
            return;
          }
        }
        window.open(url, "_blank");
      } catch (shareError) {
        window.open(url, "_blank");
      }
    } else {
      const link = document.createElement("a");
      link.href = url;
      link.download = `${resume.name || "简历"}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 10000);
  } catch (e) {
    console.error("PDF生成失败:", e);
    alert("PDF生成失败，请重试");
  }
}
