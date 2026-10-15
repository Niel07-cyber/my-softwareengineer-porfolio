import { Routes } from '@angular/router';
import { Home } from './pages/home/home';

export const routes: Routes = [
  { path: '', component: Home, title: 'Othniel Aryee — Full Stack Software Developer & AI Systems Engineer' },
  { path: '**', redirectTo: '' },
];
