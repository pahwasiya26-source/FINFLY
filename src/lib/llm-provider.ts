export interface LLMProvider {
  name: string;
  isConfigured(): boolean;
  generateResponse(prompt: string, context?: any): Promise<string>;
  callTool(toolName: string, args: any): Promise<any>;
}

function assertServerSide() {
  if (typeof window !== 'undefined') {
    throw new Error(
      '[FINEXFLY Security Violation] AI provider keys and LLM execution must strictly remain server-side.'
    );
  }
}

export class GeminiProvider implements LLMProvider {
  name = "Gemini";

  private getApiKey(): string | null {
    assertServerSide();
    return process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || null;
  }

  isConfigured(): boolean {
    const key = this.getApiKey();
    return Boolean(key && key.trim().length > 0 && !key.includes('your_gemini_api_key'));
  }

  async generateResponse(prompt: string, context?: any): Promise<string> {
    const apiKey = this.getApiKey();
    if (!apiKey || !this.isConfigured()) {
      throw new Error("AI service is not configured. Please configure the server-side AI provider (GEMINI_API_KEY).");
    }

    const systemInstructionText =
      "You are FINEXFLY AI Finance Controller and Personal CA. " +
      "FINEXFLY adheres to strict deterministic financial accounting. " +
      "CRITICAL: You must NEVER invent, assume, or modify any financial numbers or balances. " +
      "All calculations, balances, tax amounts, and runway metrics are strictly pre-computed by deterministic engines. " +
      "Your sole role is to interpret, explain, and contextualize the verified outputs clearly, concisely, and professionally. " +
      "Provide 2-4 sentences of executive interpretation followed by 3-5 bullet points summarizing key takeaways.";

    const contextString = context ? `\nVerified Financial Context:\n${JSON.stringify(context, null, 2)}` : '';
    const fullPrompt = `${prompt}${contextString}`;

    // Use Gemini 2.5 Flash with fallback to 1.5 Flash
    const models = ['gemini-2.5-flash', 'gemini-1.5-flash'];
    let lastError: any = null;

    for (const model of models) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [{ text: fullPrompt }]
              }
            ],
            systemInstruction: {
              parts: [{ text: systemInstructionText }]
            },
            generationConfig: {
              temperature: 0.2,
              maxOutputTokens: 600,
            }
          }),
        });

        if (!res.ok) {
          const errBody = await res.text();
          throw new Error(`Gemini API error [${res.status}]: ${errBody}`);
        }

        const data = await res.json();
        const candidate = data.candidates?.[0];
        const text = candidate?.content?.parts?.[0]?.text;

        if (text && text.trim().length > 0) {
          return text.trim();
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`[GeminiProvider] Attempt with model ${model} failed:`, err?.message || err);
      }
    }

    throw lastError || new Error("Failed to generate response from Gemini provider.");
  }

  async callTool(toolName: string, args: any) {
    return { status: "success", toolName, args, executedBy: this.name };
  }
}

export class OpenAIProvider implements LLMProvider {
  name = "OpenAI";

  private getApiKey(): string | null {
    assertServerSide();
    return process.env.OPENAI_API_KEY || null;
  }

  isConfigured(): boolean {
    const key = this.getApiKey();
    return Boolean(key && key.trim().length > 0 && !key.includes('your_openai_api_key'));
  }

  async generateResponse(prompt: string, context?: any): Promise<string> {
    const apiKey = this.getApiKey();
    if (!apiKey || !this.isConfigured()) {
      throw new Error("AI service is not configured. Please configure the server-side AI provider (OPENAI_API_KEY).");
    }

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are FINEXFLY AI Finance Controller. You must not invent numbers. Explain verified outputs only.'
          },
          {
            role: 'user',
            content: `${prompt}\nContext: ${JSON.stringify(context || {})}`
          }
        ],
        temperature: 0.2,
      })
    });

    if (!res.ok) {
      throw new Error(`OpenAI API error [${res.status}]: ${await res.text()}`);
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content || '';
  }

  async callTool(toolName: string, args: any) {
    return { status: "success", toolName, args, executedBy: this.name };
  }
}

// Provider Factory
export class LLMFactory {
  static getProvider(type: 'gemini' | 'openai' = 'gemini'): LLMProvider {
    switch (type) {
      case 'gemini':
        return new GeminiProvider();
      case 'openai':
        return new OpenAIProvider();
      default:
        throw new Error("Unsupported LLM Provider");
    }
  }
}

// Server-side default provider instance (Gemini is primary)
export const geminiProvider = new GeminiProvider();
