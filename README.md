# Cloudflare Workers RAG Assistant

A RAG (Retrieval-Augmented Generation) powered documentation assistant built with Cloudflare Workers AI. This project demonstrates how to build an intelligent chatbot that can answer questions about Cloudflare Workers using vector similarity search and AI-powered responses.

## Features

-  **RAG Pipeline**: Retrieves relevant documentation chunks and generates contextual responses
-  **Workers AI Integration**: Uses `@cf/baai/bge-base-en-v1.5` for embeddings and `@cf/meta/llama-3.1-8b-instruct` for chat
-  **Vector Similarity Search**: Cosine similarity-based document retrieval
-  **Streaming Responses**: Real-time streaming chat interface
-  **Clean UI**: Modern chat interface with Cloudflare branding
-  **Edge Computing**: Runs on Cloudflare's global network for low latency

## Architecture

```
User Query → Embedding Generation → Vector Search → Context Retrieval → LLM Generation → Streaming Response
```

1. **Vector Store**: Pre-computed embeddings of Cloudflare Workers documentation
2. **Similarity Search**: Finds most relevant documentation chunks using cosine similarity
3. **RAG Prompt**: Combines retrieved context with user query
4. **AI Generation**: Streams response using Llama 3.1 8B model

## Project Structure

```
src/
├── index.ts              # Main Worker with chat API and frontend
├── types/index.ts        # TypeScript interfaces
├── utils/
│   ├── vector.ts         # Vector similarity functions
│   └── rag.ts           # RAG pipeline and vector store
└── data/
    └── docs.ts          # Sample documentation chunks

wrangler.toml             # Cloudflare Workers configuration
tsconfig.json            # TypeScript configuration
```

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure Wrangler:**
   ```bash
   npx wrangler login
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to `http://localhost:8787` to interact with the chat assistant

## API Endpoints

### `POST /api/chat`
Chat with the RAG assistant.

**Request:**
```json
{
  "message": "How do I use Workers AI?",
  "history": [
    {"role": "user", "content": "Previous message"},
    {"role": "assistant", "content": "Previous response"}
  ]
}
```

**Response:**
Streaming text response with relevant context-aware answers.

### `GET /api/health`
Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "documentsLoaded": 8
}
```

## Deployment

1. **Deploy to Cloudflare:**
   ```bash
   npm run deploy
   ```

2. **Your app will be available at:**
   `https://cf-ai-dev-rag.<your-subdomain>.workers.dev`

## Customization

### Adding More Documentation

1. **Extend `src/data/docs.ts`** with additional documentation chunks:

```typescript
{
  id: 'unique-doc-id',
  content: 'Documentation content...',
  metadata: {
    title: 'Document Title',
    url: 'https://docs.example.com/path',
    section: 'Category'
  }
}
```

2. **Embeddings are generated automatically** when the Worker first starts.

### Adjusting Search Parameters

In `src/index.ts`, modify the similarity search parameters:

```typescript
const relevantChunks = await store.similaritySearch(
  message, 
  env.AI, 
  3,    // Number of chunks to retrieve
  0.5   // Similarity threshold (0-1)
);
```

### Switching AI Models

Update the model in `src/utils/vector.ts` and `src/index.ts`:

```typescript
// For embeddings
await ai.run('@cf/baai/bge-base-en-v1.5', { text: [text] });

// For chat
await env.AI.run('@cf/meta/llama-3.1-8b-instruct', { messages, stream: true });
```

## Technical 

- **Vector Similarity**: Uses cosine similarity for semantic search
- **Embedding Model**: BGE Base English v1.5 (768-dimensional embeddings)
- **Chat Model**: Llama 3.1 8B Instruct
- **Frontend**: Vanilla JavaScript with streaming fetch API
- **TypeScript**: Fully typed with Cloudflare Workers types

## Performance

- **Cold Start**: ~2-3 seconds for initial embedding generation
- **Warm Requests**: ~200-500ms for similarity search + generation
- **Memory Usage**: Minimal, embeddings stored in Worker memory
- **Scalability**: Automatically scales with Cloudflare Workers

