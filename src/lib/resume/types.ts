export type ModuleType =
  | 'profile'
  | 'education'
  | 'internship'
  | 'work'
  | 'project'
  | 'campus'
  | 'evaluation';

export interface ProfileBlock {
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  photo?: string;
}

export interface EducationBlock {
  school: string;
  degree: string;
  major: string;
  startDate: string;
  endDate: string;
  gpa?: string;
  highlights: string[];
  courses: string;
  awards: string;
}

export interface InternshipBlock {
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string;
  highlights: string[];
}

export interface WorkBlock {
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string;
  highlights: string[];
}

export interface ProjectBlock {
  name: string;
  role: string;
  startDate: string;
  endDate: string;
  description: string;
  highlights: string[];
}

export interface CampusBlock {
  organization: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string;
  highlights: string[];
}

export interface EvaluationBlock {
  content: string;
}

export interface ResumeContent {
  profile: ProfileBlock;
  education: EducationBlock[];
  internship: InternshipBlock[];
  work: WorkBlock[];
  project: ProjectBlock[];
  campus: CampusBlock[];
  evaluation: EvaluationBlock;
}

export interface Resume {
  id: string;
  name: string;
  template: TemplateType;
  createdAt: number;
  updatedAt: number;
  content: ResumeContent;
  modules: Record<ModuleType, boolean>;
}

export type TemplateType =
  | 'simple'
  | 'modern'
  | 'classic'
  | 'creative';

export interface ResumeMetadata {
  version: number;
}

export const defaultProfile: ProfileBlock = {
  name: '',
  title: '',
  email: '',
  phone: '',
  location: '',
  photo: '',
};

export const defaultEducation: EducationBlock = {
  school: '',
  degree: '',
  major: '',
  startDate: '',
  endDate: '',
  gpa: '',
  highlights: [],
  courses: '',
  awards: '',
};

export const defaultInternship: InternshipBlock = {
  company: '',
  position: '',
  startDate: '',
  endDate: '',
  description: '',
  highlights: [],
};

export const defaultWork: WorkBlock = {
  company: '',
  position: '',
  startDate: '',
  endDate: '',
  description: '',
  highlights: [],
};

export const defaultProject: ProjectBlock = {
  name: '',
  role: '',
  startDate: '',
  endDate: '',
  description: '',
  highlights: [],
};

export const defaultCampus: CampusBlock = {
  organization: '',
  position: '',
  startDate: '',
  endDate: '',
  description: '',
  highlights: [],
};

export const defaultEvaluation: EvaluationBlock = {
  content: '',
};

export const defaultContent: ResumeContent = {
  profile: defaultProfile,
  education: [],
  internship: [],
  work: [],
  project: [],
  campus: [],
  evaluation: defaultEvaluation,
};

export const defaultModules: Record<ModuleType, boolean> = {
  profile: true,
  education: false,
  internship: false,
  work: false,
  project: false,
  campus: false,
  evaluation: false,
};

export interface BlockInfo {
  type: 'profile' | 'education' | 'internship' | 'work' | 'project' | 'campus' | 'evaluation';
  index?: number;
  heightPx: number;
  heightPt: number;
  canBreakBefore: boolean;
}

export interface LayoutInfo {
  blocks: BlockInfo[];
  pageBreaks: number[];
  totalHeightPx: number;
  totalHeightPt: number;
}
