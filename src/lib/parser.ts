import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

export interface ParseResult {
  text: string;
  error?: string;
}

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  const pdfModule = require('pdf-parse');

  // Case 1: pdf-parse v2.x PDFParse Class API
  if (pdfModule?.PDFParse) {
    const parser = new pdfModule.PDFParse({ data: buffer });
    try {
      const result = await parser.getText();
      const extractedText = typeof result === 'string' ? result : result?.text || '';
      if (typeof parser.destroy === 'function') {
        await parser.destroy();
      }
      return extractedText;
    } catch (err) {
      if (typeof parser.destroy === 'function') {
        await parser.destroy();
      }
      throw err;
    }
  }

  // Case 2: pdf-parse v1.x Legacy Function API
  const pdfFn =
    typeof pdfModule === 'function'
      ? pdfModule
      : pdfModule?.default || pdfModule?.pdfParse;

  if (typeof pdfFn === 'function') {
    const result = await pdfFn(buffer);
    return typeof result === 'string' ? result : result?.text || '';
  }

  throw new Error('No compatible PDF parser function found in pdf-parse module.');
}

async function extractTextFromDocx(buffer: Buffer): Promise<string> {
  const mammoth = require('mammoth');
  const extractFn = mammoth?.extractRawText || mammoth?.default?.extractRawText;

  if (typeof extractFn !== 'function') {
    throw new Error('Mammoth DOCX parser module could not be initialized.');
  }

  const result = await extractFn({ buffer });
  return result?.value ? result.value.trim() : '';
}

export async function parseResumeFile(file: File): Promise<ParseResult> {
  // 1. Size Validation
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      text: '',
      error: 'File size exceeds the 5MB limit. Please upload a smaller resume file.',
    };
  }

  const fileName = file.name.toLowerCase();
  const fileBuffer = Buffer.from(await file.arrayBuffer());

  try {
    // 2. PDF Parsing
    if (fileName.endsWith('.pdf') || file.type === 'application/pdf') {
      try {
        const extractedText = (await extractTextFromPdf(fileBuffer)).trim();

        if (!extractedText || extractedText.length < 20) {
          return {
            text: '',
            error: 'Could not extract text from this PDF. It might be an image-only scan or password-protected.',
          };
        }

        return { text: extractedText };
      } catch (err: any) {
        console.error('PDF Parsing Failure:', err);
        if (err?.message?.includes('encrypted') || err?.name === 'PasswordException' || err?.message?.includes('Password')) {
          return {
            text: '',
            error: 'This PDF file is password-protected. Please remove the password and try again.',
          };
        }
        return {
          text: '',
          error: `Failed to read PDF file: ${err?.message || 'Invalid or corrupted PDF format.'}`,
        };
      }
    }

    // 3. DOCX Parsing
    if (
      fileName.endsWith('.docx') ||
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.type === 'application/msword'
    ) {
      try {
        const extractedText = (await extractTextFromDocx(fileBuffer)).trim();

        if (!extractedText || extractedText.length < 20) {
          return {
            text: '',
            error: 'Could not extract readable text from this Word document. Please ensure it contains text.',
          };
        }

        return { text: extractedText };
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
      error: 'Unsupported file format. Please upload a .pdf or .docx document.',
    };
  } catch (globalErr: any) {
    console.error('Global Parsing Error:', globalErr);
    return {
      text: '',
      error: globalErr?.message || 'An unexpected error occurred while parsing the document.',
    };
  }
}
