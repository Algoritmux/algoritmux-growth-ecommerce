export type Article = {
  slug: string;
  path: string;
  title: string;
  summary: string;
  category: string;
  date: string;
  author: string;
  readingTimeMinutes: number;
  image?: string;
  imageAlt: string;
  contentHtml?: string;
  metadata: {
    title: string;
    description: string;
  };
};

export type CaseStudy = {
  id: string;
  company: string;
  segment: string;
  growth: string;
  roas: string;
  description: string;
  ariaLabel: string;
};

export type TeamMember = {
  id: string;
  name: string;
  role: string;
  description: string;
  image: string;
  imageAlt: string;
  professionalLinks?: {
    label: string;
    url: string;
  }[];
};
