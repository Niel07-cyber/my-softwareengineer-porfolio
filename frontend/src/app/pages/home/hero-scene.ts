import { Component, ElementRef, NgZone, OnDestroy, afterNextRender, computed, inject, input, signal, viewChild } from '@angular/core';

const DOTS = 2600;
const RADIUS = 2.4;
const ARC_POINTS = 140;

type LatLon = [number, number];

// Places I've worked: the label sits on the given side of its marker so the European labels don't collide
const COUNTRIES: { name: string; at: LatLon; side: 'l' | 'r' | 't' | 'b'; flag: string }[] = [
  { name: 'Ghana', at: [5.6, -0.2], side: 'r', flag: 'gh' },
  { name: 'France', at: [48.9, 2.35], side: 'l', flag: 'fr' },
  { name: 'Belgium', at: [50.85, 4.35], side: 't', flag: 'be' },
  { name: 'Germany', at: [52.5, 13.4], side: 'r', flag: 'de' },
];

// connections between them (indices into COUNTRIES)
const ROUTES: [number, number][] = [[0, 1], [0, 2], [0, 3], [1, 2], [2, 3]];

// where each logo sits in the tech constellation (% of the scene)
const NODE_POS: [number, number][] = [
  [50, 20], [20, 30], [80, 32], [8, 54], [34, 48], [62, 52],
  [90, 56], [22, 76], [48, 72], [76, 78], [36, 92], [62, 92],
];

// the story, told one section at a time (seconds each)
const SECTIONS = [
  { title: 'Countries worked in', dur: 6.5 },
  { title: 'Tech stack', dur: 8 },
  { title: 'Areas of expertise', dur: 7 },
];
// each area is a layer of the stack; `tag` is printed on its slab
const EXPERTISE = [
  { area: 'Frontend', tag: '</>' },
  { area: 'Backend', tag: '{ }' },
  { area: 'Database', tag: 'DB' },
  { area: 'Cloud', tag: 'CI/CD' },
];
// the globe sweeps across Africa and Europe during the countries section
const SWEEP_FROM = -0.65;
const SWEEP_TO = 0.25;
const FADE = 0.7;

// logo files in /public/tech, keyed by the name used in the profile's skills; skills without a logo are left out
const LOGOS: Record<string, string> = {
  angular: 'angular-original',
  typescript: 'typescript-original',
  rxjs: 'rxjs-original',
  scss: 'sass-original',
  nestjs: 'nestjs-original',
  'node.js': 'nodejs-original',
  graphql: 'graphql-plain',
  postgresql: 'postgresql-original',
  mongodb: 'mongodb-original',
  docker: 'docker-original',
  'ci/cd': 'githubactions-original',
  aws: 'amazonwebservices-plain-wordmark',
};

const DOT_VERT = /* glsl */ `
  uniform float uSize;
  uniform float uCam;
  varying float vFade;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    // dim the far side of the globe
    vFade = clamp(1.0 - (-mv.z - (uCam - 2.4)) / 5.5, 0.35, 1.0);
    gl_PointSize = uSize * (0.75 + vFade * 0.5) / -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`;
const DOT_FRAG = /* glsl */ `
  varying float vFade;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    gl_FragColor = vec4(vec3(0.82, 0.8, 1.0), 0.95 * vFade);
  }
`;

const ARC_VERT = /* glsl */ `
  attribute float aT;
  attribute float aPhase;
  uniform float uTime;
  uniform float uSize;
  uniform float uCam;
  varying float vPulse;
  varying float vFade;
  void main() {
    float head = fract(uTime * 0.12 + aPhase);
    float behind = mod(head - aT + 1.0, 1.0);
    vPulse = smoothstep(0.22, 0.0, behind);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vFade = clamp(1.0 - (-mv.z - (uCam - 2.4)) / 6.0, 0.15, 1.0);
    gl_PointSize = uSize * (0.55 + vPulse * 1.1) / -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`;
const ARC_FRAG = /* glsl */ `
  uniform float uShow;
  varying float vPulse;
  varying float vFade;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    vec3 coral = vec3(0.973, 0.42, 0.286);
    gl_FragColor = vec4(coral, (0.22 + vPulse * 0.75) * vFade * uShow);
  }
`;

function toVec(lat: number, lon: number, r: number): [number, number, number] {
  const la = (lat * Math.PI) / 180;
  const lo = (lon * Math.PI) / 180;
  return [r * Math.cos(la) * Math.sin(lo), r * Math.sin(la), r * Math.cos(la) * Math.cos(lo)];
}

@Component({
  selector: 'app-hero-scene',
  template: `
    <canvas #canvas></canvas>
    <div class="overlay" aria-hidden="true">
      @for (c of countries; track c.name) {
        <div class="marker" [class]="'marker side-' + c.side"><i></i><span><b class="flag flag--{{ c.flag }}"></b>{{ c.name }}</span></div>
      }
    </div>

    <div class="tech" [class.on]="step() === 1" aria-hidden="true">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none">
        @for (l of links(); track $index) {
          <line [attr.x1]="l.x1" [attr.y1]="l.y1" [attr.x2]="l.x2" [attr.y2]="l.y2" [style.--i]="$index" />
        }
      </svg>
      @for (n of nodes(); track n.name) {
        <div class="node" [style.left.%]="n.x" [style.top.%]="n.y" [style.--i]="$index">
          <div class="tile" [style.--i]="$index"><img [src]="n.src" [alt]="n.name" width="28" height="28" /></div>
        </div>
      }
    </div>

    <div class="layers" [class.on]="step() === 2" aria-hidden="true">
      <div class="stage">
        @for (e of expertise; track e.area; let i = $index) {
          <div class="layer" [style.--i]="i">
            <div class="slab-wrap"><div class="slab"><span>{{ e.tag }}</span></div></div>
            <i class="layer__line"></i>
            <strong class="layer__label">{{ e.area }}</strong>
          </div>
        }
        <i class="rod"></i>
        <i class="packet"></i>
      </div>
    </div>
    <p class="caption">
      <span class="caption__step">0{{ step() + 1 }} / 0{{ sections.length }}</span>
      <span class="caption__title">{{ sections[step()].title }}</span>
      <span class="caption__bars">
        @for (s of sections; track s.title; let i = $index) {
          <i [class.on]="i === step()"></i>
        }
      </span>
    </p>
  `,
  styles: `
    :host { display: block; position: relative; width: 100%; height: clamp(380px, 52vw, 580px); }
    canvas { position: absolute; inset: 0; width: 100%; height: 100%; display: block; touch-action: pan-y; opacity: 0; }
    .overlay { position: absolute; inset: 0; overflow: hidden; pointer-events: none; }
    .marker, .chip { position: absolute; left: 0; top: 0; opacity: 0; will-change: transform, opacity; white-space: nowrap; }
    .marker i { position: absolute; left: -4px; top: -4px; width: 8px; height: 8px; border-radius: 50%; background: var(--coral); }
    .marker i::after {
      content: ''; position: absolute; inset: -6px; border-radius: 50%;
      border: 1px solid var(--coral); animation: pulse 2.4s ease-out infinite;
    }
    .marker span {
      position: absolute; font: 600 0.72rem var(--font-heading); letter-spacing: 0.04em; color: #fff;
      padding: 0.15rem 0.55rem; border-radius: 999px; background: rgba(35, 32, 82, 0.75);
      border: 1px solid rgba(255, 255, 255, 0.18);
    }
    .marker span { display: inline-flex; align-items: center; gap: 0.4rem; }
    .flag { display: inline-block; width: 18px; height: 12px; border-radius: 2px; box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.25); position: relative; }
    .flag--gh { background: linear-gradient(#ce1126 33.3%, #fcd116 33.3% 66.6%, #006b3f 66.6%); }
    .flag--gh::after { content: '★'; position: absolute; inset: 0; display: grid; place-items: center; font-size: 7px; line-height: 1; color: #000; }
    .flag--fr { background: linear-gradient(90deg, #0055a4 33.3%, #fff 33.3% 66.6%, #ef4135 66.6%); }
    .flag--be { background: linear-gradient(90deg, #000 33.3%, #fae042 33.3% 66.6%, #ed2939 66.6%); }
    .flag--de { background: linear-gradient(#000 33.3%, #dd0000 33.3% 66.6%, #ffce00 66.6%); }
    .side-r span { left: 12px; top: -11px; }
    .side-l span { right: 12px; top: -11px; }
    .side-t span { left: -50%; bottom: 12px; transform: translateX(-25%); }
    .side-b span { left: -50%; top: 12px; }
    .tech, .layers { position: absolute; inset: 0; pointer-events: none; }
    .tech svg { position: absolute; inset: 0; width: 100%; height: 100%; }
    .tech line { stroke: rgba(255, 255, 255, 0.3); stroke-width: 1; vector-effect: non-scaling-stroke; opacity: 0; transition: opacity 0.3s; }
    .tech.on line { opacity: 1; transition: opacity 0.8s ease calc(0.8s + var(--i) * 0.1s); }
    .node { position: absolute; width: 46px; height: 46px; margin: -23px 0 0 -23px; opacity: 0; transform: scale(0.4); transition: opacity 0.4s, transform 0.4s; }
    .tech.on .node { opacity: 1; transform: none; transition: opacity 0.6s ease calc(0.2s + var(--i) * 0.2s), transform 0.7s cubic-bezier(0.2, 1.4, 0.4, 1) calc(0.2s + var(--i) * 0.2s); }
    .tile {
      display: grid; place-items: center; width: 100%; height: 100%; border-radius: 13px;
      border: 2.5px solid transparent;
      background:
        linear-gradient(#fff, #fff) padding-box,
        linear-gradient(135deg, var(--coral), #6b65c4) border-box;
      box-shadow: 0 6px 18px rgba(0, 0, 0, 0.25);
      animation: bob 5s ease-in-out infinite; animation-delay: calc(var(--i) * -0.7s);
    }
    .tile img { width: 28px; height: 28px; object-fit: contain; display: block; }
    @keyframes bob { 50% { transform: translateY(-7px); } }

    .layers { container-type: size; }
    .stage { position: absolute; left: 50%; top: 50%; width: 100cqmin; height: 100cqmin; transform: translate(-50%, -50%); }
    .layer { position: absolute; left: 0; width: 100%; top: calc(20% + var(--i) * 12%); height: 24%; z-index: calc(10 - var(--i)); }
    .slab-wrap {
      position: absolute; left: 11%; top: 0; width: 24%; height: 100%;
      filter: drop-shadow(0 6px 0 rgba(12, 10, 46, 0.6));
      opacity: 0; transform: translateY(-28px); transition: opacity 0.3s, transform 0.3s;
    }
    .on .slab-wrap { opacity: 1; transform: none; transition: opacity 0.6s ease calc((3 - var(--i)) * 0.3s), transform 0.7s cubic-bezier(0.2, 1.2, 0.4, 1) calc((3 - var(--i)) * 0.3s); }
    .slab {
      position: absolute; inset: 0; border-radius: 12%; display: grid; place-items: center;
      transform: rotateX(60deg) rotateZ(-45deg);
      background: linear-gradient(135deg, var(--a), var(--b)); border: 1px solid rgba(255, 255, 255, 0.35);
      font: 700 clamp(0.6rem, 2.7cqmin, 1.1rem) ui-monospace, 'SF Mono', Menlo, monospace; color: #fff; letter-spacing: 0.06em;
    }
    .slab::before {
      content: ''; position: absolute; inset: 0; border-radius: inherit; opacity: 0.35;
      background-image: linear-gradient(rgba(255, 255, 255, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.5) 1px, transparent 1px);
      background-size: 20% 20%;
    }
    .slab span { position: relative; }
    .layer:nth-child(1) .slab { --a: #ff8a5c; --b: #f86b49; }
    .layer:nth-child(2) .slab { --a: #a29df0; --b: #7a74d8; }
    .layer:nth-child(3) .slab { --a: #7b75cf; --b: #544ead; }
    .layer:nth-child(4) .slab { --a: #615baa; --b: #433d92; }
    .on .slab { animation: lit 3.2s ease-in-out infinite; animation-delay: calc(2.35s + var(--i) * 0.65s); }
    @keyframes lit { 0%, 16%, 100% { filter: none; } 6% { filter: brightness(1.5); } }
    .layer__line {
      position: absolute; left: 42%; top: 50%; width: 7%; border-top: 1px dashed rgba(248, 107, 73, 0.8);
      transform-origin: left; transform: scaleX(0); transition: transform 0.2s;
    }
    .on .layer__line { transform: none; transition: transform 0.5s ease calc((3 - var(--i)) * 0.3s + 0.5s); }
    .layer__label {
      position: absolute; left: 51%; top: 50%; transform: translate(-8px, -50%); opacity: 0; white-space: nowrap;
      font: 700 clamp(0.95rem, 4cqmin, 1.4rem) var(--font-heading); color: #fff; transition: opacity 0.2s, transform 0.2s;
    }
    .on .layer__label { opacity: 1; transform: translateY(-50%); transition: opacity 0.5s ease calc((3 - var(--i)) * 0.3s + 0.6s), transform 0.5s ease calc((3 - var(--i)) * 0.3s + 0.6s); }
    .rod { position: absolute; left: 23%; top: 22%; height: 58%; border-left: 1px solid rgba(255, 255, 255, 0.35); z-index: 20; opacity: 0; transition: opacity 0.4s; }
    .on .rod { opacity: 1; transition-delay: 1.6s; }
    .packet {
      position: absolute; left: 23%; top: 22%; width: 16px; height: 22px; margin: -11px 0 0 -8px; z-index: 21; opacity: 0;
      filter: drop-shadow(0 0 7px rgba(248, 107, 73, 0.9));
    }
    .packet::before {
      content: ''; position: absolute; inset: 0; background: var(--coral);
      clip-path: polygon(30% 0, 70% 0, 70% 48%, 100% 48%, 50% 100%, 0 48%, 30% 48%);
    }
    .on .packet { animation: drop 3.2s ease-in-out infinite; animation-delay: 1.8s; }
    @keyframes drop { 0% { top: 22%; opacity: 0; } 8% { opacity: 1; } 92% { opacity: 1; } 100% { top: 80%; opacity: 0; } }
    .caption { position: absolute; right: 0; top: 0; z-index: 30; margin: 0; pointer-events: none; display: grid; gap: 0.35rem; justify-items: end; text-align: right; }
    .caption__step { font: 600 0.75rem var(--font-heading); letter-spacing: 0.14em; color: var(--coral); }
    .caption__title { font: 700 1rem var(--font-heading); color: #fff; }
    .caption__bars { display: flex; gap: 0.35rem; margin-top: 0.15rem; justify-content: flex-end; }
    .caption__bars i { width: 1.6rem; height: 3px; border-radius: 3px; background: rgba(255, 255, 255, 0.2); transition: background 0.4s; }
    .caption__bars i.on { background: var(--coral); }
    @keyframes pulse { from { transform: scale(0.6); opacity: 0.9; } to { transform: scale(2.4); opacity: 0; } }
    @media (prefers-reduced-motion: reduce) { .marker i::after, .tile, .on .slab, .on .packet { animation: none; } .on .packet { opacity: 1; top: 50%; } }
  `,
})
export class HeroScene implements OnDestroy {
  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly zone = inject(NgZone);
  private dispose?: () => void;
  readonly tech = input<string[]>([]);
  protected readonly countries = COUNTRIES;
  protected readonly logos = computed(() =>
    this.tech()
      .map((name) => ({ name, file: LOGOS[name.toLowerCase()] }))
      .filter((t) => t.file)
      .map((t) => ({ name: t.name, src: `tech/${t.file}.svg` })),
  );
  protected readonly nodes = computed(() =>
    this.logos()
      .slice(0, NODE_POS.length)
      .map((l, i) => ({ ...l, x: NODE_POS[i][0], y: NODE_POS[i][1] })),
  );
  // link every logo to its two nearest neighbours
  protected readonly links = computed(() => {
    const ns = this.nodes();
    const seen = new Set<string>();
    const out: { x1: number; y1: number; x2: number; y2: number }[] = [];
    ns.forEach((a, i) => {
      ns.map((b, j) => ({ j, d: Math.hypot(a.x - b.x, a.y - b.y) }))
        .filter((o) => o.j !== i)
        .sort((p, q) => p.d - q.d)
        .slice(0, 2)
        .forEach(({ j }) => {
          const key = i < j ? `${i}-${j}` : `${j}-${i}`;
          if (seen.has(key)) return;
          seen.add(key);
          out.push({ x1: a.x, y1: a.y, x2: ns[j].x, y2: ns[j].y });
        });
    });
    return out;
  });
  protected readonly sections = SECTIONS;
  protected readonly expertise = EXPERTISE;
  protected readonly step = signal(0);

  constructor() {
    afterNextRender(() => {
      void this.zone.runOutsideAngular(() => this.init());
    });
  }

  ngOnDestroy(): void {
    this.dispose?.();
  }

  private async init(): Promise<void> {
    const THREE = await import('three');
    const canvas = this.canvas().nativeElement;
    const host = this.host.nativeElement;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
    const globe = new THREE.Group();
    globe.rotation.x = 0.35;
    globe.rotation.y = SWEEP_FROM;
    scene.add(globe);

    const uCam = { value: 8 };

    // a solid dark core so the far side of the globe doesn't show through
    const core = new THREE.Mesh(
      new THREE.SphereGeometry(RADIUS * 0.99, 48, 48),
      new THREE.MeshBasicMaterial({ color: 0x3a3585 }),
    );
    globe.add(core);

    // dots: evenly spread over the sphere
    const dotPos = new Float32Array(DOTS * 3);
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < DOTS; i++) {
      const y = 1 - (i / (DOTS - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const th = golden * i;
      dotPos.set([Math.cos(th) * r * RADIUS, y * RADIUS, Math.sin(th) * r * RADIUS], i * 3);
    }
    const dotGeo = new THREE.BufferGeometry();
    dotGeo.setAttribute('position', new THREE.BufferAttribute(dotPos, 3));
    const dotMat = new THREE.ShaderMaterial({
      vertexShader: DOT_VERT,
      fragmentShader: DOT_FRAG,
      uniforms: { uSize: { value: 55 }, uCam },
      transparent: true,
      depthWrite: false,
    });
    globe.add(new THREE.Points(dotGeo, dotMat));

    // arcs: great-circle routes lifted off the surface, with a pulse running along each
    const total = ROUTES.length * ARC_POINTS;
    const arcPos = new Float32Array(total * 3);
    const arcT = new Float32Array(total);
    const arcPhase = new Float32Array(total);
    ROUTES.forEach(([fi, ti], ri) => {
      const [from, to] = [COUNTRIES[fi].at, COUNTRIES[ti].at];
      const a = new THREE.Vector3(...toVec(from[0], from[1], 1));
      const b = new THREE.Vector3(...toVec(to[0], to[1], 1));
      const angle = a.angleTo(b);
      for (let k = 0; k < ARC_POINTS; k++) {
        const u = k / (ARC_POINTS - 1);
        const p = new THREE.Vector3()
          .copy(a)
          .multiplyScalar(Math.sin((1 - u) * angle))
          .addScaledVector(b, Math.sin(u * angle))
          .divideScalar(Math.sin(angle))
          .normalize()
          .multiplyScalar(RADIUS * (1 + Math.sin(u * Math.PI) * 0.28 * Math.min(angle, 1.6)));
        const idx = ri * ARC_POINTS + k;
        arcPos.set([p.x, p.y, p.z], idx * 3);
        arcT[idx] = u;
        arcPhase[idx] = ri / ROUTES.length;
      }
    });
    const arcGeo = new THREE.BufferGeometry();
    arcGeo.setAttribute('position', new THREE.BufferAttribute(arcPos, 3));
    arcGeo.setAttribute('aT', new THREE.BufferAttribute(arcT, 1));
    arcGeo.setAttribute('aPhase', new THREE.BufferAttribute(arcPhase, 1));
    const arcUniforms = { uTime: { value: 0 }, uSize: { value: 40 }, uShow: { value: 0 }, uCam };
    const arcMat = new THREE.ShaderMaterial({
      vertexShader: ARC_VERT,
      fragmentShader: ARC_FRAG,
      uniforms: arcUniforms,
      transparent: true,
      depthWrite: false,
    });
    globe.add(new THREE.Points(arcGeo, arcMat));

    const resize = () => {
      const w = host.clientWidth;
      const h = host.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      const half = Math.tan((camera.fov * Math.PI) / 360);
      // fit the globe (plus arcs) inside both width and height
      const fit = 4.3 / half / Math.min(camera.aspect, 1);
      camera.position.z = Math.max(8, fit);
      uCam.value = camera.position.z;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(host);

    const mouse = new THREE.Vector2(0, 0);
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      mouse.set(((e.clientX - r.left) / r.width) * 2 - 1, -(((e.clientY - r.top) / r.height) * 2 - 1));
    };
    const onLeave = () => mouse.set(0, 0);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerleave', onLeave);

    let elapsed = 0;
    let cur = 0;
    let local = 0;
    const clamp01 = (x: number) => Math.min(Math.max(x, 0), 1);
    // 0..1 visibility of item `i` in section `idx`: staggered fade-in, everything fades out together at the end
    const vis = (idx: number, i: number, stagger: number, delay: number) =>
      cur !== idx ? 0 : clamp01((local - delay - i * stagger) / 0.6) * clamp01((SECTIONS[idx].dur - local) / FADE);
    const markerEls = Array.from(host.querySelectorAll<HTMLElement>('.marker'));
    const markerPos = COUNTRIES.map((c) => new THREE.Vector3(...toVec(c.at[0], c.at[1], RADIUS)));
    const v = new THREE.Vector3();
    const camDir = new THREE.Vector3();
    const place = (el: HTMLElement, x: number, y: number, opacity: number, scale = 1) => {
      el.style.opacity = String(opacity);
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) scale(${scale.toFixed(3)})`;
    };
    const updateOverlay = () => {
      const w = host.clientWidth;
      const h = host.clientHeight;
      globe.updateMatrixWorld();
      camDir.copy(camera.position).normalize();
      // country markers ride on the globe and hide when they turn to its far side
      markerEls.forEach((el, i) => {
        v.copy(markerPos[i]).applyMatrix4(globe.matrixWorld);
        const facing = v.clone().normalize().dot(camDir);
        const appear = vis(0, i, 0.35, 0.4);
        v.project(camera);
        place(el, (v.x * 0.5 + 0.5) * w, (-v.y * 0.5 + 0.5) * h, facing > 0.12 ? appear * Math.min((facing - 0.12) * 4, 1) : 0);
      });
    };

    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(host);

    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      if (!visible || document.hidden) return;
      elapsed += dt;
      if (!reduced) arcUniforms.uTime.value += dt;
      // which section of the story we're in
      const cycle = SECTIONS.reduce((s, x) => s + x.dur, 0);
      let tt = elapsed % cycle;
      cur = 0;
      while (tt >= SECTIONS[cur].dur) tt -= SECTIONS[cur++].dur;
      local = tt;
      if (cur !== this.step()) this.step.set(cur);

      // the globe belongs to the countries section; the other two sections have their own visuals
      const alpha = cur === 0 ? clamp01(local / 0.7) * clamp01((SECTIONS[0].dur - local) / FADE) : 0;
      canvas.style.opacity = String(alpha);
      canvas.style.transform = `scale(${(0.94 + 0.06 * alpha).toFixed(3)})`;
      if (cur === 0) {
        const p = reduced ? 0.5 : local / SECTIONS[0].dur;
        const sweep = SWEEP_FROM + (SWEEP_TO - SWEEP_FROM) * p;
        globe.rotation.y += (sweep + mouse.x * 0.3 - globe.rotation.y) * 0.08;
      } else {
        globe.rotation.y = SWEEP_FROM; // reset while hidden
      }
      globe.rotation.x += (0.35 - mouse.y * 0.2 - globe.rotation.x) * 0.05;
      arcUniforms.uShow.value = vis(0, 0, 0, 0.6);
      if (alpha > 0.01) renderer.render(scene, camera);
      updateOverlay();
    };
    raf = requestAnimationFrame(tick);

    this.dispose = () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerleave', onLeave);
      dotGeo.dispose();
      arcGeo.dispose();
      dotMat.dispose();
      core.geometry.dispose();
      (core.material as import('three').Material).dispose();
      arcMat.dispose();
      renderer.dispose();
    };
  }
}
