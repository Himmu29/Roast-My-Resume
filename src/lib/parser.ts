import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

export interface ParseResult {
  text: string;
  buffer?: Buffer;
  mimeType?: string;
  error?: string;
}

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

function isPdfBuffer(buffer: Buffer): boolean {
  if (buffer.length < 5) return false;
  return (
    buffer[0] === 0x25 && // %
    buffer[1] === 0x50 && // P
    buffer[2] === 0x44 && // D
    buffer[3] === 0x46 && // F
    buffer[4] === 0x2d    // -
  );
}

function isDocxBuffer(buffer: Buffer): boolean {
  if (buffer.length < 4) return false;
  return (
    buffer[0] === 0x50 && // P
    buffer[1] === 0x4b && // K
    buffer[2] === 0x03 &&
    buffer[3] === 0x04
  );
}

async function loadPdfModule(): Promise<any> {
  try {
    const mod = await import('pdf-parse');
    return mod?.default || mod;
  } catch {
    try {
      return require('pdf-parse');
    } catch {
      return null;
    }
  }
}

async function loadMammothModule(): Promise<any> {
  try {
    const mod = await import('mammoth');
    return mod?.default || mod;
  } catch {
    try {
      return require('mammoth');
    } catch {
      return null;
    }
  }
}

function customPageRender(pageData: any) {
  if (!pageData || typeof pageData.getTextContent !== 'function') {
    return Promise.resolve('');
  }
  return pageData
    .getTextContent({ normalizeWhitespace: true })
    .then((textContent: any) => {
      let lastY: number | null = null;
      let text = '';

      const items = (textContent?.items || []).slice().sort((a: any, b: any) => {
        if (
          !a?.transform ||
          !b?.transform ||
          !Array.isArray(a.transform) ||
          !Array.isArray(b.transform) ||
          a.transform.length < 6 ||
          b.transform.length < 6
        ) {
          return 0;
        }
        const yDiff = b.transform[5] - a.transform[5];
        if (Math.abs(yDiff) > 6) {
          return yDiff;
        }
        return a.transform[4] - b.transform[4];
      });

      for (const item of items) {
        if (!item || typeof item.str !== 'string') continue;
        const currentY = Array.isArray(item.transform) && item.transform.length >= 6 ? item.transform[5] : null;
        if (lastY == null || (currentY != null && Math.abs(currentY - lastY) > 6)) {
          text += '\n' + item.str;
        } else {
          text += ' ' + item.str;
        }
        if (currentY != null) lastY = currentY;
      }
      return text;
    })
    .catch(() => '');
}

async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  const pdfModule = await loadPdfModule();
  if (!pdfModule) {
    throw new Error('PDF parsing module unavailable.');
  }

  // Case 1: pdf-parse v2.x PDFParse Class API
  if (pdfModule?.PDFParse) {
    const parser = new pdfModule.PDFParse({ data: buffer, pagerender: customPageRender });
    try {
      const result = await parser.getText();
      const extractedText = typeof result === 'string' ? result : result?.text || '';
      if (typeof parser.destroy === 'function') {
        await parser.destroy();
      }
      return extractedText;
    } catch (err) {
      if (typeof parser.destroy === 'function') {
        try {
          await parser.destroy();
        } catch {}
      }
      // Fallback without custom render if error occurs
      try {
        const simpleParser = new pdfModule.PDFParse({ data: buffer });
        const fallbackResult = await simpleParser.getText();
        if (typeof simpleParser.destroy === 'function') {
          try {
            await simpleParser.destroy();
          } catch {}
        }
        return typeof fallbackResult === 'string' ? fallbackResult : fallbackResult?.text || '';
      } catch {
        throw err;
      }
    }
  }

  // Case 2: pdf-parse v1.x Legacy Function API
  const pdfFn =
    typeof pdfModule === 'function'
      ? pdfModule
      : pdfModule?.default || pdfModule?.pdfParse;

  if (typeof pdfFn === 'function') {
    try {
      const result = await pdfFn(buffer, { pagerender: customPageRender });
      return typeof result === 'string' ? result : result?.text || '';
    } catch {
      const result = await pdfFn(buffer);
      return typeof result === 'string' ? result : result?.text || '';
    }
  }

  throw new Error('No compatible PDF parser function found in pdf-parse module.');
}

async function extractTextFromDocx(buffer: Buffer): Promise<string> {
  const mammoth = await loadMammothModule();
  const extractFn = mammoth?.extractRawText || mammoth?.default?.extractRawText;

  if (typeof extractFn !== 'function') {
    throw new Error('Mammoth DOCX parser module could not be initialized.');
  }

  const result = await extractFn({ buffer });
  return result?.value ? result.value.trim() : '';
}

export async function parseResumeFile(file: File): Promise<ParseResult> {
  if (!file || typeof file.arrayBuffer !== 'function') {
    return {
      text: '',
      error: 'Invalid file upload received.',
    };
  }

  // 1. Size Validation
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      text: '',
      error: 'File size exceeds the 5MB limit. Please upload a smaller resume file.',
    };
  }

  if (file.size === 0) {
    return {
      text: '',
      error: 'The uploaded file is empty (0 bytes). Please select a valid document.',
    };
  }

  const fileName = (file.name || '').toLowerCase();
  const fileBuffer = Buffer.from(await file.arrayBuffer());

  try {
    const isPdf = fileName.endsWith('.pdf') || file.type === 'application/pdf' || isPdfBuffer(fileBuffer);
    const isDocx =
      fileName.endsWith('.docx') ||
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.type === 'application/msword' ||
      isDocxBuffer(fileBuffer);

    // 2. PDF Parsing & Visual Fallback
    if (isPdf) {
      try {
        const extractedText = (await extractTextFromPdf(fileBuffer)).trim();
        return {
          text: extractedText,
          buffer: fileBuffer,
          mimeType: 'application/pdf',
        };
      } catch (err: any) {
        console.error('PDF Parsing Warning:', err?.message || err);

        if (
          err?.message?.includes('encrypted') ||
          err?.name === 'PasswordException' ||
          err?.message?.includes('Password')
        ) {
          return {
            text: '',
            error: 'This PDF file is password-protected. Please remove the password and try again.',
          };
        }

        // Fail-safe: If fileBuffer is a valid PDF, pass buffer directly to Gemini for multimodal visual parsing
        if (isPdfBuffer(fileBuffer)) {
          console.warn('Falling back to direct Gemini multimodal PDF processing.');
          return {
            text: '',
            buffer: fileBuffer,
            mimeType: 'application/pdf',
          };
        }

        return {
          text: '',
          error: `Failed to read PDF file: ${err?.message || 'Invalid or corrupted PDF format.'}`,
        };
      }
    }

    // 3. DOCX Parsing
    if (isDocx) {
      try {
        const extractedText = (await extractTextFromDocx(fileBuffer)).trim();

        if (!extractedText || extractedText.length < 15) {
          return {
            text: '',
            error: 'Could not extract readable text from this Word document. Please ensure it contains readable text.',
          };
        }

        return {
          text: extractedText,
          buffer: fileBuffer,
          mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        };
      } catch (err: any) {
        console.error('DOCX Parsing Failure:', err);
        return {
          text: '',
          error: `Failed to read DOCX file: ${err?.message || 'Corrupted or unreadable format.'}`,
        };
      }
    }

    return {
      text: '',
      error: 'Unsupported file format. Please upload a valid .pdf or .docx document.',
    };
  } catch (globalErr: any) {
    console.error('Global Parsing Error:', globalErr);
    return {
      text: '',
      error: globalErr?.message || 'An unexpected error occurred while parsing the document.',
    };
  }
}
