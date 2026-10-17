import { Component, DestroyRef, afterNextRender, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TECH_LOGOS } from './tech-logos';

const SLOTS = 20; // 10 across, 2 down on a desktop (fewer are shown on smaller screens)
const SWAP_MS = 650;
const OUT_MS = 260;

/**
 * A wall of technology logos (no names). Every moment one tile shrinks away and a different logo pops into its place,
 * so the whole stack drifts past: some go, some come. Hover or focus a tile for its name; each tile opens the Skills page.
 */
@Component({
  selector: 'app-tech-wall',
  imports: [RouterLink],
  template: `
    <div class="wall" role="list" aria-label="Technologies I work with">
      @for (slot of slots(); track $index; let i = $index) {
        <a class="tile" role="listitem" routerLink="/skills" [class.tile--out]="leaving() === i" [attr.aria-label]="slot.name" [attr.data-name]="slot.name">
          @for (t of [slot]; track t.name) {
            <img class="tile__logo" [src]="t.src" alt="" draggable="false" />
          }
        </a>
      }
    </div>
  `,
  styles: `
    :host { display: block; }
    .wall { display: grid; grid-template-columns: repeat(10, minmax(0, 1fr)); gap: clamp(0.5rem, 1.1vw, 0.8rem); }

    .tile {
      position: relative; display: grid; place-items: center; aspect-ratio: 1 / 1; border-radius: 16px;
      background: var(--white); border: 1px solid var(--line);
      transition: transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1), border-color 0.25s, box-shadow 0.3s;
    }
    .tile:hover, .tile:focus-visible { transform: translateY(-4px); border-color: var(--coral); box-shadow: 0 14px 28px rgba(52, 47, 112, 0.12); }

    /* a logo arrives with a little pop; the one leaving shrinks and fades first */
    .tile__logo {
      width: 50%; height: 50%; object-fit: contain; user-select: none;
      animation: pop-in 0.55s cubic-bezier(0.3, 1.5, 0.5, 1) both;
      transition: transform 0.26s ease, opacity 0.26s ease;
    }
    .tile--out .tile__logo { transform: scale(0.4); opacity: 0; }
    @keyframes pop-in { from { transform: scale(0.35) rotate(-12deg); opacity: 0; } }

    /* the name, shown on hover or focus */
    .tile::after {
      content: attr(data-name); position: absolute; left: 50%; bottom: -0.55rem; z-index: 2; padding: 0.2rem 0.7rem; border-radius: 999px;
      background: var(--indigo); color: var(--white); font: 600 0.75rem var(--font-heading); white-space: nowrap;
      opacity: 0; transform: translate(-50%, 4px); pointer-events: none; transition: opacity 0.2s, transform 0.2s;
    }
    .tile:hover::after, .tile:focus-visible::after { opacity: 1; transform: translate(-50%, 0); }

    /* fewer tiles on smaller screens */
    @media (max-width: 900px) { .wall { grid-template-columns: repeat(6, minmax(0, 1fr)); } .tile:nth-child(n + 13) { display: none; } }
    @media (max-width: 520px) { .wall { grid-template-columns: repeat(5, minmax(0, 1fr)); } .tile:nth-child(n + 11) { display: none; } .tile { border-radius: 12px; } .tile__logo { width: 54%; height: 54%; } }
    @media (prefers-reduced-motion: reduce) { .tile__logo { animation: none; transition: none; } .tile { transition: none; } }
  `,
})
export class TechWall {
  /** every skill that has a logo, in a fixed order */
  private readonly pool = Object.entries(TECH_LOGOS).map(([name, src]) => ({ name: name.replace(/ \(.*\)$/, '').replace(' / GitHub', ''), src }));

  protected readonly slots = signal(this.pool.slice(0, SLOTS));
  protected readonly leaving = signal(-1);
  private readonly visible = signal(true);

  constructor() {
    // start from a shuffled pool so the first view is a mix, not an alphabetical run
    this.slots.set(this.shuffle(this.pool).slice(0, SLOTS));

    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const host = document.querySelector('app-tech-wall');
      let timer: ReturnType<typeof setTimeout> | undefined;

      const io = host ? new IntersectionObserver(([e]) => this.visible.set(e.isIntersecting)) : undefined;
      if (host) io?.observe(host);

      const tick = () => {
        if (this.visible() && !document.hidden && this.leaving() < 0) this.swap();
        timer = setTimeout(tick, SWAP_MS);
      };
      timer = setTimeout(tick, SWAP_MS);
      destroyRef.onDestroy(() => {
        clearTimeout(timer);
        io?.disconnect();
      });
    });
  }

  /** shrink one on-screen tile away, then put a logo that isn't showing into its place */
  private swap(): void {
    const shown = document.querySelectorAll<HTMLElement>('app-tech-wall .tile');
    const onScreen = [...shown].map((el, i) => (getComputedStyle(el).display === 'none' ? -1 : i)).filter((i) => i >= 0);
    const i = onScreen[Math.floor(Math.random() * onScreen.length)];
    const current = this.slots();
    const free = this.pool.filter((p) => !current.some((c) => c.name === p.name));
    if (i === undefined || !free.length) return;

    this.leaving.set(i);
    setTimeout(() => {
      const next = free[Math.floor(Math.random() * free.length)];
      this.slots.update((list) => list.map((s, k) => (k === i ? next : s)));
      this.leaving.set(-1);
    }, OUT_MS);
  }

  private shuffle<T>(list: T[]): T[] {
    const a = [...list];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
}
