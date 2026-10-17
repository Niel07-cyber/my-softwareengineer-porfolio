import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProfileService } from '../../core/profile.service';
import { SiteFooter } from '../../layout/site-footer';
import { SiteHeader } from '../../layout/site-header';
import { Arrow } from '../../shared/arrow';
import { TECH_LOGOS } from '../../shared/tech-logos';

/** /skills: everything I work with, grouped. Pick an area on the left; the first one is open to begin with. */
@Component({
  selector: 'app-skills-page',
  imports: [SiteHeader, SiteFooter, RouterLink, Arrow],
  template: `
    <app-site-header />

    <main>
      <section class="page">
        <div class="container">
          <a routerLink="/" class="split-btn split-btn--sm split-btn--back"><app-arrow dir="left" /><span class="split-btn__label">Back to home</span></a>

          <h1>Skills &amp; <span>tools</span></h1>
          <p class="lead">The languages, frameworks and tools I use to take an idea from first commit to production.</p>

          <div class="layout">
            <div class="areas" role="tablist" aria-label="Skill areas" aria-orientation="vertical">
              @for (g of groups(); track g.group) {
                <button type="button" role="tab" [attr.aria-selected]="current() === g.group" [class.on]="current() === g.group" (click)="active.set(g.group)">
                  {{ g.group }}
                </button>
              }
            </div>

            <div class="panel">
              @for (g of shown(); track g.group) {
                <article class="group">
                  <h2>{{ g.group }}</h2>
                  <ul class="chips">
                    @for (i of g.items; track i) {
                      <li>
                        @if (logo(i); as src) {
                          <img [src]="src" alt="" />
                        }
                        {{ i }}
                      </li>
                    }
                  </ul>
                </article>
              }
            </div>
          </div>
        </div>
      </section>
    </main>

    <app-site-footer />
  `,
  styles: `
    h1, h2, ul { margin: 0; padding: 0; list-style: none; }
    .page { background: var(--white); padding-block: calc(clamp(2rem, 5vw, 3.5rem) + var(--nav-space)) clamp(3rem, 7vw, 5rem); min-height: 75vh; }
    .split-btn--back { margin-bottom: 1.5rem; }
    h1 { color: var(--indigo); font-size: clamp(2rem, 4vw, 3rem); font-weight: 800; letter-spacing: -0.02em; }
    h1 span { color: var(--coral); }
    .lead { margin: 0.6rem 0 clamp(1.75rem, 4vw, 2.75rem); color: var(--muted); font-size: 1.1rem; }

    .layout { display: grid; grid-template-columns: minmax(14rem, 19rem) minmax(0, 1fr); gap: clamp(2rem, 5vw, 4rem); align-items: start; }

    /* the areas: a plain list, the chosen one in coral */
    .areas { position: sticky; top: 6rem; display: grid; gap: 0.2rem; min-width: 0; }
    .areas button {
      display: flex; align-items: baseline; justify-content: space-between; gap: 0.75rem; padding: 0.6rem 0.2rem 0.6rem 1.4rem; border: 0; background: none; position: relative;
      color: var(--indigo); font: 600 1.1rem/1.3 var(--font-heading); text-align: left; cursor: pointer; transition: color 0.2s, transform 0.25s;
    }
    .areas button::before {
      content: ''; position: absolute; left: 0.1rem; top: 50%; width: 0.5rem; height: 0.5rem; margin-top: -0.25rem; border-radius: 50%;
      background: currentColor; opacity: 0.35; transition: opacity 0.2s, transform 0.25s;
    }
    .areas button:hover { color: var(--coral); }
    .areas button.on { color: var(--coral); transform: translateX(4px); }
    .areas button.on::before { opacity: 1; transform: scale(1.3); }
    .areas button:focus-visible { outline: 3px solid var(--coral); outline-offset: 2px; border-radius: 8px; }

    .panel { display: grid; gap: 2rem; min-width: 0; }
    .group { animation: in 0.4s cubic-bezier(0.2, 0.8, 0.2, 1) both; }
    @keyframes in { from { opacity: 0; transform: translateY(8px); } }
    .group h2 { margin-bottom: 0.9rem; padding-bottom: 0.6rem; border-bottom: 1px solid var(--line); color: var(--indigo); font-size: 1.15rem; }
    .chips { display: flex; flex-wrap: wrap; gap: 0.55rem; }
    .chips li {
      display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.4rem 0.95rem; border: 1px solid var(--line); border-radius: 999px;
      background: var(--white); color: var(--indigo); font-size: 0.92rem; font-weight: 600; transition: border-color 0.2s, transform 0.2s;
    }
    .chips li:hover { border-color: var(--coral); transform: translateY(-2px); }
    .chips img { width: 1.15rem; height: 1.15rem; object-fit: contain; }

    @media (max-width: 900px) {
      .layout { grid-template-columns: 1fr; gap: 1.5rem; }
      .areas { position: static; display: flex; overflow-x: auto; gap: 0.5rem; padding-bottom: 0.4rem; scrollbar-width: none; max-width: 100%; }
      .areas::-webkit-scrollbar { display: none; }
      .areas button { flex: none; padding: 0.5rem 1rem; border: 1px solid var(--line); border-radius: 999px; font-size: 0.95rem; white-space: nowrap; }
      .areas button::before { display: none; }
      .areas button.on { transform: none; border-color: var(--coral); background: rgba(248, 107, 73, 0.08); }
    }
    @media (prefers-reduced-motion: reduce) { .group { animation: none; } }
  `,
})
export class SkillsPage {
  private readonly profile = inject(ProfileService).profile;
  protected readonly groups = computed(() => this.profile().allSkills ?? []);
  protected readonly active = signal('');
  /** the open area: the one picked, or the first until something is picked */
  protected readonly current = computed(() => this.active() || this.groups()[0]?.group || '');
  protected readonly shown = computed(() => this.groups().filter((g) => g.group === this.current()));
  protected logo(name: string): string | undefined {
    return TECH_LOGOS[name];
  }
}
