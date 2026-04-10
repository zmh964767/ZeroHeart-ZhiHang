import { BaseAIProvider } from "./base";
import { GenerateInput } from "../types";

export class ZhipuProvider extends BaseAIProvider {
  name = "智谱清言";
  apiKey = process.env.ZHIPU_API_KEY || "";
  endpoint = "https://open.bigmodel.cn/api/paas/v4/chat/completions";

  protected async callAPI(input: GenerateInput): Promise<Record<string, any>> {
    const response = await fetch(this.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: "glm-4",
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

请返回JSON格式，包含以下字段：
- school: 学校名称
- degree: 学历
- major: 专业
- startDate: 开始时间
- endDate: 结束时间
- gpa: GPA（可选）
- highlights: 成就描述数组

只返回JSON，不要其他内容。`,

      internship: `请根据以下概要信息，生成一段专业的实习经历描述。

姓名：${input.profile.name}
求职意向：${input.profile.title}
概要：${input.outline}

请返回JSON格式，包含以下字段：
- company: 公司名称
- position: 职位
- startDate: 开始时间
- endDate: 结束时间
- description: 工作描述
- highlights: 成就/成果数组

只返回JSON，不要其他内容。`,

      project: `请根据以下概要信息，生成一段专业的项目经历描述。

姓名：${input.profile.name}
求职意向：${input.profile.title}
概要：${input.outline}

请返回JSON格式，包含以下字段：
- name: 项目名称
- role: 角色
- startDate: 开始时间
- endDate: 结束时间
- description: 项目描述
- highlights: 个人贡献/成果数组

只返回JSON，不要其他内容。`,

      campus: `请根据以下概要信息，生成一段专业的校园经历描述。

姓名：${input.profile.name}
求职意向：${input.profile.title}
概要：${input.outline}

请返回JSON格式，包含以下字段：
- organization: 组织名称
- position: 职务
- startDate: 开始时间
- endDate: 结束时间
- description: 活动描述
- highlights: 成就/成果数组

只返回JSON，不要其他内容。`,

      work: `请根据以下概要信息，生成一段专业的工作经历描述。

姓名：${input.profile.name}
求职意向：${input.profile.title}
概要：${input.outline}

请返回JSON格式，包含以下字段：
- company: 公司名称
- position: 职位
- startDate: 开始时间
- endDate: 结束时间
- description: 工作描述
- highlights: 成就/成果数组

只返回JSON，不要其他内容。`,
      evaluation: `请根据以下信息，生成一段精炼的自我评价。

姓名：${input.profile.name}
求职意向：${input.profile.title}
概要：${input.outline}

请返回JSON格式，包含以下字段：
- content: 自我评价（100字以内）

只返回JSON，不要其他内容。`,
    };

    return templates[input.moduleType] || "";
  }

  private parseResponse(data: any): Record<string, any> {
    const content = data.choices?.[0]?.message?.content || "{}";
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return JSON.parse(content);
    } catch {
      return { description: content };
    }
  }
}
