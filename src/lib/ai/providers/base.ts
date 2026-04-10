import { AIProvider, GenerateInput, GenerateResult } from "../types";

export abstract class BaseAIProvider implements AIProvider {
  abstract name: string;
  abstract apiKey: string;
  abstract endpoint: string;

  async generate(input: GenerateInput): Promise<GenerateResult> {
    try {
      const result = await this.callAPI(input);
      return {
        moduleType: input.moduleType,
        success: true,
        data: result,
      };
    } catch (error) {
      return {
        moduleType: input.moduleType,
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  protected abstract callAPI(input: GenerateInput): Promise<Record<string, any>>;
}
