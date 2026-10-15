import { Routes } from '@angular/router';
import { Home } from './pages/home/home';

export const routes: Routes = [
  { path: '', component: Home, title: 'Othniel Aryee — Full Stack Software Developer & AI Systems Engineer' },
  {
    path: 'experience',
    loadComponent: () => import('./pages/experience/experience').then((m) => m.ExperiencePage),
    title: 'Work experience — Othniel Aryee',
  },
  {
    path: 'experience/:slug',
    loadComponent: () => import('./pages/experience-detail/experience-detail').then((m) => m.ExperienceDetailPage),
  },
  { path: '**', redirectTo: '' },
];
