import { Component, ElementRef, afterNextRender, computed, effect, inject, signal, viewChild, DestroyRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProfileService } from '../../core/profile.service';
import { SiteFooter } from '../../layout/site-footer';
import { SiteHeader } from '../../layout/site-header';
import { Arrow } from '../../shared/arrow';
import { ProjectCard } from '../../shared/project-card';

/** All projects: a filterable bento grid, every project a wide strip. */
@Component({
  selector: 'app-projects-page',
  imports: [SiteHeader, SiteFooter, ProjectCard, RouterLink, Arrow],
  template: `
    <app-site-header />

    <main>
      <section class="intro">
        <div class="container intro__inner">
          <div class="intro__text">
            <a routerLink="/" class="split-btn split-btn--sm split-btn--back"><app-arrow dir="left" /><span class="split-btn__label">Back to home</span></a>

            <p class="intro__eyebrow"><span>{{ all().length }}</span> projects and counting</p>
            <h1><span class="outline">All</span> <em>projects</em></h1>
            <p class="intro__lead">Things I've designed, built and shipped, from interfaces to data pipelines and AI.</p>

            <!-- a glass segmented control: the lit thumb slides to whichever filter you pick -->
            <div #seg class="seg" role="tablist" aria-label="Filter projects by category">
              <span class="seg__thumb" aria-hidden="true"></span>
              @for (c of categories(); track c) {
                <button type="button" role="tab" [attr.aria-selected]="c === active()" [class.on]="c === active()" (click)="active.set(c)">
                  {{ c }}
                </button>
              }
            </div>
          </div>

          <div class="fan" aria-hidden="true" (mouseenter)="paused = true" (mouseleave)="paused = false">
            @for (c of fan(); track c.label; let i = $index) {
              <div class="fan__card" [style.--i]="i" [style.--n]="fan().length" [style.--s]="(i + shift()) % fan().length" [style.--h]="235 + i * 37" [style.background-color]="c.bg">
                @if (c.image) {
                  <img class="fan__img" [src]="c.image" alt="" />
                }
                <span class="fan__cat">{{ c.label }}</span>
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
              <app-project-card class="bento__item" [project]="p" [index]="indexOf(p)" [wide]="true" />
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
      padding-block: calc(clamp(2rem, 5vw, 3.5rem) + var(--nav-space)) clamp(2.5rem, 6vw, 4.5rem);
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

    /* liquid-glass segmented control, like the iOS one */
    .seg {
      position: relative; display: inline-flex; max-width: 100%; padding: 4px; gap: 2px; overflow-x: auto; scrollbar-width: none;
      border-radius: 999px; background: rgba(255, 255, 255, 0.45); border: 1px solid rgba(255, 255, 255, 0.85);
      -webkit-backdrop-filter: blur(16px) saturate(180%); backdrop-filter: blur(16px) saturate(180%);
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.9), inset 0 -1px 0 rgba(52, 47, 112, 0.06), 0 8px 24px rgba(52, 47, 112, 0.12);
    }
    .seg::-webkit-scrollbar { display: none; }
    .seg button {
      position: relative; z-index: 1; flex: none; padding: 0.5rem 1.15rem; border: 0; border-radius: 999px; background: none;
      color: var(--muted); font: 600 0.88rem var(--font-heading); cursor: pointer; transition: color 0.25s;
    }
    .seg button:hover { color: var(--indigo); }
    .seg button.on { color: var(--indigo); }
    .seg button:focus-visible { outline: 3px solid var(--coral); outline-offset: -2px; }
    /* the thumb: a brighter pane of glass that glides (with a little spring) under the selected option */
    .seg__thumb {
      position: absolute; top: 4px; bottom: 4px; left: var(--x, 4px); width: var(--w, 0); z-index: 0; border-radius: 999px;
      background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(255, 255, 255, 0.72));
      border: 1px solid rgba(255, 255, 255, 0.95);
      box-shadow: inset 0 1px 0 #fff, 0 6px 16px rgba(52, 47, 112, 0.22), 0 1px 3px rgba(52, 47, 112, 0.18);
      opacity: 0;
    }
    .seg--ready .seg__thumb { opacity: 1; transition: left 0.5s cubic-bezier(0.3, 1.35, 0.4, 1), width 0.5s cubic-bezier(0.3, 1.35, 0.4, 1); }

    /* three covers fanned out like a hand of cards */
    .fan { position: relative; height: clamp(17rem, 30vw, 24rem); }
    .fan__card {
      /* --s is the card's place in the hand (0 back, the last one front); it changes every few seconds, so the cards shuffle */
      position: absolute; top: calc(18% + var(--s) * 2.5%); right: calc(0% + (var(--n) - 1 - var(--s)) * (70% / (var(--n) - 1))); width: clamp(7.5rem, 12vw, 10.5rem); aspect-ratio: 4 / 5;
      border-radius: 22px; overflow: hidden; border: 1px solid rgba(255, 255, 255, 0.35);
      z-index: var(--s);
      transform: rotate(calc((var(--s) - (var(--n) - 1) / 2) * 6deg));
      transition: top 0.9s cubic-bezier(0.5, 0, 0.2, 1), right 0.9s cubic-bezier(0.5, 0, 0.2, 1), transform 0.9s cubic-bezier(0.5, 0, 0.2, 1);
      background:
        radial-gradient(circle at 20% 20%, rgba(248, 107, 73, 0.85), transparent 48%),
        radial-gradient(circle at 80% 80%, hsl(var(--h) 70% 62% / 0.85), transparent 55%),
        linear-gradient(135deg, #342f70, #232052);
      box-shadow: 0 24px 48px rgba(52, 47, 112, 0.28);
      animation: fan 0.9s cubic-bezier(0.2, 0.8, 0.2, 1) backwards; animation-delay: calc(var(--i) * 0.12s + 0.2s);
    }
    /* the project's own cover fills the card (its middle is cropped to the card's tall shape) */
    .fan__img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
    .fan__card:has(.fan__img)::after { content: ''; position: absolute; inset: 0; background: linear-gradient(to top, rgba(20, 16, 60, 0.55), transparent 45%); pointer-events: none; }
    .fan__cat, .fan__num { z-index: 1; }
    .fan__cat {
      position: absolute; top: 0.9rem; left: 0.9rem; padding: 0.2rem 0.7rem; border-radius: 999px; color: var(--white);
      background: rgba(24, 20, 70, 0.5); border: 1px solid rgba(255, 255, 255, 0.3); font: 600 0.7rem var(--font-heading);
    }
    .fan__num {
      position: absolute; left: 0.8rem; bottom: -0.2rem; font: 800 2.4rem var(--font-heading); line-height: 1;
      color: transparent; -webkit-text-stroke: 1.2px rgba(255, 255, 255, 0.65);
    }
    @keyframes fan { from { opacity: 0; transform: translateY(24px) rotate(0deg); } }

    .list { background: var(--white); padding-block: clamp(1.75rem, 4vw, 3rem) clamp(3rem, 7vw, 5rem); }
    .count { margin: 0 0 1.25rem; color: var(--muted); font-size: 0.9rem; }

    .bento { display: grid; grid-template-columns: minmax(0, 1fr); gap: 1.5rem; }
    .bento__item { animation: in 0.4s ease both; }
    @keyframes in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }

    @media (max-width: 960px) {
      .intro__inner { grid-template-columns: 1fr; }
      .fan { display: none; }
    }
    @media (prefers-reduced-motion: reduce) { .bento__item, .fan__card { animation: none; transition: none; } .seg--ready .seg__thumb { transition: none; } }
  `,
})
export class ProjectsPage {
  private readonly profile = inject(ProfileService).profile;
  protected readonly all = computed(() => this.profile().projects ?? []);
  // the hand of covers: one per kind of work (Web is left out, since Frontend and Backend together make it)
  protected readonly fan = computed(() => {
    const by = (title: string) => this.all().find((p) => p.title === title);
    // one cover per kind of work; the label stays the category, the picture is a project of that kind
    return [
      { label: 'Cloud', p: by('EventX') },
      { label: 'Backend', p: by('ScribeEngine') },
      { label: 'Frontend', p: by('JuniaDrive') },
      { label: 'AI', p: by('Histopathology AI') },
    ].map(({ label, p }) => ({ label, image: p?.image, bg: p?.imageBg }));
  });
  // the hand of cards shuffles itself: every few seconds each card moves to the next place, the front one going to the back
  protected readonly shift = signal(0);
  protected paused = false;

  protected readonly active = signal('All');
  protected readonly categories = computed(() => ['All', ...new Set(this.all().map((p) => p.category).filter((c): c is string => !!c))]);
  protected readonly shown = computed(() => (this.active() === 'All' ? this.all() : this.all().filter((p) => p.category === this.active())));

  private readonly seg = viewChild<ElementRef<HTMLElement>>('seg');

  constructor() {
    const destroyRef = inject(DestroyRef);
    // put the glass thumb under the selected option (and keep it there if the layout changes)
    const place = () => {
      const bar = this.seg()?.nativeElement;
      const on = bar?.querySelector<HTMLElement>('button.on');
      if (!bar || !on) return;
      bar.style.setProperty('--x', `${on.offsetLeft}px`);
      bar.style.setProperty('--w', `${on.offsetWidth}px`);
      // keep the chosen option in view when the control scrolls (narrow screens)
      const mid = on.offsetLeft - (bar.clientWidth - on.offsetWidth) / 2;
      if (bar.scrollWidth > bar.clientWidth) bar.scrollTo({ left: mid, behavior: 'smooth' });
    };
    afterNextRender(() => {
      if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
        const timer = setInterval(() => {
          if (!this.paused && !document.hidden) this.shift.update((n) => n + 1);
        }, 3200);
        destroyRef.onDestroy(() => clearInterval(timer));
      }
      place();
      // switch the slide animation on only after the first placement, so it doesn't glide in from the left edge
      requestAnimationFrame(() => this.seg()?.nativeElement.classList.add('seg--ready'));
      const bar = this.seg()?.nativeElement;
      if (!bar) return;
      const ro = new ResizeObserver(() => place());
      ro.observe(bar);
      document.fonts?.ready.then(place);
      destroyRef.onDestroy(() => ro.disconnect());
    });
    effect(() => {
      this.active();
      // wait for the DOM to show the new selection before measuring it
      queueMicrotask(place);
    });
  }

  /** Each project keeps its own number and colours, even when a filter hides the others. */
  protected indexOf(p: { title: string }): number {
    return this.all().findIndex((x) => x.title === p.title);
  }
}
