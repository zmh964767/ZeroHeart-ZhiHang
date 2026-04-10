import { NextRequest, NextResponse } from "next/server";
import type { Resume } from "@/lib/resume/types";
import fs from "fs";
import path from "path";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const PDFDocument = require("pdfkit");

const FONT_DIR = path.join(process.cwd(), "public/fonts");
const FONT_REGULAR = `${FONT_DIR}/NotoSansSC-Regular.ttf`;
const FONT_BOLD = `${FONT_DIR}/NotoSansSC-Bold.ttf`;

const COLORS = {
  simple: { name: [0, 0, 0], title: [102, 102, 102], info: [153, 153, 153], header: [0, 0, 0], sectionLine: [0, 0, 0] },
};

const A4_HEIGHT_PT = 841.89;
const MARGIN_PT = 56.69;
const SAFETY_BUFFER_PT = 2;
const MAX_BODY_SIZE = 5 * 1024 * 1024;
const MAX_NAME_LENGTH = 100;

const SPACING = {
  sectionTitle: 15,
  sectionLine: 10,
  entryTitle: 16,
  entryGap: 8,
  entrySubtitle: 14,
  entryDateWidth: 90,
  profileName: 28,
  profileTitle: 16,
  profileInfo: 14,
  profileBottom: 20,
  sectionBottom: 4,
};

function fmtDate(d: string) {
  if (!d) return "";
  return d.replace(/-/g, ".");
}

function buildDates(start: string, end: string) {
  const s = fmtDate(start), e = fmtDate(end);
  if (s && e) return `${s} - ${e}`;
  if (s) return s;
  if (e) return e;
  return "";
}

function addNewPage(doc: any, currentPageNum: number, resumeName: string, M: number) {
  const newPageNum = currentPageNum + 1;
  doc.addPage();
  doc.font(FONT_BOLD).fontSize(10);
  doc.text(`${resumeName} | 第 ${newPageNum} 页`, M, 20, { align: 'center', width: 595.28 - M * 2 });
  return { y: M + 40, pageNum: newPageNum };
}

function checkAndAddPage(doc: any, currentY: number, requiredHeight: number, currentPageNum: number, resumeName: string, M: number) {
  if (currentY + requiredHeight > A4_HEIGHT_PT - MARGIN_PT) {
    return addNewPage(doc, currentPageNum, resumeName, M);
  }
  return { y: currentY, pageNum: currentPageNum };
}

function measureTextHeight(doc: any, text: string, fontSize: number, width: number, fontName: string = "NotoSC") {
  if (!text) return 0;
  doc.font(fontName).fontSize(fontSize);
  return doc.heightOfString(text, { width });
}

function buildPdf(resume: Resume) {
  const doc = new PDFDocument({ size: "A4", margin: 0 });
  const W = 595.28, M = 56.69;
  const PW = W - M * 2;
  const c = COLORS[resume.template] || COLORS.simple;
  const { profile, education, internship, work, project, campus, evaluation } = resume.content;
  let y = M;
  let pageNum = 1;
  const resumeName = (profile?.name || "简历").substring(0, 50);

  doc.registerFont("NotoSC", FONT_REGULAR);
  doc.registerFont("NotoSC-Bold", FONT_BOLD);

  function section(title: string) {
    const safeTitle = (title || "").substring(0, 100);
    const requiredHeight = SPACING.sectionTitle + SPACING.sectionLine;
    const result = checkAndAddPage(doc, y, requiredHeight, pageNum, resumeName, M);
    y = result.y;
    pageNum = result.pageNum;

    doc.font("NotoSC-Bold").fontSize(11);
    doc.fillColor(c.header[0], c.header[1], c.header[2]);
    doc.text(safeTitle, M, y, { width: PW });
    y += SPACING.sectionTitle;
    doc.strokeColor(c.sectionLine[0], c.sectionLine[1], c.sectionLine[2]).lineWidth(0.8);
    doc.moveTo(M, y).lineTo(W - M, y).stroke();
    y += SPACING.sectionLine;
  }

  function entry(title: string, subtitle: string, dates: string, extras: string[]) {
    const DATE_W = SPACING.entryDateWidth;
    const GAP = SPACING.entryGap;
    const titleW = PW - DATE_W - GAP;

    const safeTitle = (title || "").substring(0, 200);
    const safeSubtitle = (subtitle || "").substring(0, 300);
    const safeDates = (dates || "").substring(0, 50);
    const safeExtras = (extras || []).slice(0, 50).map(ex => (ex || "").substring(0, 1000));

    let requiredHeight = SPACING.entryTitle + GAP;
    
    if (safeSubtitle) {
      requiredHeight += SPACING.entrySubtitle;
    }

    if (safeExtras.length > 0) {
      for (const ex of safeExtras) {
        const extraHeight = measureTextHeight(doc, ex, 10, PW, "NotoSC");
        requiredHeight += extraHeight;
      }
    }

    const result = checkAndAddPage(doc, y, requiredHeight + SAFETY_BUFFER_PT, pageNum, resumeName, M);
    y = result.y;
    pageNum = result.pageNum;

    if (safeDates) {
      doc.font("NotoSC").fontSize(9);
      doc.fillColor(c.info[0], c.info[1], c.info[2]);
      doc.text(safeDates, W - M - DATE_W, y, { width: DATE_W, align: "right" });
    }

    doc.font("NotoSC-Bold").fontSize(11);
    doc.fillColor(0, 0, 0);
    doc.text(safeTitle, M, y, { width: titleW });
    y += SPACING.entryTitle;

    if (safeSubtitle) {
      doc.font("NotoSC").fontSize(10);
      doc.fillColor(c.title[0], c.title[1], c.title[2]);
      doc.text(safeSubtitle, M, y, { width: PW });
      y += SPACING.entrySubtitle;
    }

    if (safeExtras.length > 0) {
      doc.font("NotoSC").fontSize(10);
      doc.fillColor(c.info[0], c.info[1], c.info[2]);
      for (const ex of safeExtras) {
        const actualHeight = measureTextHeight(doc, ex, 10, PW, "NotoSC");
        doc.text(ex, M, y, { width: PW });
        y += actualHeight;
      }
    }

    y += GAP;
  }

  if (resume.modules.profile && profile) {
    const photoW = 28 * 2.83465;
    const photoH = 37 * 2.83465;
    
    const safeName = (profile.name || "姓名").substring(0, 50);
    const safeTitle = (profile.title || "").substring(0, 100);
    const safeEmail = (profile.email || "").substring(0, 100);
    const safePhone = (profile.phone || "").substring(0, 20);
    const safeLocation = (profile.location || "").substring(0, 100);
    
    let estimatedHeight = SPACING.profileName;
    if (safeTitle) estimatedHeight += SPACING.profileTitle;
    estimatedHeight += SPACING.profileInfo * 3;
    if (profile.photo) estimatedHeight = Math.max(estimatedHeight, photoH);
    estimatedHeight += SPACING.profileBottom;
    
    const result = checkAndAddPage(doc, y, estimatedHeight, pageNum, resumeName, M);
    y = result.y;
    pageNum = result.pageNum;

    if (profile.photo) {
      try {
        const base64 = (profile.photo || "").replace(/^data:image\/\w+;base64,/, "");
        if (base64 && base64.length > 0) {
          doc.image(Buffer.from(base64, "base64"), M + PW - photoW, y, { width: photoW, height: photoH });
        }
      } catch (e) { /* ignore photo errors */ }
    }

    const textMaxW = profile.photo ? PW - photoW - 12 : PW;

    doc.font("NotoSC-Bold").fontSize(22);
    doc.fillColor(c.name[0], c.name[1], c.name[2]);
    doc.text(safeName, M, y, { width: textMaxW });

    let infoY = y + SPACING.profileName;
    doc.font("NotoSC").fontSize(11);
    doc.fillColor(c.title[0], c.title[1], c.title[2]);
    if (safeTitle) {
      doc.text(safeTitle, M, infoY, { width: textMaxW });
      infoY += SPACING.profileTitle;
    }

    doc.font("NotoSC").fontSize(10);
    doc.fillColor(c.info[0], c.info[1], c.info[2]);
    if (safeEmail) { doc.text(safeEmail, M, infoY, { width: textMaxW }); infoY += SPACING.profileInfo; }
    if (safePhone) { doc.text(safePhone, M, infoY, { width: textMaxW }); infoY += SPACING.profileInfo; }
    if (safeLocation) { doc.text(safeLocation, M, infoY, { width: textMaxW }); infoY += SPACING.profileInfo; }

    y = Math.max(y + photoH, infoY) + SPACING.profileBottom;
  }

  if (resume.modules.education && education?.length) {
    section("教育经历");

    for (const e of education) {
      const extras: string[] = [];
      if (e.gpa) extras.push(`GPA: ${e.gpa}`);
      if (e.courses && typeof e.courses === "string") { e.courses.split("\n").filter(Boolean).forEach(l => extras.push(l.trim())); }
      if (e.awards && typeof e.awards === "string") { e.awards.split("\n").filter(Boolean).forEach(l => extras.push(l.trim())); }
      if (e.highlights?.length) extras.push(...e.highlights);
      entry(e.school || "", [e.degree, e.major].filter(Boolean).join("  "), buildDates(e.startDate, e.endDate), extras);
    }
    y += SPACING.sectionBottom;
  }

  if (resume.modules.work && work?.length) {
    section("工作经历");

    for (const w of work) {
      const extras = [...(w.highlights || [])];
      if (w.description) extras.unshift(w.description);
      entry(w.company || "", w.position, buildDates(w.startDate, w.endDate), extras);
    }
    y += SPACING.sectionBottom;
  }

  if (resume.modules.internship && internship?.length) {
    section("实习经历");

    for (const i of internship) {
      const extras = [...(i.highlights || [])];
      if (i.description) extras.unshift(i.description);
      entry(i.company || "", i.position, buildDates(i.startDate, i.endDate), extras);
    }
    y += SPACING.sectionBottom;
  }

  if (resume.modules.project && project?.length) {
    section("项目经历");

    for (const p of project) {
      const extras = [...(p.highlights || [])];
      if (p.description) extras.unshift(p.description);
      entry(p.name || "", p.role, buildDates(p.startDate, p.endDate), extras);
    }
    y += SPACING.sectionBottom;
  }

  if (resume.modules.campus && campus?.length) {
    section("校园经历");

    for (const c_ of campus) {
      const extras = [...(c_.highlights || [])];
      if (c_.description) extras.unshift(c_.description);
      entry(c_.organization || "", c_.position, buildDates(c_.startDate, c_.endDate), extras);
    }
    y += SPACING.sectionBottom;
  }

  if (resume.modules.evaluation && evaluation?.content) {
    section("自我评价");

    const safeContent = (evaluation.content || "").substring(0, 2000);

    let requiredHeight = measureTextHeight(doc, safeContent, 10, PW, "NotoSC");

    const result = checkAndAddPage(doc, y, requiredHeight + SAFETY_BUFFER_PT, pageNum, resumeName, M);
    y = result.y;
    pageNum = result.pageNum;

    doc.font("NotoSC").fontSize(10);
    doc.fillColor(c.info[0], c.info[1], c.info[2]);
    doc.text(safeContent, M, y, { width: PW });
    y += requiredHeight;
  }

  return doc;
}

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

  try {
    const rawResume = await request.json();
    const validation = validateResume(rawResume);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }
    const resume = validation.resume;

    const doc = buildPdf(resume);
    const chunks: Buffer[] = [];
    
    const pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
      doc.on("data", (chunk: Buffer) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);
      doc.end();
    });

    const safeFilename = sanitizeFilename(resume.name || "简历");
    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(safeFilename)}.pdf"`,
      },
    });
  } catch (e) {
    console.error("PDF generation error:", e);
    const message = e instanceof Error ? e.message : "PDF生成失败";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
