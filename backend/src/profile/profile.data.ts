export interface Project {
  title: string;
  description: string;
  tags: string[];
  link: string;
}

export interface Education {
  period: string;
  title: string;
  institution: string;
  location: string;
  description?: string;
  badge?: string;
  logo?: string;
  logoBg?: string;
}

export interface Profile {
  name: string;
  role: string;
  tagline: string;
  email: string;
  socials: { label: string; url: string }[];
  stats: { value: string; label: string }[];
  skills: { group: string; items: string[] }[];
  education: Education[];
  projects: Project[];
}

export const profile: Profile = {
  name: 'Othniel Aryee',
  role: 'Full Stack Software Developer & AI Systems Engineer',
  tagline:
    'I design and build fast, scalable web applications — from polished Angular interfaces to robust NestJS APIs.',
  email: 'aryeeothniel07@gmail.com',
  socials: [
    { label: 'GitHub', url: 'https://github.com/' },
    { label: 'LinkedIn', url: 'https://linkedin.com/' },
  ],
  stats: [
    { value: '3+', label: 'Years of experience' },
    { value: '4', label: 'Countries worked in' },
    { value: '12+', label: 'Technologies used' },
  ],
  skills: [
    { group: 'Frontend', items: ['Angular', 'TypeScript', 'RxJS', 'SCSS'] },
    { group: 'Backend', items: ['NestJS', 'Node.js', 'REST', 'GraphQL'] },
    { group: 'Data & DevOps', items: ['PostgreSQL', 'MongoDB', 'Docker', 'CI/CD'] },
  ],
  education: [
    {
      period: 'Graduated September 2026',
      title: 'MSc Software Engineering',
      institution: 'Institut Supérieur de l’Électronique et du Numérique (JUNIA)',
      location: 'Lille, France',
      badge: 'Erasmus Mundus Scholarship Award',
      logo: 'education/junia.svg',
      logoBg: '#342f70',
    },
    {
      period: 'January 2022 – August 2024',
      title: 'Bachelor of Science in Computer Science',
      institution: 'Kwame Nkrumah University of Science and Technology (KNUST)',
      location: 'Kumasi, Ghana',
      logo: 'education/knust.jpg',
      logoBg: '#ffffff',
    },
  ],
  projects: [
    {
      title: 'Project One',
      description: 'A short description of what this project does and the problem it solves.',
      tags: ['Angular', 'NestJS'],
      link: '#',
    },
    {
      title: 'Project Two',
      description: 'A short description of what this project does and the problem it solves.',
      tags: ['TypeScript', 'PostgreSQL'],
      link: '#',
    },
    {
      title: 'Project Three',
      description: 'A short description of what this project does and the problem it solves.',
      tags: ['Docker', 'AWS'],
      link: '#',
    },
  ],
};
