import { Directive, ElementRef, inject } from '@angular/core';

/** Gives an element a gentle 3D tilt and a soft spotlight that follow the mouse (see the --rx/--ry/--mx/--my vars). */
@Directive({
  selector: '[appTilt]',
  host: { '(pointermove)': 'move($event)', '(pointerleave)': 'reset()' },
})
export class Tilt {
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  protected move(e: PointerEvent): void {
    if (this.reduced || e.pointerType !== 'mouse') return;
    const r = this.el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    const s = this.el.style;
    s.setProperty('--rx', `${((0.5 - py) * 12).toFixed(2)}deg`);
    s.setProperty('--ry', `${((px - 0.5) * 12).toFixed(2)}deg`);
    s.setProperty('--mx', `${(px * 100).toFixed(1)}%`);
    s.setProperty('--my', `${(py * 100).toFixed(1)}%`);
  }

  protected reset(): void {
    const s = this.el.style;
    ['--rx', '--ry', '--mx', '--my'].forEach((v) => s.removeProperty(v));
  }
}
