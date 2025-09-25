import { DocumentChunk, RAGContext } from '../types';
import { cosineSimilarity, generateEmbedding } from './vector';

export class VectorStore {
  private documents: DocumentChunk[] = [];

  addDocument(document: DocumentChunk): void {
    this.documents.push(document);
  }

  addDocuments(documents: DocumentChunk[]): void {
    this.documents.push(...documents);
  }

  async similaritySearch(
    query: string,
    ai: any,
    k: number = 5,
    threshold: number = 0.7
  ): Promise<DocumentChunk[]> {
    if (this.documents.length === 0) {
      return [];
    }

    const queryEmbedding = await generateEmbedding(query, ai);
    
    const similarities = this.documents.map(doc => ({
      document: doc,
      similarity: cosineSimilarity(queryEmbedding, doc.embedding)
    }));

    return similarities
      .filter(item => item.similarity >= threshold)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, k)
      .map(item => item.document);
  }

  getDocumentCount(): number {
    return this.documents.length;
  }

  clear(): void {
    this.documents = [];
  }
}

export function buildRAGPrompt(context: RAGContext): string {
  const contextText = context.relevantChunks
    .map((chunk, index) => `[${index + 1}] ${chunk.content}`)
    .join('\n\n');

  return `You are a helpful assistant for Cloudflare Workers documentation. Use the following context to answer the user's question. If the context doesn't contain relevant information, say so politely and provide general guidance.

Context:
${contextText}

Question: ${context.query}

Please provide a helpful and accurate response based on the context above. Include references to specific sections when relevant.`;
}