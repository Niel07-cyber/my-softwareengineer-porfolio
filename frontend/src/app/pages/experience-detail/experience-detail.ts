import { Component, computed, effect, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProfileService } from '../../core/profile.service';
import { Reveal } from '../../core/reveal.directive';
import { SiteFooter } from '../../layout/site-footer';
import { SiteHeader } from '../../layout/site-header';
import { Arrow } from '../../shared/arrow';
import { slug } from '../../shared/slug';

/** One page per company or lab: /experience/alstom-sa, /experience/litl-lab, ... */
@Component({
  selector: 'app-experience-detail-page',
  imports: [SiteHeader, SiteFooter, RouterLink, Reveal, Arrow],
  template: `
    <app-site-header />

    <main>
      @let e = exp();
      @if (e) {
        <section class="hero">
          <div class="container">
            <a routerLink="/experience" class="hero__back"><app-arrow dir="left" tone="light" />All work experience</a>

            <div class="hero__row">
              <div class="hero__frame">
                @if (e.logo) {
                  <img [src]="e.logo" [alt]="e.company + ' logo'" />
                } @else {
                  <span class="hero__mark" aria-hidden="true">{{ e.mark }}</span>
                }
              </div>

              <div>
                <h1>{{ e.company }}</h1>
                @if (e.role) {
                  <p class="hero__role">{{ e.role }}</p>
                }
                <ul class="hero__meta">
                  @if (e.location) {
                    <li>
                      <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
                        <path d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z" fill="currentColor" />
                      </svg>
                      {{ e.location }}
                    </li>
                  }
                  @if (e.period) {
                    <li class="pill">{{ e.period }}</li>
                  }
                  @if (current()) {
                    <li class="now"><i></i>Current role</li>
                  }
                  @if (e.kind === 'lab') {
                    <li class="pill pill--soft">Research lab</li>
                  }
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section class="body">
          <div class="container body__inner">
            @if (e.metrics?.length) {
              <ul class="metrics" appReveal>
                @for (m of e.metrics; track m.label) {
                  <li><strong>{{ m.value }}</strong><span>{{ m.label }}</span></li>
                }
              </ul>
            }

            @if (e.highlights?.length) {
              <article class="block" appReveal>
                <h2>What I did</h2>
                <ol class="steps">
                  @for (h of e.highlights; track h) {
                    <li>{{ h }}</li>
                  }
                </ol>
              </article>
            }

            @if (e.stack?.length) {
              <article class="block" appReveal>
                <h2>Tech stack</h2>
                <ul class="stack">
                  @for (t of e.stack; track t) {
                    <li>{{ t }}</li>
                  }
                </ul>
              </article>
            }

            @if (!e.highlights?.length) {
              <article class="block" appReveal>
                <h2>What I did</h2>
                <p class="soon">The full story for this one is coming soon.</p>
              </article>
            }

            <nav class="pager" aria-label="Other experience">
              @if (prev(); as p) {
                <a [routerLink]="['/experience', slug(p.company)]" class="pager__link">
                  <app-arrow dir="left" tone="light" />
                  <span><small>Previous</small><strong>{{ p.company }}</strong></span>
                </a>
              }
              @if (next(); as n) {
                <a [routerLink]="['/experience', slug(n.company)]" class="pager__link pager__link--next">
                  <span><small>Next</small><strong>{{ n.company }}</strong></span>
                  <app-arrow />
                </a>
              }
            </nav>
          </div>
        </section>
      } @else {
        <section class="hero">
          <div class="container">
            <a routerLink="/experience" class="hero__back"><app-arrow dir="left" tone="light" />All work experience</a>
            <h1>Not found</h1>
            <p class="hero__role">I couldn't find that place on my experience list.</p>
          </div>
        </section>
      }
    </main>

    <app-site-footer />
  `,
  styles: `
    ul, ol { margin: 0; padding: 0; list-style: none; }

    .hero {
      background: radial-gradient(circle at 80% 20%, #4a43a0 0%, var(--indigo) 45%, var(--indigo-deep) 100%);
      color: var(--white);
      padding-block: clamp(2rem, 5vw, 3.5rem);
    }
    .hero__back { display: inline-flex; align-items: center; gap: 0.6rem; margin-bottom: 1.5rem; --arrow-size: 2rem; color: rgba(255, 255, 255, 0.7); font-weight: 500; }
    .hero__back:hover { color: var(--white); }
    .hero__back:hover app-arrow { --arrow-bg: var(--coral); --arrow-fg: var(--white); --arrow-nudge: 3px; }
    .hero__row { display: flex; align-items: center; gap: clamp(1.25rem, 3vw, 2rem); flex-wrap: wrap; }
    .hero__frame {
      display: grid; place-items: center; width: 112px; aspect-ratio: 1; flex: none;
      border: 3px solid transparent; border-radius: 28px; box-shadow: 0 16px 36px rgba(0, 0, 0, 0.25);
      background: linear-gradient(var(--white), var(--white)) padding-box, linear-gradient(135deg, var(--coral), #6b65c4) border-box;
    }
    .hero__frame img { max-width: 70%; max-height: 62%; width: auto; height: auto; object-fit: contain; display: block; }
    .hero__mark {
      display: grid; place-items: center; width: 58%; aspect-ratio: 1; border-radius: 18px;
      background: linear-gradient(135deg, #4a43a0, var(--indigo)); color: var(--white); font: 800 1.2rem var(--font-heading);
    }
    h1 { margin: 0; font-size: clamp(2rem, 4.5vw, 3rem); font-weight: 800; }
    .hero__role { margin: 0.35rem 0 0; color: var(--coral); font: 700 clamp(1.05rem, 2vw, 1.4rem) var(--font-heading); }
    .hero__meta { display: flex; flex-wrap: wrap; align-items: center; gap: 0.6rem 1rem; margin-top: 1rem; color: rgba(255, 255, 255, 0.8); font-size: 0.95rem; }
    .hero__meta li { display: inline-flex; align-items: center; gap: 0.35rem; }
    .hero__meta svg { color: var(--coral); }
    .pill { padding: 0.2rem 0.8rem; border-radius: 999px; background: rgba(248, 107, 73, 0.2); color: #ffb39f; font: 700 0.8rem var(--font-heading); }
    .pill--soft { background: rgba(255, 255, 255, 0.12); color: var(--white); }
    .now { color: #5ee6a0; font-weight: 600; }
    .now i { width: 0.5rem; height: 0.5rem; border-radius: 50%; background: #2ecc8f; }

    .body { background: var(--surface); padding-block: clamp(2rem, 5vw, 3.5rem) clamp(3rem, 7vw, 5rem); }
    .body__inner { display: grid; gap: 1.5rem; max-width: 62rem; }

    .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; }
    .metrics li { padding: 1.25rem 1.4rem; background: var(--white); border: 1px solid var(--line); border-radius: var(--radius); }
    .metrics strong { display: block; color: var(--coral); font: 800 clamp(1.8rem, 3.5vw, 2.4rem) var(--font-heading); line-height: 1.1; }
    .metrics span { color: var(--muted); font-size: 0.9rem; }

    .block { padding: clamp(1.25rem, 3vw, 2rem); background: var(--white); border: 1px solid var(--line); border-radius: var(--radius); }
    .block h2 { margin: 0 0 1.25rem; color: var(--indigo); font-size: 1.3rem; }

    .steps { display: grid; gap: 1.1rem; counter-reset: step; }
    .steps li { position: relative; padding-left: 3.25rem; color: var(--muted); font-size: 1.02rem; counter-increment: step; }
    .steps li::before {
      content: counter(step, decimal-leading-zero); position: absolute; left: 0; top: -0.1rem;
      color: var(--coral); font: 800 1.35rem var(--font-heading);
    }

    .stack { display: flex; flex-wrap: wrap; gap: 0.55rem; }
    .stack li { padding: 0.3rem 0.85rem; border-radius: 999px; background: var(--surface); color: var(--indigo); font-size: 0.85rem; font-weight: 600; }
    .soon { margin: 0; color: var(--muted); font-style: italic; }

    .pager { display: flex; justify-content: space-between; gap: 1rem; flex-wrap: wrap; margin-top: 0.5rem; }
    .pager__link {
      display: flex; align-items: center; gap: 1rem; min-width: 14rem; padding: 0.8rem 1.2rem 0.8rem 0.8rem;
      background: var(--white); border: 1px solid var(--line); border-radius: 999px;
      transition: box-shadow 0.25s, border-color 0.25s; --arrow-size: 2.75rem;
    }
    .pager__link--next { margin-left: auto; padding: 0.8rem 0.8rem 0.8rem 1.4rem; text-align: right; }
    .pager__link span { display: grid; gap: 0.1rem; }
    .pager__link:hover { box-shadow: 0 12px 28px rgba(52, 47, 112, 0.1); border-color: var(--coral); }
    .pager__link:hover app-arrow { --arrow-bg: var(--coral); --arrow-nudge: 3px; }
    .pager small { color: var(--muted); font-size: 0.78rem; letter-spacing: 0.06em; text-transform: uppercase; }
    .pager strong { color: var(--indigo); font-family: var(--font-heading); }
  `,
})
export class ExperienceDetailPage {
  private readonly profile = inject(ProfileService).profile;
  private readonly title = inject(Title);
  private readonly params = toSignal(inject(ActivatedRoute).paramMap);

  protected readonly slug = slug;
  private readonly list = computed(() => this.profile().experience ?? []);
  private readonly index = computed(() => this.list().findIndex((x) => slug(x.company) === this.params()?.get('slug')));

  protected readonly exp = computed(() => this.list()[this.index()]);
  protected readonly current = computed(() => this.exp()?.period?.includes('Present') ?? false);
  // wrap around so there is always somewhere to go next
  protected readonly prev = computed(() => this.neighbour(-1));
  protected readonly next = computed(() => this.neighbour(1));

  constructor() {
    effect(() => {
      const e = this.exp();
      this.title.setTitle(e ? `${e.company} — Work experience — Othniel Aryee` : 'Not found — Othniel Aryee');
    });
  }

  private neighbour(step: number) {
    const list = this.list();
    if (list.length < 2 || this.index() < 0) return undefined;
    return list[(this.index() + step + list.length) % list.length];
  }
}
