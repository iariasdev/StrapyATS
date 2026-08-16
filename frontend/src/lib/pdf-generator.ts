/**
 * Pure TypeScript Client-Side ATS PDF Generator
 * Produces standard, 100% valid PDF 1.4 documents compatible with Workday, LinkedIn, Greenhouse, Ashby.
 * Zero external npm dependencies.
 */

export interface PDFCandidateInfo {
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
}

export interface PDFCVData {
  candidate: PDFCandidateInfo;
  summary: string;
  skills: string[];
  bullets: string[];
}

function escapePdfText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    // Replace non-ASCII accents with standard equivalents for PDF Type1 Helvetica
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\x20-\x7E\n]/g, ' ');
}

function wrapText(text: string, maxCharsPerLine = 85): string[] {
  const clean = escapePdfText(text);
  const words = clean.split(/\s+/);
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    if (!word) continue;
    if ((currentLine + ' ' + word).trim().length <= maxCharsPerLine) {
      currentLine = (currentLine + ' ' + word).trim();
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

export function generateATSPdf(data: PDFCVData): { blob: Blob; base64: string } {
  const pageWidth = 595.28; // A4 points
  const pageHeight = 841.89;
  const marginX = 45;
  let cursorY = pageHeight - 50;

  const streamLines: string[] = [];

  // Helper to add text stream
  const addHeader = (text: string, size = 16) => {
    streamLines.push(`BT /F1 ${size} Tf ${marginX} ${cursorY.toFixed(2)} Td (${escapePdfText(text)}) Tj ET`);
    cursorY -= size + 6;
  };

  const addSubHeader = (text: string, size = 11) => {
    cursorY -= 4;
    streamLines.push(`BT /F1 ${size} Tf ${marginX} ${cursorY.toFixed(2)} Td (${escapePdfText(text)}) Tj ET`);
    // Draw horizontal underline rule
    const lineY = cursorY - 3;
    streamLines.push(`0.2 w ${marginX} ${lineY.toFixed(2)} m ${(pageWidth - marginX)} ${lineY.toFixed(2)} l S`);
    cursorY -= size + 8;
  };

  const addBodyText = (text: string, isBold = false, size = 9.5, lineHeight = 13) => {
    const lines = wrapText(text, 92);
    const font = isBold ? '/F1' : '/F2';
    for (const line of lines) {
      if (cursorY < 45) break; // Avoid bottom overflow
      streamLines.push(`BT ${font} ${size} Tf ${marginX} ${cursorY.toFixed(2)} Td (${line}) Tj ET`);
      cursorY -= lineHeight;
    }
  };

  const addBullet = (text: string, size = 9.5, lineHeight = 13) => {
    const lines = wrapText(text, 86);
    if (lines.length === 0) return;
    if (cursorY < 45) return;

    // Bullet symbol and first line
    streamLines.push(`BT /F1 ${size} Tf ${marginX} ${cursorY.toFixed(2)} Td (-) Tj ET`);
    streamLines.push(`BT /F2 ${size} Tf ${(marginX + 14)} ${cursorY.toFixed(2)} Td (${lines[0]}) Tj ET`);
    cursorY -= lineHeight;

    // Indented continuation lines
    for (let i = 1; i < lines.length; i++) {
      if (cursorY < 45) break;
      streamLines.push(`BT /F2 ${size} Tf ${(marginX + 14)} ${cursorY.toFixed(2)} Td (${lines[i]}) Tj ET`);
      cursorY -= lineHeight;
    }
  };

  // 1. Candidate Name & Title
  addHeader(data.candidate.name.toUpperCase(), 16);
  addBodyText(data.candidate.title, true, 11, 14);

  // 2. Contact Info Bar
  const contactParts = [
    data.candidate.email,
    data.candidate.phone,
    data.candidate.location,
    data.candidate.linkedin
  ].filter(Boolean);
  addBodyText(contactParts.join('  |  '), false, 8.5, 14);
  cursorY -= 6;

  // 3. Professional Summary
  if (data.summary) {
    addSubHeader('RESUMEN PROFESIONAL');
    addBodyText(data.summary, false, 9.5, 13);
    cursorY -= 6;
  }

  // 4. Key Technical Skills
  if (data.skills && data.skills.length > 0) {
    addSubHeader('HABILIDADES TÉCNICAS CLAVE');
    addBodyText(data.skills.join('  •  '), false, 9, 13);
    cursorY -= 6;
  }

  // 5. Experience & ATS Impact Bullets
  if (data.bullets && data.bullets.length > 0) {
    addSubHeader('EXPERIENCIA PROFESIONAL & LOGROS CLAVE');
    for (const bullet of data.bullets) {
      addBullet(bullet, 9, 12.5);
    }
  }

  const contentStream = streamLines.join('\n');
  const streamLength = contentStream.length;

  const objects = [
    `1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj`,
    `2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj`,
    `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >>\nendobj`,
    `4 0 obj\n<< /Length ${streamLength} >>\nstream\n${contentStream}\nendstream\nendobj`,
    `5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj`,
    `6 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj`
  ];

  let pdfString = `%PDF-1.4\n`;
  const xrefOffsets = [0];

  for (const obj of objects) {
    xrefOffsets.push(pdfString.length);
    pdfString += obj + `\n`;
  }

  const xrefStart = pdfString.length;
  pdfString += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;

  for (let i = 1; i <= objects.length; i++) {
    const offset = xrefOffsets[i].toString().padStart(10, '0');
    pdfString += `${offset} 00000 n \n`;
  }

  pdfString += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`;

  // Convert to ArrayBuffer / Blob / Base64
  const buffer = new Uint8Array(pdfString.length);
  for (let i = 0; i < pdfString.length; i++) {
    buffer[i] = pdfString.charCodeAt(i) & 0xff;
  }

  const blob = new Blob([buffer], { type: 'application/pdf' });

  // Base64 encoding
  let binary = '';
  for (let i = 0; i < buffer.byteLength; i++) {
    binary += String.fromCharCode(buffer[i]);
  }
  const base64 = btoa(binary);

  return { blob, base64 };
}
