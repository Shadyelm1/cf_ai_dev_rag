export interface Env {
  AI: any;
}

export interface DocumentChunk {
  id: string;
  content: string;
  embedding: number[];
  metadata: {
    title: string;
    url?: string;
    section?: string;
  };
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface RAGContext {
  relevantChunks: DocumentChunk[];
  query: string;
}

export interface ChatRequest {
  message: string;
  history?: ChatMessage[];
}