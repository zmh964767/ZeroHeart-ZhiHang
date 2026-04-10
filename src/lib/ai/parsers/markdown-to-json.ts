import { EducationBlock, WorkBlock, InternshipBlock, ProjectBlock, CampusBlock, EvaluationBlock } from '@/lib/resume/types';

export function parseEducationMarkdown(md: string): Partial<EducationBlock> {
  const lines = md.split('\n').filter(l => l.trim());
  const highlights: string[] = [];
  let school = '', degree = '', major = '', startDate = '', endDate = '', gpa = '';

  for (const line of lines) {
    const trimmed = line.replace(/^[•\-*]\s*/, '').trim();

    if (trimmed.includes('|')) {
      const parts = trimmed.split('|').map(p => p.trim());
      if (parts.length >= 4) {
        school = parts[0] || school;
        degree = parts[1] || degree;
        major = parts[2] || major;
        const dateParts = parts[3]?.split('-').map(p => p.trim());
        if (dateParts && dateParts.length >= 2) {
          startDate = dateParts[0] || startDate;
          endDate = dateParts.slice(1).join('-') || endDate;
        }
      } else if (parts.length === 1) {
        school = parts[0] || school;
      }
    } else if (trimmed && !trimmed.includes('|')) {
      highlights.push(trimmed.replace(/\*\*/g, ''));
    }

    if (trimmed.toLowerCase().includes('gpa')) {
      const gpaMatch = trimmed.match(/GPA[:：]?\s*([\d.\/]+)/i);
      if (gpaMatch) gpa = gpaMatch[1];
    }
  }

  return {
    school,
    degree,
    major,
    startDate,
    endDate,
    gpa: gpa || undefined,
    highlights,
  };
}

export function parseWorkMarkdown(md: string): Partial<WorkBlock> {
  const lines = md.split('\n').filter(l => l.trim());
  const highlights: string[] = [];
  let company = '', position = '', startDate = '', endDate = '', description = '';

  for (const line of lines) {
    const trimmed = line.replace(/^[•\-*]\s*/, '').trim();

    if (trimmed.includes('|')) {
      const parts = trimmed.split('|').map(p => p.trim());
      if (parts.length >= 3) {
        company = parts[0] || company;
        position = parts[1] || position;
        const dateParts = parts[2]?.split('-').map(p => p.trim());
        if (dateParts && dateParts.length >= 2) {
          startDate = dateParts[0] || startDate;
          endDate = dateParts.slice(1).join('-') || endDate;
        }
      } else if (parts.length === 1) {
        company = parts[0] || company;
      }
    } else if (trimmed && !trimmed.includes('|')) {
      highlights.push(trimmed.replace(/\*\*/g, ''));
    }
  }

  return {
    company,
    position,
    startDate,
    endDate,
    description,
    highlights,
  };
}

export function parseInternshipMarkdown(md: string): Partial<InternshipBlock> {
  const lines = md.split('\n').filter(l => l.trim());
  const highlights: string[] = [];
  let company = '', position = '', startDate = '', endDate = '', description = '';

  for (const line of lines) {
    const trimmed = line.replace(/^[•\-*]\s*/, '').trim();

    if (trimmed.includes('|')) {
      const parts = trimmed.split('|').map(p => p.trim());
      if (parts.length >= 3) {
        company = parts[0] || company;
        position = parts[1] || position;
        const dateParts = parts[2]?.split('-').map(p => p.trim());
        if (dateParts && dateParts.length >= 2) {
          startDate = dateParts[0] || startDate;
          endDate = dateParts.slice(1).join('-') || endDate;
        }
      } else if (parts.length === 1) {
        company = parts[0] || company;
      }
    } else if (trimmed && !trimmed.includes('|')) {
      highlights.push(trimmed.replace(/\*\*/g, ''));
    }
  }

  return {
    company,
    position,
    startDate,
    endDate,
    description,
    highlights,
  };
}

export function parseProjectMarkdown(md: string): Partial<ProjectBlock> {
  const lines = md.split('\n').filter(l => l.trim());
  const highlights: string[] = [];
  let name = '', role = '', startDate = '', endDate = '', description = '', techStack = '';

  for (const line of lines) {
    const trimmed = line.replace(/^[•\-*]\s*/, '').trim();

    if (trimmed.toLowerCase().includes('技术栈')) {
      techStack = trimmed.split('：')[1]?.trim() || trimmed.split(':')[1]?.trim() || '';
      continue;
    }

    if (trimmed.includes('|')) {
      const parts = trimmed.split('|').map(p => p.trim());
      if (parts.length >= 3) {
        name = parts[0] || name;
        role = parts[1] || role;
        const dateParts = parts[2]?.split('-').map(p => p.trim());
        if (dateParts && dateParts.length >= 2) {
          startDate = dateParts[0] || startDate;
          endDate = dateParts.slice(1).join('-') || endDate;
        }
      } else if (parts.length === 1) {
        name = parts[0] || name;
      }
    } else if (trimmed && !trimmed.includes('|')) {
      highlights.push(trimmed.replace(/\*\*/g, ''));
    }
  }

  if (techStack) {
    description = techStack;
  }

  return {
    name,
    role,
    startDate,
    endDate,
    description,
    highlights,
  };
}

export function parseCampusMarkdown(md: string): Partial<CampusBlock> {
  const lines = md.split('\n').filter(l => l.trim());
  const highlights: string[] = [];
  let organization = '', position = '', startDate = '', endDate = '';

  for (const line of lines) {
    const trimmed = line.replace(/^[•\-*]\s*/, '').trim();

    if (trimmed.includes('|')) {
      const parts = trimmed.split('|').map(p => p.trim());
      if (parts.length >= 3) {
        organization = parts[0] || organization;
        position = parts[1] || position;
        const dateParts = parts[2]?.split('-').map(p => p.trim());
        if (dateParts && dateParts.length >= 2) {
          startDate = dateParts[0] || startDate;
          endDate = dateParts.slice(1).join('-') || endDate;
        }
      } else if (parts.length === 1) {
        organization = parts[0] || organization;
      }
    } else if (trimmed && !trimmed.includes('|')) {
      highlights.push(trimmed.replace(/\*\*/g, ''));
    }
  }

  return {
    organization,
    position,
    startDate,
    endDate,
    highlights,
  };
}

export function parseEvaluationMarkdown(md: string): Partial<EvaluationBlock> {
  const lines = md.split('\n').filter(l => l.trim() && !l.startsWith('#'));
  const content = lines.map(l => l.replace(/^[•\-*]\s*/, '').replace(/\*\*/g, '')).join('\n');

  return {
    content,
  };
}

export function parseMarkdown(moduleType: string, md: string): Record<string, any> {
  switch (moduleType) {
    case 'education':
      return parseEducationMarkdown(md);
    case 'work':
      return parseWorkMarkdown(md);
    case 'internship':
      return parseInternshipMarkdown(md);
    case 'project':
      return parseProjectMarkdown(md);
    case 'campus':
      return parseCampusMarkdown(md);
    case 'evaluation':
      return parseEvaluationMarkdown(md);
    default:
      return { description: md };
  }
}
