import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

// always open at the top: no restored scroll position, no leftover #section in the URL
history.scrollRestoration = 'manual';
if (location.hash) history.replaceState(null, '', location.pathname + location.search);

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
