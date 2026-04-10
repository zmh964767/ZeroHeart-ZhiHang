import { BaseAIProvider } from "./base";
import { GenerateInput } from "../types";

export class KimiProvider extends BaseAIProvider {
  name = "Kimi";
  apiKey = process.env.KIMI_API_KEY || "";
  endpoint = "https://api.moonshot.cn/v1/chat/completions";

  protected async callAPI(input: GenerateInput): Promise<Record<string, any>> {
    const response = await fetch(this.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: "moonshot-v1-8k",
        messages: [{ role: "user", content: this.buildPrompt(input) }],
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return this.parseResponse(data);
  }

  private buildPrompt(input: GenerateInput): string {
    const templates: Record<string, string> = {
      education: `请根据以下概要信息，生成一段专业的教育经历描述。

姓名：${input.profile.name}
求职意向：${input.profile.title}
概要：${input.outline}

请返回JSON格式，包含以下字段：school, degree, major, startDate, endDate, gpa, highlights。

只返回JSON，不要其他内容。`,

      internship: `请根据以下概要信息，生成一段专业的实习经历描述。

姓名：${input.profile.name}
求职意向：${input.profile.title}
概要：${input.outline}

请返回JSON格式，包含以下字段：company, position, startDate, endDate, description, highlights。

只返回JSON，不要其他内容。`,

      project: `请根据以下概要信息，生成一段专业的项目经历描述。

姓名：${input.profile.name}
求职意向：${input.profile.title}
概要：${input.outline}

请返回JSON格式，包含以下字段：name, role, startDate, endDate, description, highlights。

只返回JSON，不要其他内容。`,

      campus: `请根据以下概要信息，生成一段专业的校园经历描述。

姓名：${input.profile.name}
求职意向：${input.profile.title}
概要：${input.outline}

请返回JSON格式，包含以下字段：organization, position, startDate, endDate, description, highlights。

只返回JSON，不要其他内容。`,

      work: `请根据以下概要信息，生成一段专业的工作经历描述。

姓名：${input.profile.name}
求职意向：${input.profile.title}
概要：${input.outline}

请返回JSON格式，包含以下字段：company, position, startDate, endDate, description, highlights。

只返回JSON，不要其他内容。`,
      evaluation: `请根据以下信息，生成一段精炼的自我评价。

姓名：${input.profile.name}
求职意向：${input.profile.title}
概要：${input.outline}

请返回JSON格式，包含以下字段：content（100字以内）。

只返回JSON，不要其他内容。`,
    };

    return templates[input.moduleType] || "";
  }

  private parseResponse(data: any): Record<string, any> {
    const content = data.choices?.[0]?.message?.content || "{}";
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) return JSON.parse(jsonMatch[0]);
      return JSON.parse(content);
    } catch {
      return { description: content };
    }
  }
}
