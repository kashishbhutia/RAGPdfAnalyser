import { config } from '../config';
import { IChunk } from '../types';

export class ChunkingService {
  private chunkSize: number;
  private chunkOverlap: number;
  private separators: string[];

  constructor() {
    this.chunkSize = config.chunking.chunkSize;
    this.chunkOverlap = config.chunking.chunkOverlap;
    this.separators = ['\n\n', '\n', '. ', ', ', ' ', ''];
  }

  chunkText(text: string, documentId: string, pages: string[]): IChunk[] {
    const chunks: IChunk[] = [];
    let globalChunkIndex = 0;

    for (let pageIdx = 0; pageIdx < pages.length; pageIdx++) {
      const pageText = pages[pageIdx].trim();
      if (!pageText) continue;

      const pageChunks = this.recursiveSplit(pageText);

      for (const chunkText of pageChunks) {
        if (chunkText.trim().length < 10) continue;

        chunks.push({
          content: chunkText.trim(),
          metadata: {
            documentId,
            pageNumber: pageIdx + 1,
            chunkIndex: globalChunkIndex++,
          },
        });
      }
    }

    return chunks;
  }

  private recursiveSplit(text: string, separatorIdx = 0): string[] {
    if (text.length <= this.chunkSize) {
      return [text];
    }

    if (separatorIdx >= this.separators.length) {
      return this.hardSplit(text);
    }

    const separator = this.separators[separatorIdx];
    const parts = separator ? text.split(separator) : [text];

    if (parts.length <= 1) {
      return this.recursiveSplit(text, separatorIdx + 1);
    }

    const result: string[] = [];
    let currentChunk = '';

    for (const part of parts) {
      const withSeparator = currentChunk
        ? currentChunk + separator + part
        : part;

      if (withSeparator.length <= this.chunkSize) {
        currentChunk = withSeparator;
      } else {
        if (currentChunk) {
          result.push(currentChunk);
        }

        if (part.length > this.chunkSize) {
          const subChunks = this.recursiveSplit(part, separatorIdx + 1);
          result.push(...subChunks.slice(0, -1));
          currentChunk = subChunks[subChunks.length - 1] || '';
        } else {
          currentChunk = part;
        }
      }
    }

    if (currentChunk) {
      result.push(currentChunk);
    }

    return this.applyOverlap(result);
  }


  private hardSplit(text: string): string[] {
    const chunks: string[] = [];
    let start = 0;

    while (start < text.length) {
      const end = Math.min(start + this.chunkSize, text.length);
      chunks.push(text.substring(start, end));
      start += this.chunkSize - this.chunkOverlap;
    }

    return chunks;
  }


  private applyOverlap(chunks: string[]): string[] {
    if (chunks.length <= 1 || this.chunkOverlap <= 0) return chunks;

    const result: string[] = [];

    result.push(chunks[0]);

    for (let i = 1; i < chunks.length; i++) {
      const prevChunk = chunks[i - 1];
      const overlapText = prevChunk.substring(
        Math.max(0, prevChunk.length - this.chunkOverlap)
      );
      result.push(overlapText + ' ' + chunks[i]);
    }

    return result;
  }
}

export const chunkingService = new ChunkingService();
