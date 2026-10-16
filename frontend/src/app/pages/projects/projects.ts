import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProfileService } from '../../core/profile.service';
import { SiteFooter } from '../../layout/site-footer';
import { SiteHeader } from '../../layout/site-header';
import { Arrow } from '../../shared/arrow';
import { ProjectCard } from '../../shared/project-card';

/** All projects: a filterable bento grid, with the featured project shown larger. */
@Component({
  selector: 'app-projects-page',
  imports: [SiteHeader, SiteFooter, ProjectCard, RouterLink, Arrow],
  template: `
    <app-site-header />

    <main>
      <section class="intro">
        <div class="container intro__inner">
          <div class="intro__text">
            <a routerLink="/" fragment="projects" class="split-btn split-btn--sm split-btn--back"><app-arrow dir="left" /><span class="split-btn__label">Back to home</span></a>

            <p class="intro__eyebrow"><span>{{ all().length }}</span> projects and counting</p>
            <h1><span class="outline">All</span> <em>projects</em></h1>
            <p class="intro__lead">Things I've designed, built and shipped, from interfaces to data pipelines and AI.</p>

            <ul class="filters" role="tablist" aria-label="Filter projects by category">
              @for (c of categories(); track c) {
                <li>
                  <button type="button" role="tab" [attr.aria-selected]="c === active()" [class.on]="c === active()" (click)="active.set(c)">
                    {{ c }}
                  </button>
                </li>
              }
            </ul>
          </div>

          <div class="fan" aria-hidden="true">
            @for (p of fan(); track p.title; let i = $index) {
              <div class="fan__card" [style.--i]="i" [style.--h]="235 + i * 37 * 1">
                <span class="fan__cat">{{ p.category }}</span>
                <span class="fan__num">0{{ i + 1 }}</span>
              </div>
            }
          </div>
        </div>
      </section>

      <section class="list">
        <div class="container">
          <p class="count">Showing {{ shown().length }} of {{ all().length }}</p>

          <div class="bento">
            @for (p of shown(); track p.title; let i = $index) {
              <app-project-card class="bento__item" [class.bento__item--wide]="p.featured && active() === 'All'" [project]="p" [index]="indexOf(p)" [wide]="!!p.featured && active() === 'All'" />
            }
          </div>
        </div>
      </section>
    </main>

    <app-site-footer />
  `,
  styles: `
    ul { margin: 0; padding: 0; list-style: none; }

    /* a light, editorial header: oversized type, the filters built in, and a fan of covers */
    .intro {
      position: relative; overflow: hidden; background: var(--surface);
      padding-block: clamp(2rem, 5vw, 3.5rem) clamp(2.5rem, 6vw, 4.5rem);
    }
    .intro::before {
      content: ''; position: absolute; inset: 0; pointer-events: none;
      background-image: radial-gradient(#d3d0ea 1.3px, transparent 1.3px); background-size: 24px 24px;
      mask-image: radial-gradient(ellipse at 70% 40%, #000 0%, transparent 70%);
    }
    .intro__inner { position: relative; display: grid; grid-template-columns: 1.15fr 0.85fr; gap: 2rem; align-items: center; }

    .split-btn--back { margin-bottom: 1.75rem; }

    .intro__eyebrow { margin: 0 0 0.5rem; color: var(--muted); font: 600 0.85rem var(--font-heading); letter-spacing: 0.14em; text-transform: uppercase; }
    .intro__eyebrow span { color: var(--coral); }

    h1 { margin: 0; font-size: clamp(3.2rem, 9vw, 6.5rem); font-weight: 800; line-height: 0.95; letter-spacing: -0.03em; color: var(--indigo); }
    .outline { margin-right: 0.2em; color: transparent; -webkit-text-stroke: 2px var(--indigo); }
    h1 em { font-style: normal; color: var(--coral); }
    .intro__lead { max-width: 30rem; margin: 1.25rem 0 1.75rem; color: var(--muted); font-size: 1.1rem; }

    .filters { display: flex; flex-wrap: wrap; gap: 0.5rem; }
    .filters button {
      padding: 0.5rem 1.15rem; border: 1px solid #d3d0ea; border-radius: 999px; background: var(--white); color: var(--indigo);
      font: 600 0.88rem var(--font-heading); cursor: pointer; transition: background 0.2s, color 0.2s, border-color 0.2s;
    }
    .filters button:hover { border-color: var(--coral); }
    .filters button.on { background: var(--indigo); border-color: var(--indigo); color: var(--white); }
    .filters button:focus-visible { outline: 3px solid var(--coral); outline-offset: 2px; }

    /* three covers fanned out like a hand of cards */
    .fan { position: relative; height: clamp(17rem, 30vw, 24rem); }
    .fan__card {
      position: absolute; top: calc(8% + var(--i) * 3%); right: calc(3% + (2 - var(--i)) * 25%); width: clamp(9rem, 15vw, 13rem); aspect-ratio: 4 / 5;
      border-radius: 22px; overflow: hidden; border: 1px solid rgba(255, 255, 255, 0.35);
      transform: rotate(calc((var(--i) - 1) * 8deg));
      background:
        radial-gradient(circle at 20% 20%, rgba(248, 107, 73, 0.85), transparent 48%),
        radial-gradient(circle at 80% 80%, hsl(var(--h) 70% 62% / 0.85), transparent 55%),
        linear-gradient(135deg, #342f70, #232052);
      box-shadow: 0 24px 48px rgba(52, 47, 112, 0.28);
      animation: fan 0.9s cubic-bezier(0.2, 0.8, 0.2, 1) backwards; animation-delay: calc(var(--i) * 0.12s + 0.2s);
    }
    .fan__cat {
      position: absolute; top: 0.9rem; left: 0.9rem; padding: 0.2rem 0.7rem; border-radius: 999px; color: var(--white);
      background: rgba(255, 255, 255, 0.16); border: 1px solid rgba(255, 255, 255, 0.3); font: 600 0.7rem var(--font-heading);
    }
    .fan__num {
      position: absolute; left: 0.8rem; bottom: -0.2rem; font: 800 2.4rem var(--font-heading); line-height: 1;
      color: transparent; -webkit-text-stroke: 1.2px rgba(255, 255, 255, 0.65);
    }
    @keyframes fan { from { opacity: 0; transform: translateY(24px) rotate(0deg); } }

    .list { background: var(--white); padding-block: clamp(1.75rem, 4vw, 3rem) clamp(3rem, 7vw, 5rem); }
    .count { margin: 0 0 1.25rem; color: var(--muted); font-size: 0.9rem; }

    .bento { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 1.5rem; grid-auto-flow: dense; }
    .bento__item { animation: in 0.4s ease both; }
    .bento__item--wide { grid-column: span 2; grid-row: span 2; }
    @keyframes in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }

    @media (max-width: 960px) {
      .intro__inner { grid-template-columns: 1fr; }
      .fan { display: none; }
      .bento { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .bento__item--wide { grid-row: auto; }
    }
    @media (max-width: 620px) { .bento { grid-template-columns: 1fr; } .bento__item--wide { grid-column: auto; } }
    @media (prefers-reduced-motion: reduce) { .bento__item, .fan__card { animation: none; } }
  `,
})
export class ProjectsPage {
  private readonly profile = inject(ProfileService).profile;
  protected readonly all = computed(() => this.profile().projects ?? []);
  protected readonly fan = computed(() => this.all().slice(0, 3));

  protected readonly active = signal('All');
  protected readonly categories = computed(() => ['All', ...new Set(this.all().map((p) => p.category).filter((c): c is string => !!c))]);
  protected readonly shown = computed(() => (this.active() === 'All' ? this.all() : this.all().filter((p) => p.category === this.active())));

  /** Each project keeps its own number and colours, even when a filter hides the others. */
  protected indexOf(p: { title: string }): number {
    return this.all().findIndex((x) => x.title === p.title);
  }
}
