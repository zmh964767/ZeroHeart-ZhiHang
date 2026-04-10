import { NextRequest, NextResponse } from "next/server";
import type { Resume } from "@/lib/resume/types";
import { spawn } from "child_process";
import path from "path";
import fs from "fs";

const MAX_BODY_SIZE = 5 * 1024 * 1024;
const PROCESS_TIMEOUT = 30000;
const MAX_NAME_LENGTH = 100;

function validateResume(resume: any): { valid: true; resume: Resume } | { valid: false; error: string } {
  if (!resume || typeof resume !== "object") {
    return { valid: false, error: "简历数据无效" };
  }

  if (!resume.name || typeof resume.name !== "string") {
    return { valid: false, error: "简历名称不能为空" };
  }

  if (resume.name.length > MAX_NAME_LENGTH) {
    return { valid: false, error: `简历名称过长，最多 ${MAX_NAME_LENGTH} 字符` };
  }

  if (!resume.content || typeof resume.content !== "object") {
    return { valid: false, error: "简历内容无效" };
  }

  return { valid: true, resume: resume as Resume };
}

function sanitizeFilename(name: string): string {
  return name.replace(/[<>:"/\\|?*]/g, "_").substring(0, 100);
}

export async function POST(request: NextRequest) {
  const contentLength = request.headers.get("content-length");
  if (contentLength && parseInt(contentLength) > MAX_BODY_SIZE) {
    return NextResponse.json({ error: "请求体过大，最大 5MB" }, { status: 413 });
  }

  const outputPath = `/tmp/resume-${Date.now()}.pdf`;

  try {
    const rawResume = await request.json();
    const validation = validateResume(rawResume);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }
    const resume = validation.resume;

    const expectedScriptPath = path.join(process.cwd(), "scripts/generate-pdf.mjs");
    const scriptPath = expectedScriptPath;

    // 安全校验：确保脚本路径是预期的路径
    if (scriptPath !== expectedScriptPath) {
      return NextResponse.json({ error: "Invalid script path" }, { status: 500 });
    }

    const result = await new Promise<Buffer>((resolve, reject) => {
      const child = spawn("node", [scriptPath]);
      let stdout = "", stderr = "";
      let timedOut = false;

      const timeout = setTimeout(() => {
        timedOut = true;
        child.kill();
        reject(new Error("PDF 生成超时（30秒）"));
      }, PROCESS_TIMEOUT);

      child.on("error", (err) => {
        clearTimeout(timeout);
        reject(new Error(`Spawn failed: ${err.message}`));
      });

      child.stdout?.on("data", (d: Buffer) => { stdout += d.toString(); });
      child.stderr?.on("data", (d: Buffer) => { stderr += d.toString(); });

      child.on("close", (code) => {
        clearTimeout(timeout);
        if (timedOut) return;
        if (code !== 0) {
          reject(new Error(`PDF script failed: ${stderr}`));
        } else if (!fs.existsSync(outputPath)) {
          reject(new Error("PDF file not created: " + stdout));
        } else {
          resolve(fs.readFileSync(outputPath));
        }
      });

      child.stdin?.write(JSON.stringify({ resume, outputPath }));
      child.stdin?.end();
    });

    const safeFilename = sanitizeFilename(resume.name || "简历");
    return new NextResponse(new Uint8Array(result), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(safeFilename)}.pdf"`,
      },
    });
  } catch (e) {
    console.error("PDF generation error:", e);
    const message = e instanceof Error ? e.message : "PDF生成失败";
    return NextResponse.json({ error: message }, { status: 500 });
  } finally {
    try { if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath); } catch { /* ignore */ }
  }
}
