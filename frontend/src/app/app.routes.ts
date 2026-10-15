import { Routes } from '@angular/router';
import { Home } from './pages/home/home';

export const routes: Routes = [
  { path: '', component: Home, title: 'Your Name — Full-Stack Developer' },
  { path: '**', redirectTo: '' },
];
