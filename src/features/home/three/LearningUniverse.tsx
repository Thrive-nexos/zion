"use client";

/**
 * The homepage "learning universe": a procedural scene with no downloaded assets.
 *
 * Visual language: flat toon colour with ink keylines, like a printed textbook
 * illustration come to life — not a glowing galaxy. The canvas is transparent so
 * the danfo-yellow hero shows through.
 *
 * Scroll progress (0 → 1) is written into `progress.current` by the hero's
 * ScrollTrigger and read every frame, so scrolling never causes React renders.
 *
 *   0.00–0.25  drifting knowledge: books, letters, solids float among ink dots
 *   0.25–0.50  books open, letters gather into a ring of words
 *   0.50–0.75  atoms snap into molecules, solids align
 *   0.75–1.00  everything folds into a constellation globe: the network of learners
 */
import { useMemo, useRef, type MutableRefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Edges } from "@react-three/drei";
import * as THREE from "three";

type P = MutableRefObject<number>;

const C = { ink: "#111111", yellow: "#FFC800", blue: "#1F5BFF", green: "#00B85C", pink: "#FF3D8B", orange: "#FF6A13", white: "#FFFFFF", violet: "#8B5CF6" };

// Scratch vectors shared by per-frame callbacks (they run one after another, never concurrently).
const BOOK_TARGET = new THREE.Vector3();
const RING = new THREE.Vector3();
const UP = new THREE.Vector3(0, 1, 0);
const VA = new THREE.Vector3();
const VB = new THREE.Vector3();
const MID = new THREE.Vector3();
const DIR = new THREE.Vector3();

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const smooth = (x: number) => x * x * (3 - 2 * x);
const seg = (p: number, a: number, b: number) => smooth(clamp01((p - a) / (b - a)));

function rng(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A crisp white disc used for the dot field (tinted per vertex). */
function dotSprite() {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(32, 32, 28, 0, Math.PI * 2);
  ctx.fill();
  return new THREE.CanvasTexture(c);
}

/** Three-step ramp so toon materials read as flat print colour with one shadow band. */
function toonRamp() {
  const data = new Uint8Array([90, 90, 90, 255, 200, 200, 200, 255, 255, 255, 255, 255]);
  const tex = new THREE.DataTexture(data, 3, 1, THREE.RGBAFormat);
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  tex.needsUpdate = true;
  return tex;
}

let RAMP: THREE.DataTexture | null = null;
const ramp = () => (RAMP ??= toonRamp());

function Toon({ color }: { color: string }) {
  return <meshToonMaterial color={color} gradientMap={ramp()} />;
}

function fibonacciSphere(n: number, r: number) {
  const pts: THREE.Vector3[] = [];
  const g = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2;
    const rad = Math.sqrt(1 - y * y);
    pts.push(new THREE.Vector3(Math.cos(g * i) * rad * r, y * r, Math.sin(g * i) * rad * r));
  }
  return pts;
}

// ───────────────────────── Dot field → constellation nodes ─────────────────────────

function Dots({ progress, count }: { progress: P; count: number }) {
  const ref = useRef<THREE.Points>(null);
  const { from, to, colors } = useMemo(() => {
    const r = rng(7);
    const from = new Float32Array(count * 3);
    const to = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sphere = fibonacciSphere(count, 3.3);
    const palette = [C.ink, C.ink, C.ink, C.blue, C.pink, C.white].map((c) => new THREE.Color(c));
    for (let i = 0; i < count; i++) {
      const rad = 5 + r() * 12;
      const th = r() * Math.PI * 2;
      const ph = Math.acos(2 * r() - 1);
      from.set([rad * Math.sin(ph) * Math.cos(th), rad * Math.sin(ph) * Math.sin(th) * 0.7, rad * Math.cos(ph) - 4], i * 3);
      const s = sphere[i];
      to.set([s.x, s.y, s.z], i * 3);
      const c = palette[Math.floor(r() * palette.length)];
      colors.set([c.r, c.g, c.b], i * 3);
    }
    return { from, to, colors };
  }, [count]);
  const positions = useMemo(() => from.slice(), [from]);
  const sprite = useMemo(() => dotSprite(), []);

  useFrame(() => {
    const k = seg(progress.current, 0.72, 0.97);
    const geo = ref.current?.geometry;
    if (!geo) return;
    const arr = geo.attributes.position.array as Float32Array;
    for (let i = 0; i < arr.length; i++) arr[i] = from[i] + (to[i] - from[i]) * k;
    geo.attributes.position.needsUpdate = true;
    (ref.current!.material as THREE.PointsMaterial).size = 0.07 + k * 0.05;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial map={sprite} vertexColors size={0.07} sizeAttenuation transparent alphaTest={0.5} depthWrite={false} toneMapped={false} />
    </points>
  );
}

function ConstellationLines({ progress, count }: { progress: P; count: number }) {
  const mat = useRef<THREE.LineBasicMaterial>(null);
  const geometry = useMemo(() => {
    const nodes = fibonacciSphere(count, 3.3).filter((_, i) => i % 6 === 0);
    const segs: number[] = [];
    nodes.forEach((a, i) => {
      const near = nodes.map((b, j) => ({ j, d: a.distanceTo(b) })).filter((x) => x.j !== i).sort((x, y) => x.d - y.d).slice(0, 2);
      near.forEach(({ j }) => {
        if (j > i) segs.push(a.x, a.y, a.z, nodes[j].x, nodes[j].y, nodes[j].z);
      });
    });
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(segs, 3));
    return g;
  }, [count]);
  useFrame(() => {
    if (mat.current) mat.current.opacity = seg(progress.current, 0.85, 1) * 0.6;
  });
  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial ref={mat} color={C.ink} transparent opacity={0} depthWrite={false} />
    </lineSegments>
  );
}

// ───────────────────────── Books ─────────────────────────

function Book({ index, total, progress, color }: { index: number; total: number; progress: P; color: string }) {
  const group = useRef<THREE.Group>(null);
  const cover = useRef<THREE.Group>(null);
  const r = useMemo(() => rng(100 + index), [index]);
  const start = useMemo(() => new THREE.Vector3((r() - 0.5) * 9, (r() - 0.5) * 5, -1 - r() * 4), [r]);
  const startRot = useMemo(() => new THREE.Euler(r() * Math.PI, r() * Math.PI, r() * 0.6), [r]);
  const arcAngle = (index / (total - 1) - 0.5) * 2.2;
  const arc = useMemo(() => new THREE.Vector3(Math.sin(arcAngle) * 4.2, -1.6 + Math.cos(arcAngle) * 0.6, -2 + Math.cos(arcAngle) * 1.2), [arcAngle]);

  useFrame((state) => {
    const target = BOOK_TARGET;
    const p = progress.current;
    const t = state.clock.elapsedTime;
    const gather = seg(p, 0.2, 0.45);
    const fold = seg(p, 0.74, 0.95);
    const g = group.current!;
    target.copy(start).lerp(arc, gather);
    target.y += Math.sin(t * 0.6 + index) * 0.12 * (1 - gather * 0.6);
    target.multiplyScalar(1 - fold * 0.92);
    g.position.copy(target);
    g.rotation.set(
      startRot.x * (1 - gather) + 0.25 * gather + t * 0.05 * (1 - gather),
      startRot.y * (1 - gather) - arcAngle * 0.5 * gather,
      startRot.z * (1 - gather),
    );
    g.scale.setScalar(Math.max(0.001, 1 - fold));
    if (cover.current) cover.current.rotation.y = -Math.PI * 0.82 * seg(p, 0.3, 0.5);
  });

  return (
    <group ref={group}>
      <mesh position={[0, 0, -0.06]}>
        <boxGeometry args={[0.9, 1.25, 0.05]} />
        <Toon color={color} />
        <Edges color={C.ink} />
      </mesh>
      <mesh>
        <boxGeometry args={[0.84, 1.18, 0.1]} />
        <Toon color={C.white} />
        <Edges color={C.ink} />
      </mesh>
      {/* front cover hinges on the spine at x = -0.45 */}
      <group ref={cover} position={[-0.45, 0, 0.06]}>
        <mesh position={[0.45, 0, 0]}>
          <boxGeometry args={[0.9, 1.25, 0.05]} />
          <Toon color={color} />
          <Edges color={C.ink} />
        </mesh>
        <mesh position={[0.45, 0.28, 0.03]}>
          <planeGeometry args={[0.52, 0.12]} />
          <meshBasicMaterial color={C.white} />
        </mesh>
      </group>
    </group>
  );
}

// ───────────────────────── Letters (incl. Yorùbá, Igbo, Hausa characters) ─────────────────────────

const GLYPHS = ["A", "ẹ", "ọ", "ṣ", "ụ", "ị", "ƙ", "ɗ", "ñ", "π", "Σ", "√", "x²", "∞", "B", "ọ̀", "?", "≈", "a", "é", "ƴ", "3", "7", "+"];

function useGlyphTexture(glyph: string) {
  return useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const ctx = c.getContext("2d")!;
    ctx.clearRect(0, 0, 128, 128);
    const font = getComputedStyle(document.documentElement).getPropertyValue("--font-archivo") || "Arial Black";
    ctx.font = `900 ${glyph.length > 1 ? 64 : 92}px ${font}, "Arial Black", sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#ffffff";
    ctx.fillText(glyph, 64, 70);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    return tex;
  }, [glyph]);
}

function Letter({ glyph, index, total, progress }: { glyph: string; index: number; total: number; progress: P }) {
  const ref = useRef<THREE.Mesh>(null);
  const tex = useGlyphTexture(glyph);
  const r = useMemo(() => rng(300 + index), [index]);
  const start = useMemo(() => new THREE.Vector3((r() - 0.5) * 12, (r() - 0.5) * 7, -2 - r() * 6), [r]);
  const speed = useMemo(() => 0.2 + r() * 0.3, [r]);
  const tint = useMemo(() => new THREE.Color([C.ink, C.blue, C.ink, C.pink, C.ink, C.green][index % 6]), [index]);

  useFrame((state) => {
    const ring = RING;
    const p = progress.current;
    const t = state.clock.elapsedTime;
    const gather = seg(p, 0.25, 0.5);
    const fold = seg(p, 0.74, 0.95);
    const a = (index / total) * Math.PI * 2 + t * 0.15;
    ring.set(Math.cos(a) * 3.3, 1.1 + Math.sin(a * 2) * 0.25, Math.sin(a) * 1.6 - 1.5);
    const m = ref.current!;
    m.position.set(
      start.x + Math.sin(t * speed + index) * 0.4,
      start.y + Math.cos(t * speed * 0.8 + index) * 0.35,
      start.z,
    ).lerp(ring, gather).multiplyScalar(1 - fold * 0.9);
    m.quaternion.copy(state.camera.quaternion);
    const mat = m.material as THREE.MeshBasicMaterial;
    mat.opacity = (0.55 + gather * 0.45) * (1 - fold);
    m.scale.setScalar(0.6 + gather * 0.15);
  });

  return (
    <mesh ref={ref}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial map={tex} color={tint} transparent depthWrite={false} toneMapped={false} />
    </mesh>
  );
}

// ───────────────────────── Molecules ─────────────────────────

const MOLECULES: { center: [number, number, number]; atoms: { p: [number, number, number]; c: string; s: number }[]; bonds: [number, number][] }[] = [
  {
    center: [2.8, 0.3, 0.6],
    atoms: Array.from({ length: 6 }, (_, i) => ({ p: [Math.cos((i / 6) * Math.PI * 2) * 0.62, Math.sin((i / 6) * Math.PI * 2) * 0.62, 0] as [number, number, number], c: i % 2 ? C.blue : C.white, s: 0.16 })),
    bonds: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0]],
  },
  {
    center: [-3.0, 0.9, 0.2],
    atoms: [{ p: [0, 0, 0], c: C.pink, s: 0.26 }, { p: [0.55, -0.4, 0], c: C.white, s: 0.15 }, { p: [-0.55, -0.4, 0], c: C.white, s: 0.15 }],
    bonds: [[0, 1], [0, 2]],
  },
  {
    center: [-1.2, -0.8, 1.6],
    atoms: [
      { p: [0, 0, 0], c: C.orange, s: 0.22 },
      { p: [0.5, 0.5, 0.5], c: C.green, s: 0.13 }, { p: [-0.5, -0.5, 0.5], c: C.green, s: 0.13 },
      { p: [-0.5, 0.5, -0.5], c: C.green, s: 0.13 }, { p: [0.5, -0.5, -0.5], c: C.green, s: 0.13 },
    ],
    bonds: [[0, 1], [0, 2], [0, 3], [0, 4]],
  },
];

function Molecule({ def, index, progress }: { def: (typeof MOLECULES)[number]; index: number; progress: P }) {
  const group = useRef<THREE.Group>(null);
  const atomRefs = useRef<(THREE.Mesh | null)[]>([]);
  const bondRefs = useRef<(THREE.Mesh | null)[]>([]);
  const r = useMemo(() => rng(500 + index), [index]);
  const scatter = useMemo(() => def.atoms.map(() => new THREE.Vector3((r() - 0.5) * 8, (r() - 0.5) * 6, (r() - 0.5) * 5)), [def, r]);
  const targets = useMemo(() => def.atoms.map((atom) => new THREE.Vector3(...atom.p)), [def]);

  useFrame((state) => {
    const [up, a, b, mid, dir] = [UP, VA, VB, MID, DIR];
    const p = progress.current;
    const t = state.clock.elapsedTime;
    const bond = seg(p, 0.48, 0.68);
    const appear = seg(p, 0.38, 0.52);
    const fold = seg(p, 0.76, 0.96);
    const g = group.current!;
    g.position.set(def.center[0] * (1 - fold), def.center[1] * (1 - fold), def.center[2] * (1 - fold));
    g.rotation.set(t * 0.2 + index, t * 0.3, 0);
    g.scale.setScalar(Math.max(0.001, (0.2 + appear * 0.8) * (1 - fold)));
    def.atoms.forEach((_, i) => {
      const m = atomRefs.current[i];
      if (m) m.position.copy(scatter[i]).lerp(targets[i], bond);
    });
    def.bonds.forEach(([i, j], k) => {
      const m = bondRefs.current[k];
      const ai = atomRefs.current[i];
      const aj = atomRefs.current[j];
      if (!m || !ai || !aj) return;
      a.copy(ai.position);
      b.copy(aj.position);
      mid.copy(a).add(b).multiplyScalar(0.5);
      dir.copy(b).sub(a);
      const len = dir.length();
      m.position.copy(mid);
      m.quaternion.setFromUnitVectors(up, dir.normalize());
      m.scale.set(1, Math.max(0.001, len), 1);
      (m.material as THREE.MeshBasicMaterial).opacity = bond;
    });
  });

  return (
    <group ref={group}>
      {def.atoms.map((atom, i) => (
        <mesh key={i} ref={(el) => { atomRefs.current[i] = el; }}>
          <sphereGeometry args={[atom.s, 24, 24]} />
          <Toon color={atom.c} />
        </mesh>
      ))}
      {def.bonds.map((_, k) => (
        <mesh key={k} ref={(el) => { bondRefs.current[k] = el; }}>
          <cylinderGeometry args={[0.035, 0.035, 1, 8]} />
          <meshBasicMaterial color={C.ink} transparent opacity={0} />
        </mesh>
      ))}
    </group>
  );
}

// ───────────────────────── Geometric solids ─────────────────────────

function Solid({ kind, position, color, progress, index }: { kind: "ico" | "oct" | "torus" | "dodeca"; position: [number, number, number]; color: string; progress: P; index: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    const p = progress.current;
    const t = state.clock.elapsedTime;
    const fold = seg(p, 0.75, 0.95);
    const m = ref.current!;
    m.rotation.set(t * 0.25 + index, t * 0.35, 0);
    m.position.set(position[0] * (1 - fold), position[1] * (1 - fold) + Math.sin(t * 0.7 + index) * 0.15, position[2] * (1 - fold));
    m.scale.setScalar(Math.max(0.001, 1 - fold));
  });
  return (
    <mesh ref={ref}>
      {kind === "ico" && <icosahedronGeometry args={[0.6, 0]} />}
      {kind === "oct" && <octahedronGeometry args={[0.5, 0]} />}
      {kind === "dodeca" && <dodecahedronGeometry args={[0.45, 0]} />}
      {kind === "torus" && <torusGeometry args={[0.45, 0.16, 16, 48]} />}
      <Toon color={color} />
      {kind !== "torus" && <Edges color={C.ink} />}
    </mesh>
  );
}

// ───────────────────────── The globe at the centre ─────────────────────────

/** Low-poly globe that appears as everything folds in: the network of learners. */
function Globe({ progress }: { progress: P }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    const k = seg(progress.current, 0.8, 1);
    const pulse = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.03;
    ref.current!.scale.setScalar(Math.max(0.001, k * 0.9 * pulse));
    ref.current!.rotation.y = state.clock.elapsedTime * 0.3;
  });
  return (
    <mesh ref={ref}>
      <icosahedronGeometry args={[1, 1]} />
      <Toon color={C.pink} />
      <Edges color={C.ink} threshold={1} />
    </mesh>
  );
}

// ───────────────────────── Camera rig ─────────────────────────

function Rig({ progress }: { progress: P }) {
  useFrame(({ camera, pointer }, dt) => {
    const p = progress.current;
    const z = 11 - seg(p, 0, 0.6) * 2.2 - seg(p, 0.72, 1) * 0.6;
    camera.position.x += (pointer.x * 0.6 - camera.position.x) * Math.min(1, dt * 2);
    camera.position.y += (pointer.y * 0.35 + 0.2 - camera.position.y) * Math.min(1, dt * 2);
    camera.position.z += (z - camera.position.z) * Math.min(1, dt * 3);
    camera.lookAt(0, 0, 0);
  });
  return null;
}

function Scene({ progress, lite }: { progress: P; lite: boolean }) {
  const world = useRef<THREE.Group>(null);
  // On wide screens the composition sits right of centre so the headline reads on clean yellow.
  const aspect = useThree((st) => st.viewport.aspect);
  const shift = aspect > 1.25 ? Math.min(3.4, (aspect - 1) * 4.6) : 0;
  useFrame((state) => {
    if (world.current) world.current.rotation.y = state.clock.elapsedTime * 0.04 + seg(progress.current, 0.72, 1) * 0.9;
  });
  const dotCount = lite ? 500 : 1100;
  return (
    <>
      <ambientLight intensity={1.1} />
      <directionalLight position={[4, 6, 5]} intensity={2.2} />
      <Rig progress={progress} />
      <group position={[shift, 0, 0]}>
      <group ref={world}>
        <Dots progress={progress} count={dotCount} />
        <ConstellationLines progress={progress} count={dotCount} />
        {[C.blue, C.pink, C.green, C.orange, C.white, C.violet, C.blue].map((c, i) => (
          <Book key={i} index={i} total={7} progress={progress} color={c} />
        ))}
        {GLYPHS.slice(0, lite ? 14 : GLYPHS.length).map((g, i, arr) => (
          <Letter key={i} glyph={g} index={i} total={arr.length} progress={progress} />
        ))}
        {MOLECULES.map((m, i) => (
          <Molecule key={i} def={m} index={i} progress={progress} />
        ))}
        <Solid kind="ico" index={0} position={[3.6, 2.2, -1]} color={C.blue} progress={progress} />
        <Solid kind="oct" index={1} position={[-3.8, -1.9, 0]} color={C.green} progress={progress} />
        <Solid kind="torus" index={2} position={[0.4, 2.6, -2.5]} color={C.pink} progress={progress} />
        {!lite && <Solid kind="dodeca" index={3} position={[-2.2, 2.4, -1.5]} color={C.white} progress={progress} />}
        <Globe progress={progress} />
      </group>
      </group>
    </>
  );
}

export default function LearningUniverse({ progress, active, lite }: { progress: P; active: boolean; lite: boolean }) {
  return (
    <Canvas
      className="!absolute inset-0"
      dpr={lite ? [1, 1.25] : [1, 1.75]}
      camera={{ position: [0, 0.2, 11], fov: 42, near: 0.1, far: 60 }}
      gl={{ antialias: true, powerPreference: "high-performance", alpha: true }}
      frameloop={active ? "always" : "never"}
      aria-hidden
    >
      <Scene progress={progress} lite={lite} />
    </Canvas>
  );
}
