import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProfileService } from '../../core/profile.service';
import { SiteFooter } from '../../layout/site-footer';
import { SiteHeader } from '../../layout/site-header';
import { Arrow } from '../../shared/arrow';
import { CompanyExplorer } from '../../shared/company-explorer';

@Component({
  selector: 'app-experience-page',
  imports: [SiteHeader, SiteFooter, CompanyExplorer, RouterLink, Arrow],
  template: `
    <app-site-header />

    <main>
      <section class="intro">
        <div class="container">
          <div class="intro__top">
            <a routerLink="/" class="split-btn split-btn--sm split-btn--back"><app-arrow dir="left" /><span class="split-btn__label">Back to home</span></a>
            <p class="intro__eyebrow"><span>{{ stats().places }}</span> places · <span>{{ stats().countries }}</span> countries</p>
          </div>
          <h1>Work experience</h1>
          <p class="intro__lead">Where I've worked and what I built there. Pick a place to see more.</p>
          <app-company-explorer [items]="profile().experience" />
        </div>
      </section>
    </main>

    <app-site-footer />
  `,
  styles: `
    .intro { background: var(--white); padding-block: calc(clamp(2rem, 5vw, 3.5rem) + var(--nav-space)) clamp(4rem, 9vw, 7rem); }
    .intro__top { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 0.75rem; margin-bottom: clamp(1.5rem, 4vw, 2.75rem); }
    .intro__eyebrow { margin: 0; color: var(--muted); font: 600 0.85rem var(--font-heading); letter-spacing: 0.14em; text-transform: uppercase; }
    .intro__eyebrow span { color: var(--coral); }
    h1 { margin: 0; font-size: clamp(2rem, 4vw, 3rem); font-weight: 800; letter-spacing: -0.02em; color: var(--indigo); }
    .intro__lead { margin: 0.6rem 0 clamp(2rem, 4vw, 3rem); color: var(--muted); font-size: 1.1rem; }
  `,
})
export class ExperiencePage {
  protected readonly profile = inject(ProfileService).profile;
  protected readonly stats = computed(() => {
    const xp = this.profile().experience ?? [];
    const countries = new Set(xp.map((x) => x.location?.split(',').pop()?.trim()).filter((c) => c && c.toLowerCase() !== 'remote'));
    return { places: xp.length, countries: countries.size };
  });
}
