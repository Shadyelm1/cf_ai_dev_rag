import { Env, ChatRequest, DocumentChunk } from './types';
import { VectorStore, buildRAGPrompt } from './utils/rag';
import { generateEmbedding } from './utils/vector';
import { sampleDocuments } from './data/docs';

let vectorStore: VectorStore | null = null;

async function initializeVectorStore(env: Env): Promise<VectorStore> {
  if (vectorStore) {
    return vectorStore;
  }

  console.log('Initializing vector store...');
  vectorStore = new VectorStore();

  const documentsWithEmbeddings: DocumentChunk[] = [];
  
  for (const doc of sampleDocuments) {
    console.log(`Generating embedding for: ${doc.metadata.title}`);
    const embedding = await generateEmbedding(doc.content, env.AI);
    documentsWithEmbeddings.push({
      ...doc,
      embedding
    });
  }

  vectorStore.addDocuments(documentsWithEmbeddings);
  console.log(`Vector store initialized with ${vectorStore.getDocumentCount()} documents`);
  
  return vectorStore;
}

async function handleChatRequest(request: Request, env: Env): Promise<Response> {
  try {
    const { message, history = [] }: ChatRequest = await request.json();

    if (!message || typeof message !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Message is required and must be a string' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const store = await initializeVectorStore(env);
    const relevantChunks = await store.similaritySearch(message, env.AI, 3, 0.5);

    console.log(`Found ${relevantChunks.length} relevant chunks for query: "${message}"`);

    const ragPrompt = buildRAGPrompt({
      relevantChunks,
      query: message
    });

    const messages = [
      { role: 'system' as const, content: ragPrompt },
      ...history,
      { role: 'user' as const, content: message }
    ];

    const response = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
      messages,
      stream: true
    });

    return new Response(response, {
      headers: {
        'Content-Type': 'text/plain',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Cache-Control': 'no-cache'
      }
    });

  } catch (error) {
    console.error('Chat request error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    );
  }
}

async function handleOptionsRequest(): Promise<Response> {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400'
    }
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return handleOptionsRequest();
    }

    if (url.pathname === '/api/chat' && request.method === 'POST') {
      return handleChatRequest(request, env);
    }

    if (url.pathname === '/api/health' && request.method === 'GET') {
      return new Response(
        JSON.stringify({ 
          status: 'healthy',
          documentsLoaded: vectorStore ? vectorStore.getDocumentCount() : 0
        }),
        { 
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      );
    }

    if (url.pathname === '/' && request.method === 'GET') {
      const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cloudflare Workers RAG Assistant</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            background: #f5f5f5;
            height: 100vh;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            height: 100vh;
            display: flex;
            flex-direction: column;
            background: white;
        }
        .header {
            padding: 20px;
            border-bottom: 1px solid #e0e0e0;
            background: #ff6600;
            color: white;
        }
        .chat-container {
            flex: 1;
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }
        .messages {
            flex: 1;
            overflow-y: auto;
            padding: 20px;
            display: flex;
            flex-direction: column;
            gap: 15px;
        }
        .message {
            max-width: 70%;
            padding: 12px 16px;
            border-radius: 18px;
            word-wrap: break-word;
        }
        .message.user {
            align-self: flex-end;
            background: #ff6600;
            color: white;
        }
        .message.assistant {
            align-self: flex-start;
            background: #f0f0f0;
            color: #333;
        }
        .message.loading {
            background: #f0f0f0;
            color: #666;
        }
        .input-container {
            padding: 20px;
            border-top: 1px solid #e0e0e0;
            display: flex;
            gap: 10px;
        }
        .input-field {
            flex: 1;
            padding: 12px 16px;
            border: 2px solid #e0e0e0;
            border-radius: 25px;
            outline: none;
            font-size: 16px;
        }
        .input-field:focus {
            border-color: #ff6600;
        }
        .send-button {
            padding: 12px 24px;
            background: #ff6600;
            color: white;
            border: none;
            border-radius: 25px;
            cursor: pointer;
            font-size: 16px;
            font-weight: 600;
        }
        .send-button:hover:not(:disabled) {
            background: #e55a00;
        }
        .send-button:disabled {
            background: #ccc;
            cursor: not-allowed;
        }
        .typing-indicator {
            display: inline-block;
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #666;
            animation: typing 1.4s infinite ease-in-out;
        }
        .typing-indicator:nth-child(1) { animation-delay: -0.32s; }
        .typing-indicator:nth-child(2) { animation-delay: -0.16s; }
        @keyframes typing {
            0%, 80%, 100% { transform: scale(0); }
            40% { transform: scale(1); }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>loudflare Workers RAG Assistant</h1>
            <p>Ask me anything about Cloudflare Workers!</p>
        </div>
        
        <div class="chat-container">
            <div id="messages" class="messages">
                <div class="message assistant">
                    Hello! I'm your Cloudflare Workers documentation assistant. I can help you with questions about Workers, AI, bindings, storage, and more. What would you like to know?
                </div>
            </div>
            
            <div class="input-container">
                <input 
                    type="text" 
                    id="messageInput" 
                    class="input-field" 
                    placeholder="Ask about Cloudflare Workers..."
                    maxlength="500"
                >
                <button id="sendButton" class="send-button">Send</button>
            </div>
        </div>
    </div>

    <script>
        class ChatApp {
            constructor() {
                this.messages = document.getElementById('messages');
                this.messageInput = document.getElementById('messageInput');
                this.sendButton = document.getElementById('sendButton');
                this.history = [];
                
                this.setupEventListeners();
            }

            setupEventListeners() {
                this.sendButton.addEventListener('click', () => this.sendMessage());
                this.messageInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        this.sendMessage();
                    }
                });
            }

            async sendMessage() {
                const message = this.messageInput.value.trim();
                if (!message) return;

                this.addMessage('user', message);
                this.messageInput.value = '';
                this.setLoading(true);

                const loadingMessage = this.addMessage('assistant', '', true);

                try {
                    const response = await fetch('/api/chat', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            message,
                            history: this.history
                        })
                    });

                    if (!response.ok) {
                        throw new Error(\`HTTP error! status: \${response.status}\`);
                    }

                    const reader = response.body.getReader();
                    const decoder = new TextDecoder();
                    let assistantResponse = '';

                    loadingMessage.classList.remove('loading');
                    
                    while (true) {
                        const { value, done } = await reader.read();
                        if (done) break;

                        const chunk = decoder.decode(value, { stream: true });
                        assistantResponse += chunk;
                        loadingMessage.textContent = assistantResponse;
                        this.scrollToBottom();
                    }

                    this.history.push({ role: 'user', content: message });
                    this.history.push({ role: 'assistant', content: assistantResponse });

                    if (this.history.length > 10) {
                        this.history = this.history.slice(-10);
                    }

                } catch (error) {
                    loadingMessage.textContent = 'Sorry, I encountered an error processing your request. Please try again.';
                    loadingMessage.classList.remove('loading');
                    console.error('Error:', error);
                }

                this.setLoading(false);
            }

            addMessage(role, content, isLoading = false) {
                const messageDiv = document.createElement('div');
                messageDiv.className = \`message \${role}\`;
                
                if (isLoading) {
                    messageDiv.classList.add('loading');
                    messageDiv.innerHTML = \`
                        <span class="typing-indicator"></span>
                        <span class="typing-indicator"></span>
                        <span class="typing-indicator"></span>
                    \`;
                } else {
                    messageDiv.textContent = content;
                }

                this.messages.appendChild(messageDiv);
                this.scrollToBottom();
                return messageDiv;
            }

            setLoading(isLoading) {
                this.sendButton.disabled = isLoading;
                this.messageInput.disabled = isLoading;
            }

            scrollToBottom() {
                this.messages.scrollTop = this.messages.scrollHeight;
            }
        }

        document.addEventListener('DOMContentLoaded', () => {
            new ChatApp();
        });
    </script>
</body>
</html>`;
      return new Response(html, {
        headers: { 'Content-Type': 'text/html' }
      });
    }

    return new Response('Not Found', { status: 404 });
  }
};
