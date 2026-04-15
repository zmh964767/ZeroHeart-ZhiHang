export interface GenerateInput {
  moduleType: 'education' | 'internship' | 'project' | 'campus' | 'advantage';
  profile: { name: string; title: string };
  outline: string;
}

export interface GenerateResult {
  moduleType: string;
  success: boolean;
  data?: Record<string, any>;
  error?: string;
}

export interface AIProvider {
  name: string;
  generate(input: GenerateInput): Promise<GenerateResult>;
}
