/**
 * Static, illustrated version of the learning universe — flat colour with ink
 * keylines on danfo yellow. Used as the first paint, and as the full experience on
 * reduced-motion, data-saver and low-power devices.
 */
const r2 = (n: number) => Math.round(n * 100) / 100;

const INK = "#111111";
const BOOKS = ["#1F5BFF", "#FF3D8B", "#00B85C", "#FF6A13", "#FFFFFF"];

export function UniversePoster({ className }: { className?: string }) {
  const dots = Array.from({ length: 70 }, (_, i) => {
    const a = (i * 137.508 * Math.PI) / 180;
    const r = 60 + ((i * 53) % 340);
    return { x: r2(820 + Math.cos(a) * r * 1.1), y: r2(330 + Math.sin(a) * r * 0.75), s: 2 + ((i * 7) % 4), c: i % 7 === 0 ? "#1F5BFF" : i % 5 === 0 ? "#FF3D8B" : INK };
  });
  const nodes = Array.from({ length: 18 }, (_, i) => {
    const a = (i / 18) * Math.PI * 2;
    const rr = 130 + ((i * 37) % 50);
    return { x: r2(840 + Math.cos(a) * rr), y: r2(320 + Math.sin(a) * rr * 0.75) };
  });
  return (
    <svg viewBox="0 0 1200 760" preserveAspectRatio="xMidYMid slice" className={className} aria-hidden>
      <rect width="1200" height="760" fill="#FFC800" />
      {dots.map((d, i) => <circle key={i} cx={d.x} cy={d.y} r={d.s} fill={d.c} />)}
      <g stroke={INK} strokeOpacity="0.55" strokeWidth="1.5">
        {nodes.map((n, i) => {
          const k = nodes[(i + 1) % nodes.length];
          const m = nodes[(i + 4) % nodes.length];
          return (
            <g key={i}>
              <line x1={n.x} y1={n.y} x2={k.x} y2={k.y} />
              <line x1={n.x} y1={n.y} x2={m.x} y2={m.y} strokeOpacity="0.25" />
            </g>
          );
        })}
      </g>
      {nodes.map((n, i) => <circle key={i} cx={n.x} cy={n.y} r={i % 3 === 0 ? 6 : 4} fill={i % 3 === 0 ? "#FF3D8B" : "#fff"} stroke={INK} strokeWidth="2" />)}
      {/* low-poly globe */}
      <g transform="translate(840 320)" stroke={INK} strokeWidth="3" strokeLinejoin="round">
        <polygon points="0,-78 68,-39 68,39 0,78 -68,39 -68,-39" fill="#FF3D8B" />
        <polyline points="-68,-39 0,0 68,-39" fill="none" />
        <polyline points="0,0 0,78" fill="none" />
        <polyline points="-68,39 0,0 68,39" fill="none" strokeOpacity="0.4" />
      </g>
      {/* open books on an arc */}
      {[-2, -1, 0, 1, 2].map((k, i) => (
        <g key={k} transform={`translate(${840 + k * 135} ${590 - Math.abs(k) * 22}) rotate(${k * 6})`} stroke={INK} strokeWidth="3" strokeLinejoin="round">
          <path d="M-50 -28 L-50 30 Q-24 20 0 32 Q24 20 50 30 L50 -28" fill={BOOKS[i]} />
          <path d="M-46 -32 Q-23 -42 0 -30 Q23 -42 46 -32 L46 22 Q23 12 0 24 Q-23 12 -46 22 Z" fill="#fff" />
          <path d="M0 -30 L0 24" />
        </g>
      ))}
      {/* letters */}
      <g fontFamily="'Arial Black', Arial, sans-serif" fontWeight="900" fill={INK}>
        <text x="560" y="150" fontSize="54">ẹ</text>
        <text x="1080" y="140" fontSize="48" fill="#1F5BFF">ƙ</text>
        <text x="600" y="430" fontSize="40">π</text>
        <text x="1060" y="440" fontSize="50" fill="#FF3D8B">ọ</text>
        <text x="520" y="300" fontSize="38">√</text>
        <text x="1110" y="300" fontSize="36">x²</text>
        <text x="720" y="110" fontSize="34" fill="#00994D">ụ</text>
      </g>
      {/* molecule + solids */}
      <g transform="translate(1080 560)" stroke={INK} strokeWidth="3">
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const a = (i / 6) * Math.PI * 2;
          const b = ((i + 1) / 6) * Math.PI * 2;
          return <line key={i} x1={r2(Math.cos(a) * 34)} y1={r2(Math.sin(a) * 34)} x2={r2(Math.cos(b) * 34)} y2={r2(Math.sin(b) * 34)} />;
        })}
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <circle key={i} cx={r2(Math.cos((i / 6) * Math.PI * 2) * 34)} cy={r2(Math.sin((i / 6) * Math.PI * 2) * 34)} r="10" fill={i % 2 ? "#1F5BFF" : "#fff"} />
        ))}
      </g>
      <polygon points="560,560 600,535 625,575 585,602" fill="#00B85C" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      <polygon points="1100,230 1132,198 1164,230 1132,262" fill="#1F5BFF" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
    </svg>
  );
}
