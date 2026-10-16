import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { catchError, of } from 'rxjs';

export interface Experience {
  company: string;
  mark: string;
  kind?: 'company' | 'lab';
  tag?: string; // label shown next to the role, e.g. 'YES Projet' (default for labs: 'Research lab')
  employment?: string;
  fullName?: string;
  location?: string;
  role?: string;
  period?: string;
  metrics?: { value: string; label: string }[];
  highlights?: string[];
  stack?: string[];
  logo?: string;
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

export interface Project {
  title: string;
  description: string;
  tags: string[];
  link: string;
  category?: string;
  year?: string;
  featured?: boolean; // shown larger on the projects page
  image?: string; // cover image; a generated cover is used when missing
}

export interface Profile {
  name: string;
  role: string;
  tagline: string;
  email: string;
  socials: { label: string; url: string }[];
  stats: { value: string; label: string }[];
  skills: { group: string; items: string[] }[];
  experience: Experience[];
  education: Education[];
  projects: Project[];
}

/** Off by default so localhost and the hosted site always show the same content. */
const USE_API = false;

const FALLBACK: Profile = {
  name: 'Othniel Aryee',
  role: 'Full Stack Software Developer & AI Systems Engineer',
  tagline:
    'I design and build fast, scalable web applications — from polished Angular interfaces to robust NestJS APIs.',
  email: 'aryeeothniel07@gmail.com',
  socials: [
    { label: 'GitHub', url: 'https://github.com/' },
    { label: 'LinkedIn', url: 'https://linkedin.com/' },
    { label: 'Instagram', url: 'https://www.instagram.com/' },
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
  experience: [
    {
      company: 'Alstom SA',
      mark: 'AL',
      logo: 'experience/alstom.svg',
      location: 'Charleroi, Belgium',
      role: 'Software Engineer',
      period: 'Mar 2026 – Sep 2026',
      metrics: [
        { value: '45%', label: 'less manual overhead' },
        { value: '80%+', label: 'test coverage' },
        { value: '<5 min', label: 'multi-source data sync' },
      ],
      highlights: [
        'Built full-stack platform to centralize engineering data and automate workflows, cutting manual overhead by 45%.',
        'Automated scheduled Apache Airflow DAGs to sync OpenProject and multi-source data into PostgreSQL (<5 mins).',
        'Designed modular architecture with 50+ tests (80%+ coverage), reducing application regressions by 35%.',
        'Deployed containerized microservices to Debian Linux implementing enterprise OAuth2/PKCE and RBAC security.',
      ],
      stack: ['Python', 'FastAPI', 'React', 'TypeScript', 'Apache Airflow', 'PostgreSQL', 'Docker', 'Debian Linux', 'OAuth2 (PKCE)', 'JWT', 'JWKS', 'TOTP', 'RBAC', 'Redis', 'CI/CD', 'Git'],
    },
    {
      company: 'LITL Lab',
      mark: 'LITL',
      logo: 'experience/litl.png',
      fullName: 'Laboratoire Interdisciplinaire des Transitions de Lille',
      kind: 'lab',
      tag: 'YES Projet',
      employment: 'Indirect contract',
      location: 'Lille, France',
      role: 'Software Engineer',
      period: 'Nov 2025 – Feb 2026',
      highlights: [
        'Redesign and optimization of the LITL laboratory website to improve usability and accessibility.',
        'Implemented modern web technologies and responsive design for better performance and user experience.',
      ],
    },
    {
      company: 'Innovation in Medicine',
      mark: 'IM',
      logo: 'experience/innovation-in-medicine.png',
      location: 'Mainz, Germany',
      role: 'Full-Stack AI Systems Engineer',
      period: 'Apr 2025 – Aug 2025',
      metrics: [
        { value: '92%+', label: 'prediction accuracy' },
        { value: '20,000+', label: 'ultrasound frames curated' },
        { value: '<1.5s', label: 'inference latency' },
      ],
      highlights: [
        'Developed CNN and LightGBM models for echocardiogram cardiac prediction (92%+ accuracy).',
        'Engineered automated preprocessing and Image Quality Assessment pipelines to curate 20,000+ ultrasound frames.',
        'Built containerized Flask REST API with CORS for low-latency (<1.5s) inference on a gamified platform.',
        'Redesigned UI and migrated codebase from Vue.js to Next.js to align architecture, boosting performance by 35%.',
      ],
      stack: ['Python', 'LightGBM', 'TensorFlow', 'PyTorch', 'Flask', 'Docker', 'Next.js', 'REST APIs', 'Scikit-learn', 'CNNs', 'Computer Vision'],
    },
    {
      company: 'Dreamosoft',
      mark: 'DS',
      logo: 'experience/dreamosoft.svg',
      location: 'Remote, Ghana',
      role: 'Frontend Developer',
      period: 'Jan 2025 – Jul 2025',
      highlights: [
        'Built responsive and modern user interfaces for fast-delivery MVPs and custom software platforms.',
        'Collaborated with backend and product teams to ship scalable, high-performance features aligned with client needs.',
      ],
    },
    {
      company: 'Volta River Authority',
      mark: 'VRA',
      logo: 'experience/vra.png',
      location: 'Accra, Ghana',
      role: 'Software Developer Intern',
      period: 'Aug 2023 – Jan 2024',
      metrics: [
        { value: '60%', label: 'less physical storage' },
        { value: '99.9%', label: 'uptime maintained' },
        { value: '<2s', label: 'chatbot latency' },
      ],
      highlights: [
        'Built a document tracking platform with Azure to digitize physical archives, cutting storage by 60%.',
        'Hardened internal data governance via least-privilege backend auth and RBAC across 5+ departments.',
        'Engineered backend services for an MIS chatbot, enabling 24/7 public self-service with <2s latency.',
        'Partnered with DevOps and product teams to establish logging and telemetry, maintaining 99.9% uptime.',
      ],
      stack: ['JavaScript', 'React', 'Material UI', 'Node.js', 'Express.js', 'Azure Blob', 'PostgreSQL', 'JWT'],
    },
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
    { title: 'Project One', description: 'A short description of what this project does and the problem it solves.', tags: ['Angular', 'NestJS'], link: '#', category: 'Web', year: '2026', featured: true },
    { title: 'Project Two', description: 'A short description of what this project does and the problem it solves.', tags: ['TypeScript', 'PostgreSQL'], link: '#', category: 'Backend', year: '2025' },
    { title: 'Project Three', description: 'A short description of what this project does and the problem it solves.', tags: ['Docker', 'AWS'], link: '#', category: 'Cloud', year: '2025' },
    { title: 'Project Four', description: 'A short description of what this project does and the problem it solves.', tags: ['Python', 'TensorFlow'], link: '#', category: 'AI', year: '2025' },
    { title: 'Project Five', description: 'A short description of what this project does and the problem it solves.', tags: ['React', 'Next.js'], link: '#', category: 'Web', year: '2024' },
    { title: 'Project Six', description: 'A short description of what this project does and the problem it solves.', tags: ['Airflow', 'PostgreSQL'], link: '#', category: 'Data', year: '2026' },
    { title: 'Project Seven', description: 'A short description of what this project does and the problem it solves.', tags: ['Flask', 'PyTorch'], link: '#', category: 'AI', year: '2025' },
  ],
};

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private readonly http = inject(HttpClient);

  /** Starts with built-in content; replaced by the API response when the backend is reachable. */
  readonly profile = signal<Profile>(FALLBACK);

  constructor() {
    // the built-in content above is the source of truth for now; flip USE_API on to load it from the NestJS backend instead
    if (!USE_API || location.hostname !== 'localhost') return;
    this.http
      .get<Profile>('http://localhost:3000/api/profile')
      .pipe(catchError(() => of(null)))
      .subscribe((p) => p && this.profile.set(p));
  }
}
