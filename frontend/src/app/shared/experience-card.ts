import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { Experience } from '../core/profile.service';
import { Arrow } from './arrow';
import { slug } from './slug';

/** A grid card for one place: logo and dates on top, who/what below, and location with an Explore button along the bottom. */
@Component({
  selector: 'app-experience-card',
  imports: [RouterLink, Arrow],
  template: `
    @let e = exp();
    <article class="xp">
      <header class="xp__top">
        <div class="xp__frame">
          @if (e.logo) {
            <img [src]="e.logo" [alt]="e.company + ' logo'" />
          } @else {
            <span class="xp__mark" aria-hidden="true">{{ e.mark }}</span>
          }
        </div>
        @if (e.period) {
          <span class="xp__period">
            @if (current()) { <i></i> }
            {{ e.period }}
          </span>
        } @else if (e.kind === 'lab') {
          <span class="xp__tag">{{ e.tag ?? 'Research lab' }}</span>
        }
      </header>

      <h3 class="xp__company">{{ e.company }}</h3>
      <p class="xp__role">
        {{ e.role ?? 'Details coming soon' }}
        @if (e.kind === 'lab' && e.period) {
          <span class="xp__tag">{{ e.tag ?? 'Research lab' }}</span>
        }
      </p>

      <div class="xp__foot">
        @if (e.location) {
          <span class="xp__place">
            <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
              <path d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z" fill="currentColor" />
            </svg>
            {{ e.location }}
          </span>
        }
        <a class="split-btn split-btn--sm xp__explore" [routerLink]="['/experience', slug(e.company)]">
          <span class="split-btn__label">Explore</span>
          <app-arrow />
          <span class="sr-only"> {{ e.company }}</span>
        </a>
      </div>
    </article>
  `,
  styles: `
    :host { display: block; }
    p, h3, ul { margin: 0; padding: 0; list-style: none; }

    .xp {
      position: relative;
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
      height: 100%;
      padding: 1.5rem;
      background: var(--white);
      border: 1px solid var(--line);
      border-radius: var(--radius);
      cursor: pointer;
      transition: border-color 0.2s;
    }
    .xp:hover { border-color: var(--coral); }
    .xp:has(.xp__explore:focus-visible) { outline: 3px solid var(--coral); outline-offset: 3px; }

    .xp__top { display: flex; align-items: flex-start; justify-content: space-between; gap: 0.75rem; margin-bottom: 0.9rem; }
    .xp__frame { display: flex; align-items: center; height: 4.75rem; }
    .xp__frame img { height: 4.5rem; width: auto; max-width: 9rem; object-fit: contain; display: block; }
    .xp__mark {
      display: grid; place-items: center; width: 4.5rem; height: 4.5rem; border-radius: 16px;
      background: linear-gradient(135deg, #4a43a0, var(--indigo)); color: var(--white); font: 800 1.2rem var(--font-heading);
    }

    .xp__period {
      display: inline-flex; align-items: center; gap: 0.4rem; white-space: nowrap;
      padding: 0.25rem 0.8rem; border-radius: 999px; background: rgba(248, 107, 73, 0.12); color: var(--coral);
      font: 700 0.78rem var(--font-heading);
    }
    .xp__period i { width: 0.45rem; height: 0.45rem; border-radius: 50%; background: #2ecc8f; }
    .xp__tag { padding: 0.15rem 0.65rem; border-radius: 999px; background: rgba(52, 47, 112, 0.08); color: var(--indigo); font: 600 0.75rem var(--font-heading); }
    .xp__role .xp__tag { margin-left: 0.4rem; }

    .xp__company { color: var(--indigo); font-size: 1.25rem; }
    .xp__role { color: var(--ink); font-weight: 600; }

    .xp__foot { display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; margin-top: auto; padding-top: 1.4rem; }
    .xp__place { display: inline-flex; align-items: center; gap: 0.3rem; color: var(--muted); font-size: 0.88rem; }
    .xp__place svg { color: var(--coral); flex: none; }
    /* the whole card is the click target */
    .xp__explore::after { content: ''; position: absolute; inset: 0; border-radius: var(--radius); }
    /* the whole card is the link, so hovering anywhere on it gives the button its hover look */
    .xp:hover .split-btn__label { background: #d9d6f0; }
    .xp:hover app-arrow { --arrow-bg: var(--coral); --arrow-nudge: 3px; }
    .xp__explore:focus-visible { outline: none; }
    .sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
  `,
})
export class ExperienceCard {
  readonly exp = input.required<Experience>();
  protected readonly slug = slug;
  protected readonly current = computed(() => this.exp().period?.includes('Present') ?? false);
}
