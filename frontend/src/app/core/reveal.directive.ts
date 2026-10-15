import { Directive, ElementRef, DestroyRef, afterNextRender, inject, signal } from '@angular/core';

/** Fades an element in (see `.reveal` in styles.scss) the first time it scrolls into view. */
@Directive({
  selector: '[appReveal]',
  host: { class: 'reveal', '[class.reveal--in]': 'shown()' },
})
export class Reveal {
  protected readonly shown = signal(false);

  constructor() {
    const el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      if (!('IntersectionObserver' in window)) {
        this.shown.set(true);
        return;
      }
      const io = new IntersectionObserver(
        (entries) => {
          // a batch can hold several entries (e.g. an early "not visible" and a later "visible")
          if (entries.some((e) => e.isIntersecting)) {
            this.shown.set(true);
            io.disconnect();
          }
        },
        { threshold: 0.15, rootMargin: '0px 0px -8% 0px' },
      );
      io.observe(el);
      destroyRef.onDestroy(() => io.disconnect());
    });
  }
}
