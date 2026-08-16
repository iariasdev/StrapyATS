/**
 * Pure TypeScript Client-Side Multi-Page ATS PDF Generator
 * Produces standard, 100% valid PDF 1.4 documents compatible with Workday, LinkedIn, Greenhouse, Ashby.
 * Fully supports multi-experience, education, categorized skills, and certifications across multiple pages.
 * Zero external npm dependencies.
 */

import { WorkExperience, EducationItem, CategorizedSkills } from './types';

export interface PDFCandidateInfo {
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github?: string;
  portfolio?: string;
}

export interface PDFCVData {
  candidate: PDFCandidateInfo;
  summary: string;
  skills_categories?: CategorizedSkills;
  skills?: string[];
  experiences?: WorkExperience[];
  bullets?: string[];
  education?: EducationItem[];
  certificaciones?: string[];
  languages_spoken?: string[];
}

function escapePdfText(text: string): string {
  if (!text) return '';
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
  const bottomLimit = 55;
  
  let cursorY = pageHeight - 50;
  const pagesStreams: string[][] = [[]];
  let currentPageIndex = 0;

  const currentStream = () => pagesStreams[currentPageIndex];

  const checkPageBreak = (neededSpace = 30) => {
    if (cursorY - neededSpace < bottomLimit) {
      // Close current page and start next page
      pagesStreams.push([]);
      currentPageIndex++;
      cursorY = pageHeight - 50;
    }
  };

  const addHeader = (text: string, size = 16) => {
    checkPageBreak(size + 15);
    currentStream().push(`BT /F1 ${size} Tf ${marginX} ${cursorY.toFixed(2)} Td (${escapePdfText(text)}) Tj ET`);
    cursorY -= size + 6;
  };

  const addSubHeader = (text: string, size = 10.5) => {
    checkPageBreak(size + 20);
    cursorY -= 4;
    currentStream().push(`BT /F1 ${size} Tf ${marginX} ${cursorY.toFixed(2)} Td (${escapePdfText(text)}) Tj ET`);
    const lineY = cursorY - 3;
    currentStream().push(`0.2 w ${marginX} ${lineY.toFixed(2)} m ${(pageWidth - marginX)} ${lineY.toFixed(2)} l S`);
    cursorY -= size + 8;
  };

  const addBodyText = (text: string, isBold = false, size = 9, lineHeight = 12.5) => {
    const lines = wrapText(text, 92);
    const font = isBold ? '/F1' : '/F2';
    for (const line of lines) {
      checkPageBreak(lineHeight);
      currentStream().push(`BT ${font} ${size} Tf ${marginX} ${cursorY.toFixed(2)} Td (${line}) Tj ET`);
      cursorY -= lineHeight;
    }
  };

  const addBullet = (text: string, size = 9, lineHeight = 12.5) => {
    const lines = wrapText(text, 86);
    if (lines.length === 0) return;
    
    checkPageBreak(lineHeight);
    currentStream().push(`BT /F1 ${size} Tf ${marginX} ${cursorY.toFixed(2)} Td (-) Tj ET`);
    currentStream().push(`BT /F2 ${size} Tf ${(marginX + 14)} ${cursorY.toFixed(2)} Td (${lines[0]}) Tj ET`);
    cursorY -= lineHeight;

    for (let i = 1; i < lines.length; i++) {
      checkPageBreak(lineHeight);
      currentStream().push(`BT /F2 ${size} Tf ${(marginX + 14)} ${cursorY.toFixed(2)} Td (${lines[i]}) Tj ET`);
      cursorY -= lineHeight;
    }
  };

  // 1. Candidate Name & Title
  addHeader((data.candidate.name || 'Candidato').toUpperCase(), 16);
  addBodyText(data.candidate.title || 'Software Engineer', true, 11, 14);

  // 2. Contact Info Bar
  const contactParts = [
    data.candidate.location,
    data.candidate.phone,
    data.candidate.email,
    data.candidate.linkedin,
    data.candidate.github,
    data.candidate.portfolio
  ].filter(Boolean);
  addBodyText(contactParts.join('  |  '), false, 8, 13);
  cursorY -= 4;

  // 3. Professional Summary
  if (data.summary) {
    addSubHeader('RESUMEN PROFESIONAL');
    addBodyText(data.summary, false, 9, 12.5);
    cursorY -= 4;
  }

  // 4. Categorized Technical Skills
  const cats = data.skills_categories;
  if (cats && (cats.languages?.length || cats.frontend?.length || cats.backend_cloud?.length || cats.testing_tools?.length)) {
    addSubHeader('HABILIDADES & COMPETENCIAS CLAVE');
    if (cats.languages && cats.languages.length > 0) {
      addBodyText(`Lenguajes / Idiomas: ${cats.languages.join(', ')}`, false, 8.5, 12);
    }
    if (cats.frontend && cats.frontend.length > 0) {
      addBodyText(`Competencias Principales: ${cats.frontend.join(', ')}`, false, 8.5, 12);
    }
    if (cats.backend_cloud && cats.backend_cloud.length > 0) {
      addBodyText(`Herramientas & Tecnologias: ${cats.backend_cloud.join(', ')}`, false, 8.5, 12);
    }
    if (cats.testing_tools && cats.testing_tools.length > 0) {
      addBodyText(`Metodologias & Gestion: ${cats.testing_tools.join(', ')}`, false, 8.5, 12);
    }
    cursorY -= 4;
  } else if (data.skills && data.skills.length > 0) {
    addSubHeader('HABILIDADES & COMPETENCIAS');
    addBodyText(data.skills.join('  •  '), false, 8.5, 12);
    cursorY -= 4;
  }

  // 5. Work Experience & Projects
  if (data.experiences && data.experiences.length > 0) {
    addSubHeader('EXPERIENCIA LABORAL & PROYECTOS DESTACADOS');
    for (const exp of data.experiences) {
      checkPageBreak(30);
      const meta = [exp.period, exp.location].filter(Boolean).join('  •  ');
      addBodyText(`${exp.role.toUpperCase()}  |  ${exp.company}`, true, 9.5, 13);
      if (meta) {
        addBodyText(meta, false, 8, 11);
      }
      cursorY -= 2;
      for (const bullet of exp.bullets) {
        addBullet(bullet, 8.5, 11.5);
      }
      cursorY -= 4;
    }
  } else if (data.bullets && data.bullets.length > 0) {
    addSubHeader('EXPERIENCIA PROFESIONAL & LOGROS CLAVE');
    for (const bullet of data.bullets) {
      addBullet(bullet, 8.5, 11.5);
    }
    cursorY -= 4;
  }

  // 6. Education
  if (data.education && data.education.length > 0) {
    addSubHeader('EDUCACION');
    for (const edu of data.education) {
      checkPageBreak(25);
      const eduHeader = `${edu.degree}  -  ${edu.institution}`;
      addBodyText(eduHeader, true, 9, 12);
      if (edu.period) {
        addBodyText(edu.period, false, 8, 11);
      }
      if (edu.details) {
        addBodyText(edu.details, false, 8, 11);
      }
      cursorY -= 3;
    }
    cursorY -= 2;
  }

  // 7. Certifications & Additional
  if ((data.certificaciones && data.certificaciones.length > 0) || (data.languages_spoken && data.languages_spoken.length > 0)) {
    addSubHeader('CERTIFICACIONES & ADICIONALES');
    if (data.certificaciones) {
      for (const cert of data.certificaciones) {
        addBullet(cert, 8.5, 11.5);
      }
    }
    if (data.languages_spoken) {
      for (const lang of data.languages_spoken) {
        addBullet(`Idiomas: ${lang}`, 8.5, 11.5);
      }
    }
  }

  // Multi-Page PDF Construction
  const numPages = pagesStreams.length;
  const objects: string[] = [];
  
  // Object 1: Catalog
  objects.push(`1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj`);

  // Object 2: Pages (Kids array)
  // Page objects will be indexed from 3 to 2 + numPages
  const kidsReferences = Array.from({ length: numPages }, (_, i) => `${3 + i} 0 R`).join(' ');
  objects.push(`2 0 obj\n<< /Type /Pages /Kids [${kidsReferences}] /Count ${numPages} >>\nendobj`);

  // Font Objects: Place them after all Pages and Content Streams
  const font1ObjNum = 3 + numPages * 2;
  const font2ObjNum = font1ObjNum + 1;

  // Generate Page & Content Stream objects for each page
  for (let i = 0; i < numPages; i++) {
    const pageObjNum = 3 + i;
    const streamObjNum = 3 + numPages + i;
    const streamContent = pagesStreams[i].join('\n');
    const streamLength = streamContent.length;

    // Page Object
    objects.push(
      `${pageObjNum} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Contents ${streamObjNum} 0 R /Resources << /Font << /F1 ${font1ObjNum} 0 R /F2 ${font2ObjNum} 0 R >> >> >>\nendobj`
    );
  }

  for (let i = 0; i < numPages; i++) {
    const streamObjNum = 3 + numPages + i;
    const streamContent = pagesStreams[i].join('\n');
    const streamLength = streamContent.length;

    // Stream Object
    objects.push(
      `${streamObjNum} 0 obj\n<< /Length ${streamLength} >>\nstream\n${streamContent}\nendstream\nendobj`
    );
  }

  // Fonts
  objects.push(`${font1ObjNum} 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj`);
  objects.push(`${font2ObjNum} 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj`);

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

  let binary = '';
  for (let i = 0; i < buffer.byteLength; i++) {
    binary += String.fromCharCode(buffer[i]);
  }
  const base64 = btoa(binary);

  return { blob, base64 };
}
