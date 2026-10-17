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
  imageBg?: string; // the colour behind that picture, so the details header can carry it up behind the menu
  // details page (all optional: a section is simply left out when it is empty)
  role?: string; // e.g. 'Full-stack developer'
  overview?: string; // a short paragraph: what it is and why it exists
  features?: string[]; // what it does / what I built
  live?: string; // live demo URL, when there is one
}

export interface Profile {
  name: string;
  role: string;
  tagline: string;
  email: string;
  socials: { label: string; url: string }[];
  stats: { value: string; label: string }[];
  skills: { group: string; items: string[] }[];
  allSkills: { group: string; items: string[] }[]; // the full list, shown on the Skills page
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
    { label: 'GitHub', url: 'https://github.com/Niel07-cyber' },
    { label: 'LinkedIn', url: 'https://www.linkedin.com/in/othniel-aryee-9501a0239/' },
    { label: 'Instagram', url: 'https://www.instagram.com/aryee07/' },
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
  allSkills: [
    { group: 'Programming Languages', items: ['Python', 'JavaScript', 'TypeScript', 'Java', 'SQL', 'Bash / Shell', 'HTML5', 'CSS3'] },
    { group: 'Frontend', items: ['Angular', 'React', 'Next.js', 'Vue.js', 'RxJS', 'SCSS', 'Tailwind CSS', 'Material UI', 'ShadCN UI', 'Bootstrap', 'Zod'] },
    { group: 'Backend & APIs', items: ['NestJS', 'Node.js', 'Express.js', 'FastAPI', 'Django', 'Flask', 'TypeORM', 'REST APIs', 'GraphQL'] },
    { group: 'Databases & Messaging', items: ['PostgreSQL', 'SQLite', 'MongoDB', 'Redis', 'Pub/Sub', 'EventEmitter'] },
    { group: 'Cloud & DevOps', items: ['Azure', 'AWS', 'Terraform (IaC)', 'Docker', 'Kubernetes', 'Nginx', 'CI/CD', 'Linux (Debian, Ubuntu)', 'Git / GitHub', 'cURL', 'jq'] },
    { group: 'Data & AI', items: ['Apache Airflow', 'ETL Pipelines', 'Data Preprocessing', 'TensorFlow', 'Keras', 'PyTorch', 'LightGBM', 'Scikit-learn', 'OpenCV', 'Pillow', 'CNNs', 'Grad-CAM', 'Data Augmentation', 'NumPy', 'Pandas'] },
    { group: 'Architecture & Security', items: ['Microservices', 'Event-Driven Architecture', 'Domain-Driven Design (DDD)', 'Full-Stack Systems', 'OAuth2 (PKCE)', 'JWT', 'JWKS', 'TOTP', 'RBAC / ABAC'] },
    { group: 'Testing & Workflow', items: ['Jest', 'Pytest', 'Supertest', 'Cypress', 'E2E / Unit Testing', 'Debugging', 'Code Review', 'Agile / Scrum'] },
    { group: 'Tools & Monitoring', items: ['Swagger / OpenAPI', 'Postman', 'Sentry', 'Prometheus', 'Grafana'] },
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
    { title: 'EventX', image: '/projects/eventx.svg', imageBg: '#f86b49', description: 'A multi-tier event management platform on Azure, with all of its infrastructure defined as code.', tags: ['Azure', 'Terraform', 'Docker', 'Nginx', 'Node.js', 'Express', 'React', 'TypeScript', 'MSSQL'], link: '#', category: 'Cloud', featured: true, overview: 'EventX is a cloud-hosted event management platform: a React and TypeScript front-end talking to Node.js REST APIs, deployed on Azure and provisioned entirely with Terraform.', features: ['Designed a multi-tier event management platform using React, TypeScript, and Node.js REST APIs.', 'Automated 100% of Azure infrastructure as code (IaC) across 6+ Azure services using Terraform in under 10 minutes.', 'Containerized services with Docker and Nginx on Azure App Service, maintaining under 150ms latency.'] },
    { title: 'ScribeEngine', image: '/projects/scribeengine.svg', imageBg: '#f4efe6', description: 'An event-driven REST API built with domain-driven design and a role-based post lifecycle.', tags: ['NestJS', 'TypeScript', 'TypeORM', 'SQLite', 'EventEmitter2', 'JWT', 'Jest', 'Swagger'], link: '#', category: 'Backend', overview: 'ScribeEngine is a decoupled NestJS API organised around domain-driven design, where posts move through a controlled lifecycle and domain events keep the modules independent.', features: ['Architected a decoupled REST API using Domain-Driven Design (DDD) across 4 distinct modules.', 'Implemented asynchronous domain events and a 4-tier RBAC/ABAC post lifecycle state machine.', 'Validated 100% of domain workflows with Jest unit and E2E test suites and documented the API via Swagger.'] },
    { title: 'JuniaDrive', image: '/projects/juniadrive.svg', imageBg: '#0e7c86', description: 'A cloud storage platform with per-user quotas and live file previews.', tags: ['Django', 'Django REST Framework', 'React', 'Material UI', 'Docker', 'SQLite'], link: '#', category: 'Full Stack', overview: 'JuniaDrive is a cloud storage platform: a Django REST back-end with a responsive React interface, packaged with Docker Compose.', features: ['Built a cloud storage platform with Django REST and React, enforcing per-user quotas of 100MB.', 'Containerized services with Docker Compose, enabling live file previews across 5+ media formats.', 'Designed a responsive UI with Material UI and Tailwind CSS, supporting file uploads up to 40MB.'] },
    { title: 'Library Engine', image: '/projects/library-engine.svg', imageBg: '#f2b632', description: 'A modular catalog API with a React front-end and full endpoint test coverage.', tags: ['NestJS', 'TypeORM', 'React', 'TypeScript', 'SQLite', 'Swagger', 'Jest', 'Supertest'], link: '#', category: 'Full Stack', overview: 'Library Engine is a catalog system: a modular NestJS API with relational data modelling, an interactive Swagger UI and a React front-end.', features: ['Engineered a modular catalog system with NestJS and React, handling 10+ CRUD REST endpoints.', 'Automated unit and E2E testing pipelines via Jest and Supertest, achieving 100% endpoint test coverage.', 'Designed TypeORM entity relations across 4+ database tables, documented via interactive Swagger UI.'] },
    { title: 'Multi-Agent Simulation Engine', image: '/projects/multi-agent-simulation-engine.svg', imageBg: '#0f1226', description: 'A 2D discrete simulation in Java where competing populations share limited energy.', tags: ['Java', 'OOP Design Patterns', 'UML', 'Polymorphism', 'Concurrency'], link: '#', category: 'Systems', overview: 'A 2D discrete simulation engine in Java that models competing populations of agents under energy constraints, built around a polymorphic, extensible architecture.', features: ['Developed a 2D discrete simulation engine in Java, modeling 4 competing populations and energy constraints.', 'Designed a polymorphic OOP architecture with Singleton patterns to coordinate 100+ concurrent agents.', 'Formulated 6+ interaction state rules and UML diagrams, ensuring extensible agent message-passing.'] },
    { title: 'Crossref CLI', image: '/projects/crossref-cli.svg', imageBg: '#0a0f0d', description: 'A Linux command-line tool for searching scientific research through the Crossref API.', tags: ['Bash', 'Linux', 'REST API', 'cURL', 'jq', 'Rofi', 'Shell Scripting'], link: '#', category: 'Tools', overview: 'Crossref CLI is a Linux tool for looking up scientific papers: it queries the Crossref REST API, filters the JSON with jq and presents the results in rofi menus.', features: ['Engineered a Linux CLI tool querying the Crossref REST API to parse scientific metadata in under 1s.', 'Integrated jq JSON filtering and rofi menus with xclip, cutting lookup time by 70%.', 'Built modular Bash automation scripts with validation, tested across 3+ major Linux distributions.'] },
    { title: 'Histopathology AI', image: '/projects/histopathology-ai.svg', imageBg: '#1b1030', description: 'A deep-learning model that classifies cancer in more than 555,000 histopathology images, with heatmaps to explain its calls.', tags: ['TensorFlow', 'Keras', 'Python', 'OpenCV', 'Scikit-learn', 'Grad-CAM'], link: '#', category: 'AI', overview: 'Histopathology AI is a cancer-classification project: a convolutional neural network trained on a very large set of tissue images, with Grad-CAM heatmaps that show which regions the model relied on.', features: ['Trained a CNN on 555,000+ histopathology images, achieving 0.93 AUC and 87% recall for malignancy.', 'Streamed out-of-core image datasets via Keras ImageDataGenerator and applied custom class weighting.', 'Verified model explainability by generating Grad-CAM heatmaps highlighting high cellularity regions.'] },
    { title: 'PneumoniaAI', image: '/projects/pneumoniaai.svg', imageBg: '#0b2a3a', description: 'A medical detection app that reads chest X-rays and shows a live pneumonia prediction with its confidence score.', tags: ['FastAPI', 'Next.js 15', 'TensorFlow', 'Keras', 'Python', 'Pillow', 'Swagger'], link: '#', category: 'AI', overview: 'PneumoniaAI is a medical detection app: a CNN trained to spot lung pathology in X-ray scans, served by an asynchronous FastAPI backend and shown in a Next.js frontend.', features: ['Trained a binary CNN using TensorFlow/Keras and data augmentation to classify lung pathology from X-ray scans.', 'Built an asynchronous FastAPI REST backend with Pillow preprocessing, delivering inference in under 1.5s.', 'Developed a Next.js 15 frontend displaying real-time prediction confidence scores, documented via Swagger.'] },
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
