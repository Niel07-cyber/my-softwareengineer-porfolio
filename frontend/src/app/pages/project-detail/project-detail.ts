import { Component, computed, effect, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProfileService } from '../../core/profile.service';
import { Reveal } from '../../core/reveal.directive';
import { SiteFooter } from '../../layout/site-footer';
import { SiteHeader } from '../../layout/site-header';
import { Arrow } from '../../shared/arrow';
import { SocialIcon } from '../../shared/social-icon';
import { slug } from '../../shared/slug';

const hueFor = (i: number) => 235 + ((i * 37) % 120);

/** One page per project: /projects/<title-slug>. The hero is the project's generated cover, blown up into a poster. */
@Component({
  selector: 'app-project-detail-page',
  imports: [SiteHeader, SiteFooter, RouterLink, Reveal, Arrow, SocialIcon],
  template: `
    <app-site-header />

    <main>
      @let p = project();
      @if (p) {
        <section class="poster" [style.--h]="hue()">
          @if (p.image) {
            <div class="poster__art" [style.background-color]="p.imageBg">
              <img class="poster__img" [src]="p.image" [alt]="p.title + ' preview'" />
            </div>
          } @else {
            <span class="poster__num" aria-hidden="true">{{ number() }}</span>
          }
          <div class="container poster__inner">
            <a routerLink="/projects" class="split-btn split-btn--sm split-btn--back"><app-arrow dir="left" tone="light" /><span class="split-btn__label">All projects</span></a>
            <div class="poster__bottom">
              <ul class="poster__pills">
                @if (p.category) { <li>{{ p.category }}</li> }
                @if (p.year) { <li>{{ p.year }}</li> }
              </ul>
              <h1>{{ p.title }}</h1>
              <p class="poster__lead">{{ p.description }}</p>
            </div>
          </div>
        </section>

        <section class="body">
          <div class="container body__grid">
            <div class="main">
              <article class="block" appReveal>
                <h2>Overview</h2>
                @if (p.overview) {
                  <p class="overview">{{ p.overview }}</p>
                } @else {
                  <p class="soon">The full write-up for this one is coming soon.</p>
                }
              </article>

              @if (p.features?.length) {
                <article class="block" appReveal>
                  <h2>What it does</h2>
                  <ol class="features">
                    @for (f of p.features; track f) {
                      <li><span>{{ f }}</span></li>
                    }
                  </ol>
                </article>
              }
            </div>

            <!-- a "repo card": the facts about the project, kept in view while you read -->
            <aside class="repo" appReveal>
              <header class="repo__head">
                <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
                  <path fill="currentColor" d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.04-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z" />
                </svg>
                <strong>{{ slug(p.title) }}</strong>
                <span class="repo__badge">public</span>
              </header>

              <dl class="repo__facts">
                @if (p.category) { <div><dt>Type</dt><dd>{{ p.category }}</dd></div> }
                @if (p.year) { <div><dt>Year</dt><dd>{{ p.year }}</dd></div> }
                @if (p.role) { <div><dt>My role</dt><dd>{{ p.role }}</dd></div> }
              </dl>

              <h3>Built with</h3>
              <ul class="stack">
                @for (t of p.tags; track t) {
                  <li>{{ t }}</li>
                }
              </ul>

              <div class="repo__actions">
                <!-- the hosted site when there is one; until then it opens the project's repository -->
                <a class="split-btn" [href]="p.live ?? p.link" target="_blank" rel="noopener">
                  <span class="split-btn__label"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9.5" /><path d="M2.5 12h19M12 2.5c2.6 2.8 4 6 4 9.5s-1.4 6.7-4 9.5c-2.6-2.8-4-6-4-9.5s1.4-6.7 4-9.5Z" /></svg>Visit site</span>
                  <app-arrow />
                </a>
                <a class="split-btn" [href]="p.link" target="_blank" rel="noopener"><span class="split-btn__label"><app-social-icon name="github" />View on GitHub</span><app-arrow /></a>
              </div>
            </aside>
          </div>

          @if (next(); as n) {
            <div class="container">
              <a class="next" [routerLink]="['/projects', slug(n.title)]" [style.--h]="nextHue()" appReveal>
                <span class="next__text">
                  <small>Next project</small>
                  <strong>{{ n.title }}</strong>
                </span>
                <app-arrow />
              </a>
            </div>
          }
        </section>
      } @else {
        <section class="body body--nf">
          <div class="container">
            <a routerLink="/projects" class="split-btn split-btn--sm split-btn--back"><app-arrow dir="left" /><span class="split-btn__label">All projects</span></a>
            <h1 class="nf">Not found</h1>
            <p class="soon">I couldn't find that project.</p>
          </div>
        </section>
      }
    </main>

    <app-site-footer />
  `,
  styles: `
    ul, ol, dl, dd { margin: 0; padding: 0; list-style: none; }
    h2, h3 { margin: 0; }

    /* the hero is the cover art itself: drifting colour blobs on indigo, with the project number outlined behind */
    .poster {
      position: relative; overflow: hidden; isolation: isolate; color: var(--white);
      min-height: calc(clamp(13rem, 24vw, 20rem) + var(--nav-space)); display: flex;
      background:
        radial-gradient(circle at 15% 25%, rgba(248, 107, 73, 0.9), transparent 42%),
        radial-gradient(circle at 85% 75%, hsl(var(--h, 250) 70% 62% / 0.9), transparent 50%),
        radial-gradient(circle at 65% 10%, hsl(calc(var(--h, 250) + 40) 80% 70% / 0.5), transparent 40%),
        linear-gradient(135deg, #342f70, #232052);
      background-size: 140% 140%, 140% 140%, 140% 140%, auto;
      animation: drift 16s ease-in-out infinite alternate;
    }
    @keyframes drift { to { background-position: 18% 12%, 82% 90%, 70% 25%, 0 0; } }
    /* the project image fills the right of the header and fades out into the colours behind the title */
    /* the picture's own backdrop colour runs the full height of the header (up behind the menu); the picture sits below the menu on top of it */
    .poster__art {
      position: absolute; top: 0; right: 0; bottom: 0; width: min(52%, 46rem); z-index: -1;
      -webkit-mask-image: linear-gradient(to right, transparent, #000 55%); mask-image: linear-gradient(to right, transparent, #000 55%);
    }
    .poster__img { position: absolute; top: calc(var(--nav-space) - 0.5rem); right: 0; width: 100%; height: calc(100% - var(--nav-space) + 0.5rem); object-fit: cover; }
    /* phones and tablets: the picture goes under the title instead of behind it */
    @media (max-width: 900px) {
      .poster { flex-direction: column; min-height: 0; }
      .poster__art { display: contents; }
      .poster__img { position: static; order: 2; align-self: center; width: min(100% - 2.5rem, 30rem); height: auto; aspect-ratio: 16 / 9; margin-bottom: 1.5rem; border-radius: 16px; box-shadow: 0 14px 32px rgba(20, 16, 60, 0.35); -webkit-mask-image: none; mask-image: none; z-index: auto; }
      .poster__inner { padding-bottom: 1.25rem; }
    }
    .poster__num {
      position: absolute; right: clamp(1rem, 4vw, 3rem); top: 50%; transform: translateY(-50%); z-index: -1;
      font: 800 clamp(6rem, 15vw, 11rem) var(--font-heading); line-height: 1; letter-spacing: -0.04em;
      color: transparent; -webkit-text-stroke: 2px rgba(255, 255, 255, 0.32);
    }
    .poster__inner { display: flex; flex-direction: column; justify-content: space-between; gap: 1.25rem; padding-block: calc(clamp(1.5rem, 3vw, 2.25rem) + var(--nav-space)) clamp(1.75rem, 3.5vw, 2.75rem); }
    .poster__pills { display: flex; gap: 0.5rem; margin-bottom: 0.6rem; }
    .poster__pills li {
      padding: 0.25rem 0.9rem; border-radius: 999px; background: rgba(255, 255, 255, 0.16); border: 1px solid rgba(255, 255, 255, 0.3);
      backdrop-filter: blur(6px); font: 600 0.78rem var(--font-heading); letter-spacing: 0.04em;
    }
    h1 { margin: 0; max-width: 38rem; font-size: clamp(2.2rem, 4.6vw, 3.4rem); font-weight: 800; line-height: 1; letter-spacing: -0.03em; }
    .poster__lead { max-width: 38rem; margin: 0.6rem 0 0; color: rgba(255, 255, 255, 0.85); font-size: clamp(1rem, 1.6vw, 1.2rem); }

    .body { background: var(--surface); padding-block: clamp(2rem, 5vw, 3.5rem) clamp(3rem, 7vw, 5rem); }
    .body--nf { padding-top: calc(clamp(2rem, 5vw, 3.5rem) + var(--nav-space)); }
    .body__grid { display: grid; grid-template-columns: minmax(0, 1fr) 21rem; gap: 1.5rem; align-items: start; }
    .main { display: grid; gap: 1.5rem; min-width: 0; }
    .body__grid > * { min-width: 0; }

    .block { padding: clamp(1.25rem, 3vw, 2rem); background: var(--white); border: 1px solid var(--line); border-radius: var(--radius); }
    .block h2 { margin-bottom: 1.1rem; color: var(--indigo); font-size: 1.3rem; }
    .overview { margin: 0; color: var(--muted); font-size: 1.1rem; max-width: 42rem; }
    .soon { margin: 0; color: var(--muted); font-style: italic; }

    .features { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(12rem, 100%), 1fr)); gap: 0.9rem; counter-reset: f; }
    .features li {
      counter-increment: f; padding: 1rem 1.1rem 1.1rem; border: 1px solid var(--line); border-radius: 16px; color: var(--ink);
      transition: border-color 0.25s, transform 0.25s;
    }
    .features li:hover { border-color: var(--coral); transform: translateY(-2px); }
    .features li::before { content: counter(f, decimal-leading-zero); display: block; margin-bottom: 0.35rem; color: var(--coral); font: 800 1.5rem var(--font-heading); }

    /* repo card */
    .repo { position: sticky; top: 6rem; padding: 1.4rem; background: var(--white); border: 1px solid var(--line); border-radius: var(--radius); }
    .repo__head { display: flex; align-items: center; gap: 0.6rem; padding-bottom: 1rem; border-bottom: 1px dashed var(--line); color: var(--indigo); }
    .repo__head strong { font: 700 1rem ui-monospace, 'SF Mono', Menlo, monospace; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .repo__badge { margin-left: auto; padding: 0.1rem 0.6rem; border: 1px solid var(--line); border-radius: 999px; color: var(--muted); font-size: 0.72rem; }
    .repo__facts { display: grid; gap: 0.65rem; padding: 1rem 0; }
    .repo__facts div { display: flex; justify-content: space-between; gap: 1rem; font-size: 0.92rem; }
    .repo__facts dt { color: var(--muted); }
    .repo__facts dd { color: var(--indigo); font-weight: 600; text-align: right; }
    .repo h3 { margin-bottom: 0.6rem; color: var(--muted); font: 600 0.75rem var(--font-heading); letter-spacing: 0.1em; text-transform: uppercase; }
    .stack { display: flex; flex-wrap: wrap; gap: 0.45rem; }
    .stack li { padding: 0.25rem 0.75rem; border-radius: 999px; background: var(--surface); color: var(--indigo); font-size: 0.82rem; font-weight: 600; }
    .repo__actions { display: grid; gap: 0.55rem; margin-top: 1.2rem; }
    .repo__actions .split-btn { justify-content: space-between; }
    .repo__actions .split-btn app-arrow { --arrow-size: 2.56rem; }
    .repo__actions .split-btn__label { padding: 0.55rem 1.1rem; font-size: 0.88rem; }
    .repo__actions .split-btn__label { white-space: nowrap; }
    .repo__actions .split-btn__label { flex: 1; display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem; --icon-size: 1.1rem; }

    .next {
      display: flex; align-items: center; justify-content: space-between; gap: 1rem; margin-top: 1.5rem; padding: clamp(1.25rem, 3vw, 2rem);
      border-radius: var(--radius); color: var(--white); --arrow-size: 3.4rem;
      background:
        radial-gradient(circle at 12% 30%, rgba(248, 107, 73, 0.8), transparent 45%),
        radial-gradient(circle at 90% 80%, hsl(var(--h, 250) 70% 62% / 0.85), transparent 50%),
        linear-gradient(135deg, #342f70, #232052);
      transition: transform 0.3s, box-shadow 0.3s;
    }
    .next:hover { transform: translateY(-3px); box-shadow: 0 18px 40px rgba(52, 47, 112, 0.25); }
    .next:hover app-arrow { --arrow-bg: var(--coral); --arrow-nudge: 4px; }
    .next small { display: block; opacity: 0.75; font-size: 0.78rem; letter-spacing: 0.1em; text-transform: uppercase; }
    .next strong { font: 800 clamp(1.5rem, 3.6vw, 2.4rem) var(--font-heading); }

    .nf { margin-top: 1.5rem; color: var(--indigo); font-size: 2rem; }

    @media (max-width: 900px) {
      .body__grid { grid-template-columns: 1fr; }
      .repo { position: static; }
    }
    @media (prefers-reduced-motion: reduce) { .poster { animation: none; } }
  `,
})
export class ProjectDetailPage {
  private readonly profile = inject(ProfileService).profile;
  private readonly title = inject(Title);
  private readonly params = toSignal(inject(ActivatedRoute).paramMap);

  protected readonly slug = slug;
  private readonly list = computed(() => this.profile().projects ?? []);
  private readonly index = computed(() => this.list().findIndex((x) => slug(x.title) === this.params()?.get('slug')));

  protected readonly project = computed(() => this.list()[this.index()]);
  protected readonly number = computed(() => String(this.index() + 1).padStart(2, '0'));
  protected readonly hue = computed(() => hueFor(this.index()));
  // wrap around so there is always somewhere to go next
  protected readonly next = computed(() => {
    const list = this.list();
    return list.length > 1 && this.index() >= 0 ? list[(this.index() + 1) % list.length] : undefined;
  });
  protected readonly nextHue = computed(() => hueFor((this.index() + 1) % Math.max(this.list().length, 1)));

  constructor() {
    effect(() => {
      const p = this.project();
      this.title.setTitle(p ? `${p.title} — Projects — Othniel Aryee` : 'Not found — Othniel Aryee');
    });
  }
}
