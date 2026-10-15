import { Component, DestroyRef, afterNextRender, computed, inject, signal } from '@angular/core';
import { HeroScene } from './hero-scene';
import { SiteFooter } from '../../layout/site-footer';
import { SiteHeader } from '../../layout/site-header';
import { Arrow } from '../../shared/arrow';
import { ExperienceSummary } from '../../shared/experience-summary';
import { Reveal } from '../../core/reveal.directive';
import { ProfileService } from '../../core/profile.service';

const GREETING_MS = 5_000;
const ERASE_MS = 500;

@Component({
  imports: [HeroScene, Reveal, ExperienceSummary, SiteHeader, SiteFooter, Arrow],
  host: { '(click)': 'onAnchorClick($event)' },
  selector: 'app-home',
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  protected readonly profile = inject(ProfileService).profile;
  protected readonly initials = computed(() =>
    this.profile()
      .name.split(' ')
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase(),
  );
  protected readonly techStack = computed(() =>
    this.profile()
      .skills.flatMap((g) => g.items)
      .slice(0, 12),
  );
  protected readonly roleParts = computed(() => {
    const [main, second = ''] = this.profile().role.split(' & ');
    return { main, second };
  });
  protected readonly photoMissing = signal(false);


  /**
   * In-page links scroll smoothly without writing `#section` into the address bar, so a refresh
   * starts at the top instead of jumping back to the last section you clicked.
   */
  protected onAnchorClick(event: MouseEvent): void {
    const link = (event.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
    const hash = link?.getAttribute('href');
    if (!hash || hash.length < 2) return;
    event.preventDefault();
    const target = hash === '#top' ? null : document.querySelector(hash);
    if (hash === '#top') window.scrollTo({ top: 0, behavior: 'smooth' });
    else target?.scrollIntoView({ behavior: 'smooth' });
  }

  // the greeting types itself out, then swaps language every GREETING_MS
  private readonly greetings = computed(() => {
    const name = this.profile().name;
    return [`Hi, I am ${name}`, `Salut, Je suis ${name}`];
  });
  protected readonly typed = signal('');
  protected readonly greeting = computed(() => this.greetings()[0]);

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
      let timer: ReturnType<typeof setTimeout>;
      let stopped = false;
      destroyRef.onDestroy(() => {
        stopped = true;
        clearTimeout(timer);
      });
      const wait = (ms: number) => new Promise<void>((r) => (timer = setTimeout(r, ms)));

      void (async () => {
        let i = 0;
        while (!stopped) {
          const text = this.greetings()[i % this.greetings().length];
          const started = Date.now();
          if (reduced) {
            this.typed.set(text);
          } else {
            for (let n = 1; n <= text.length && !stopped; n++) {
              this.typed.set(text.slice(0, n));
              await wait(85);
            }
          }
          // hold until GREETING_MS has passed since this greeting started, then rub it out
          await wait(Math.max(GREETING_MS - (Date.now() - started) - ERASE_MS, 0));
          if (!reduced) {
            for (let n = text.length - 1; n >= 0 && !stopped; n--) {
              this.typed.set(text.slice(0, n));
              await wait(ERASE_MS / text.length);
            }
          }
          i++;
        }
      })();
    });
  }
}
