import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProfileService } from '../../core/profile.service';
import { SiteFooter } from '../../layout/site-footer';
import { SiteHeader } from '../../layout/site-header';
import { Arrow } from '../../shared/arrow';
import { ExperienceCard } from '../../shared/experience-card';

@Component({
  selector: 'app-experience-page',
  imports: [SiteHeader, SiteFooter, ExperienceCard, RouterLink, Arrow],
  template: `
    <app-site-header />

    <main>
      <section class="page-hero">
        <div class="container">
          <a routerLink="/" fragment="experience" class="page-hero__back"><app-arrow dir="left" tone="light" />Back to home</a>
          <h1>Work <em>experience</em></h1>
          <p>Pick a company to explore what I built there.</p>
        </div>
      </section>

      <section class="list">
        <div class="container list__inner">
          @for (x of profile().experience; track x.company) {
            <app-experience-card [exp]="x" />
          }
        </div>
      </section>
    </main>

    <app-site-footer />
  `,
  styles: `
    .page-hero {
      background: radial-gradient(circle at 80% 20%, #4a43a0 0%, var(--indigo) 45%, var(--indigo-deep) 100%);
      color: var(--white);
      padding-block: clamp(2.5rem, 6vw, 4.5rem);
    }
    .page-hero__back { display: inline-flex; align-items: center; gap: 0.6rem; margin-bottom: 1.5rem; --arrow-size: 2rem; color: rgba(255, 255, 255, 0.7); font-weight: 500; }
    .page-hero__back:hover { color: var(--white); }
    .page-hero__back:hover app-arrow { --arrow-bg: var(--coral); --arrow-fg: var(--white); --arrow-nudge: 3px; }
    h1 { font-size: clamp(2.2rem, 5vw, 3.4rem); font-weight: 800; margin: 0 0 0.75rem; }
    h1 em { font-style: normal; color: var(--coral); }
    .page-hero p { margin: 0; max-width: 36rem; color: rgba(255, 255, 255, 0.8); font-size: 1.1rem; }

    .list { background: var(--surface); padding-block: clamp(2rem, 5vw, 3.5rem) clamp(3rem, 7vw, 5rem); }
    .list__inner { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 20rem), 1fr)); gap: 1.5rem; }
  `,
})
export class ExperiencePage {
  protected readonly profile = inject(ProfileService).profile;
}
