export interface LLMProvider {
  name: string;
  generateResponse(prompt: string, context?: any): Promise<string>;
  callTool(toolName: string, args: any): Promise<any>;
}

class GeminiProvider implements LLMProvider {
  name = "Gemini";
  async generateResponse(prompt: string, context?: any) {
    console.log(`[Gemini] Generating response for: ${prompt.substring(0, 50)}...`);
    return "This is a simulated Gemini response based on structured prompts.";
  }
  async callTool(toolName: string, args: any) {
    console.log(`[Gemini] Calling tool ${toolName}`);
    return { status: "success", executedBy: this.name };
  }
}

class OpenAIProvider implements LLMProvider {
  name = "OpenAI";
  async generateResponse(prompt: string, context?: any) {
    console.log(`[OpenAI] Generating response for: ${prompt.substring(0, 50)}...`);
    return "This is a simulated OpenAI response based on structured prompts.";
  }
  async callTool(toolName: string, args: any) {
    console.log(`[OpenAI] Calling tool ${toolName}`);
    return { status: "success", executedBy: this.name };
  }
}

// Provider Factory to allow easy switching
export class LLMFactory {
  static getProvider(type: 'gemini' | 'openai'): LLMProvider {
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

// Default export for the current provider
export const llm = LLMFactory.getProvider('gemini');
