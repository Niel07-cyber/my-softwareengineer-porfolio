import { Directive, ElementRef, DestroyRef, afterNextRender, effect, inject, input } from '@angular/core';

/** Counts a number up from 0 the first time it scrolls into view. */
@Directive({ selector: '[appCountUp]' })
export class CountUp {
  readonly target = input.required<number>({ alias: 'appCountUp' });

  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private settled = false;

  constructor() {
    const destroyRef = inject(DestroyRef);
    // until it has counted up (or if the value changes later) the element simply shows the number
    effect(() => {
      const value = this.target();
      if (this.settled || !this.el.textContent) this.el.textContent = String(value);
    });

    afterNextRender(() => {
      const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduced || !('IntersectionObserver' in window)) {
        this.settled = true;
        return;
      }
      this.el.textContent = '0';
      let raf = 0;
      const io = new IntersectionObserver(
        (entries) => {
          if (!entries.some((e) => e.isIntersecting)) return;
          io.disconnect();
          const start = performance.now();
          const tick = (now: number) => {
            const t = Math.min((now - start) / 1100, 1);
            const eased = 1 - Math.pow(1 - t, 3);
            this.el.textContent = String(Math.round(this.target() * eased));
            if (t < 1) raf = requestAnimationFrame(tick);
            else this.settled = true;
          };
          raf = requestAnimationFrame(tick);
        },
        { threshold: 0.6 },
      );
      io.observe(this.el);
      destroyRef.onDestroy(() => {
        io.disconnect();
        cancelAnimationFrame(raf);
      });
    });
  }
}
