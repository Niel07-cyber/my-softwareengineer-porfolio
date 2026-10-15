import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { catchError, of } from 'rxjs';

export interface Profile {
  name: string;
  role: string;
  tagline: string;
  email: string;
  socials: { label: string; url: string }[];
  stats: { value: string; label: string }[];
  skills: { group: string; items: string[] }[];
  projects: { title: string; description: string; tags: string[]; link: string }[];
}

const FALLBACK: Profile = {
  name: 'Othniel Aryee',
  role: 'Full-Stack Software Developer',
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
  projects: [
    { title: 'Project One', description: 'A short description of what this project does and the problem it solves.', tags: ['Angular', 'NestJS'], link: '#' },
    { title: 'Project Two', description: 'A short description of what this project does and the problem it solves.', tags: ['TypeScript', 'PostgreSQL'], link: '#' },
    { title: 'Project Three', description: 'A short description of what this project does and the problem it solves.', tags: ['Docker', 'AWS'], link: '#' },
  ],
};

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private readonly http = inject(HttpClient);

  /** Starts with built-in content; replaced by the API response when the backend is reachable. */
  readonly profile = signal<Profile>(FALLBACK);

  constructor() {
    this.http
      .get<Profile>('http://localhost:3000/api/profile')
      .pipe(catchError(() => of(null)))
      .subscribe((p) => p && this.profile.set(p));
  }
}
