export interface Project {
  title: string;
  description: string;
  tags: string[];
  link: string;
  category?: string;
  year?: string;
  featured?: boolean;
  image?: string;
  imageBg?: string;
  role?: string;
  overview?: string;
  features?: string[];
  live?: string;
}

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

export const profile: Profile = {
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
    { title: 'EventX', image: '/projects/eventx.svg', imageBg: '#f86b49', description: 'A multi-tier event management platform on Azure, with all of its infrastructure defined as code.', tags: ['Azure', 'Terraform', 'Docker', 'Nginx', 'Node.js', 'Express', 'React', 'TypeScript', 'MSSQL'], link: '#', category: 'Cloud', featured: true },
    { title: 'ScribeEngine', image: '/projects/scribeengine.svg', imageBg: '#f4efe6', description: 'An event-driven REST API built with domain-driven design and a role-based post lifecycle.', tags: ['NestJS', 'TypeScript', 'TypeORM', 'SQLite', 'EventEmitter2', 'JWT', 'Jest', 'Swagger'], link: '#', category: 'Backend' },
    { title: 'JuniaDrive', image: '/projects/juniadrive.svg', imageBg: '#0e7c86', description: 'A cloud storage platform with per-user quotas and live file previews.', tags: ['Django', 'Django REST Framework', 'React', 'Material UI', 'Docker', 'SQLite'], link: '#', category: 'Full Stack' },
    { title: 'Library Engine', image: '/projects/library-engine.svg', imageBg: '#f2b632', description: 'A modular catalog API with a React front-end and full endpoint test coverage.', tags: ['NestJS', 'TypeORM', 'React', 'TypeScript', 'SQLite', 'Swagger', 'Jest', 'Supertest'], link: '#', category: 'Full Stack' },
    { title: 'Multi-Agent Simulation Engine', image: '/projects/multi-agent-simulation-engine.svg', imageBg: '#0f1226', description: 'A 2D discrete simulation in Java where competing populations share limited energy.', tags: ['Java', 'OOP Design Patterns', 'UML', 'Polymorphism', 'Concurrency'], link: '#', category: 'Systems' },
    { title: 'Crossref CLI', image: '/projects/crossref-cli.svg', imageBg: '#0a0f0d', description: 'A Linux command-line tool for searching scientific research through the Crossref API.', tags: ['Bash', 'Linux', 'REST API', 'cURL', 'jq', 'Rofi', 'Shell Scripting'], link: '#', category: 'Tools' },
    { title: 'Histopathology AI', image: '/projects/histopathology-ai.svg', imageBg: '#1b1030', description: 'A deep-learning model that classifies cancer in more than 555,000 histopathology images, with heatmaps to explain its calls.', tags: ['TensorFlow', 'Keras', 'Python', 'OpenCV', 'Scikit-learn', 'Grad-CAM'], link: '#', category: 'AI' },
    { title: 'PneumoniaAI', image: '/projects/pneumoniaai.svg', imageBg: '#0b2a3a', description: 'A medical detection app that reads chest X-rays and shows a live pneumonia prediction with its confidence score.', tags: ['FastAPI', 'Next.js 15', 'TensorFlow', 'Keras', 'Python', 'Pillow', 'Swagger'], link: '#', category: 'AI' },
  ],
};
