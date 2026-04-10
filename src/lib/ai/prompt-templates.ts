import { ModuleType, EducationBlock, InternshipBlock, WorkBlock, ProjectBlock, CampusBlock, ProfileBlock, EvaluationBlock } from '@/lib/resume/types';

/**
 * AI Prompt 模板
 *
 * 版本历史：docs/superpowers/ai/CHANGELOG.md
 *
 * v4 (2026-04-09): 新增工作经历模块，个人优势改为自我评价
 *   - 添加工作经历模块（与实习经历结构相同
 *   - 个人优势模块改名为"自我评价"
 *
 * v3 (2026-04-07): STAR法则 + 量化数据
 *   - 要求所有输出按 STAR 法则撰写
 *   - 强调量化结果，避免空洞描述
 *   - 个人优势聚焦用户原始输入
 *
 * v2 (2026-04-07): 纯净文本输出
 *   - 移除 Markdown 格式
 *   - 移除符号前缀（•, -, *）
 *   - 教育经历模块移除 AI 生成
 *
 * v1 (2026-04-07): 初始版本
 */

export interface PromptContext {
  profile: ProfileBlock;
  education: EducationBlock[];
  internship: InternshipBlock[];
  work: WorkBlock[];
  project: ProjectBlock[];
  campus: CampusBlock[];
  evaluation: EvaluationBlock;
}

/**
 * 构建 Prompt
 *
 * @param moduleType - 模块类型
 * @param context    - 用户已有信息上下文
 * @returns 构造好的 prompt 字符串
 *
 * 设计原则：
 * 1. 基于用户已有信息，不凭空编造
 * 2. 按 STAR 法则撰写，强调量化
 * 3. 输出纯净文本，便于用户复制使用
 */
export function buildPrompt(moduleType: ModuleType, context: PromptContext): string {
  const { profile, education, internship, work, project, campus, evaluation } = context;

  const templates: Record<ModuleType, string> = {
    profile: '',

    /**
     * 教育经历 - v2 移除 AI 生成
     * 教育经历信息结构简单（学校、专业、时间），AI 扩写反而容易添加不准确信息
     */
    education: '',

    /**
     * 实习经历 Prompt - v4
     *
     * 优化记录：
     * - v1: Markdown 格式，带符号前缀
     * - v2: 纯净文本
     * - v3: STAR法则 + 量化数据要求
     * - v4: 保持不变，与工作经历结构相同
     */
    internship: `你是一个专业的简历写手。

## 用户信息
公司：${internship.map(e => e.company).join('、') || '未知'}
职位：${internship.map(e => e.position).join('、') || '未知'}
时间：${internship.map(e => `${e.startDate}-${e.endDate}`).join('、') || '未知'}
${internship.some(e => e.description) ? `工作描述：${internship.map(e => e.description).join('、')}` : ''}

## 要求
请按照STAR法则撰写实习经历的描述：
- S (情境)：项目背景或业务场景
- T (任务)：面临什么技术或业务挑战
- A (行动)：具体做了哪些工作，用了什么技术
- R (结果)：取得了什么量化成果（如性能提升%、用户增长、交付效率等）

**必须量化结果**，用具体数字支撑。

## 输出格式
直接输出描述文本，2-4句话，每句话都要有量化数据`,

    /**
     * 工作经历 Prompt - v4 (新增)
     *
     * 与实习经历结构相同
     */
    work: `你是一个专业的简历写手。

## 用户信息
公司：${work.map(e => e.company).join('、') || '未知'}
职位：${work.map(e => e.position).join('、') || '未知'}
时间：${work.map(e => `${e.startDate}-${e.endDate}`).join('、') || '未知'}
${work.some(e => e.description) ? `工作描述：${work.map(e => e.description).join('、')}` : ''}

## 要求
请按照STAR法则撰写工作经历的描述：
- S (情境)：项目背景或业务场景
- T (任务)：面临什么技术或业务挑战
- A (行动)：具体做了哪些工作，用了什么技术
- R (结果)：取得了什么量化成果（如性能提升%、用户增长、交付效率等）

**必须量化结果**，用具体数字支撑。

## 输出格式
直接输出描述文本，2-4句话，每句话都要有量化数据`,

    /**
     * 项目经历 Prompt - v3
     *
     * 优化记录：
     * - v1: Markdown 格式，带符号前缀
     * - v2: 纯净文本
     * - v3: STAR法则 + 量化数据要求
     */
    project: `你是一个专业的简历写手。

## 用户信息
项目：${project.map(e => e.name).join('、') || '未知'}
角色：${project.map(e => e.role).join('、') || '未知'}
时间：${project.map(e => `${e.startDate}-${e.endDate}`).join('、') || '未知'}
${project.some(e => e.description) ? `项目描述：${project.map(e => e.description).join('、')}` : ''}

## 要求
请按照STAR法则撰写项目经历的描述：
- S (情境)：项目背景是什么，解决什么问题
- T (任务)：你的职责是什么，面临什么挑战
- A (行动)：具体用了什么技术栈，做了哪些核心功能
- R (结果)：取得了什么成果，尽量量化（如性能提升%、功能数量、用户量等）

**必须量化结果**，用具体数字支撑。

## 输出格式
直接输出描述文本，2-4句话，每句话都要有量化数据`,

    /**
     * 校园经历 Prompt - v3
     *
     * 优化记录：
     * - v1: Markdown 格式，带符号前缀
     * - v2: 纯净文本
     * - v3: STAR法则 + 量化数据要求
     */
    campus: `你是一个专业的简历写手。

## 用户信息
组织：${campus.map(e => e.organization).join('、') || '未知'}
职务：${campus.map(e => e.position).join('、') || '未知'}
时间：${campus.map(e => `${e.startDate}-${e.endDate}`).join('、') || '未知'}
${campus.some(e => e.description) ? `活动描述：${campus.map(e => e.description).join('、')}` : ''}

## 要求
请按照STAR法则撰写校园经历的描述：
- S (情境)：活动背景或组织目标
- T (任务)：你的职责是什么，负责哪部分
- A (行动)：具体做了哪些工作，如何组织协调
- R (结果)：取得了什么成果，尽量量化（如活动参与人数、覆盖范围、排名等）

**必须量化结果**，用具体数字支撑。

## 输出格式
直接输出描述文本，2-4句话，每句话都要有量化数据`,

    /**
     * 自我评价 Prompt - v7
     *
     * 优化记录：
     * - v1: 综合所有模块提炼优势
     * - v2: 纯净文本
     * - v3: 聚焦用户原始输入，不添加新内容
     * - v4: 模块名从"个人优势"改为"自我评价"
     * - v5: 拆分为多个字段（核心优势、职业规划、工作风格、其他亮点）
     * - v6: 输出更简洁，便于直接复制使用
     * - v7: 简化为单个文本字段
     *
     * 决策原因：自我评价不适合STAR法则，应该更关注个人特质和软技能
     */
    evaluation: `你是一个专业的简历写手。

## 用户信息
自我评价：${evaluation.content || '用户未填写'}

## 要求
请根据用户填写的内容，给出可直接复制使用的优化版本：
1. 保持内容的完整性和真实性
2. 优化得更简洁、专业、有力
3. 保持段落清晰，便于阅读

## 输出格式
只输出优化后的内容，不要解释说明。`,
  };

  return templates[moduleType] || '';
}
