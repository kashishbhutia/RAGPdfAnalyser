import fs from 'fs';
import pdfParse from 'pdf-parse';

export interface PDFExtractResult {
  text: string;
  pageCount: number;
  info: Record<string, any>;
}

export class PDFService {

  async extractText(filePath: string): Promise<PDFExtractResult> {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);

    return {
      text: data.text,
      pageCount: data.numpages,
      info: data.info || {},
    };
  }


  async extractTextByPages(filePath: string): Promise<{ pages: string[]; pageCount: number }> {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);

    const fullText = data.text;
    const pageCount = data.numpages;

    let pages = fullText.split(/\f/);


    // if proper split doesn't happen
    if (pages.length < pageCount && pageCount > 1) {
      const avgCharsPerPage = Math.ceil(fullText.length / pageCount);
      pages = [];
      for (let i = 0; i < fullText.length; i += avgCharsPerPage) {
        pages.push(fullText.substring(i, i + avgCharsPerPage));
      }
    }

    return { pages, pageCount };
  }
}

export const pdfService = new PDFService();
