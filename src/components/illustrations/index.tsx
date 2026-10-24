/**
 * Original illustrations for this project, drawn flat with ink keylines to match
 * the 3D scene. Child-facing pathways use objects and abstract scenes rather than
 * photographs of real children.
 */
import { cn } from "@/lib/utils";

const INK = "#111111";

export function KidsIllustration({ className }: { className?: string }) {
  const rays = [0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
    const a = (i / 8) * Math.PI * 2;
    return { x1: Math.round(320 + Math.cos(a) * 48), y1: Math.round(70 + Math.sin(a) * 48), x2: Math.round(320 + Math.cos(a) * 62), y2: Math.round(70 + Math.sin(a) * 62) };
  });
  return (
    <svg viewBox="0 0 400 300" className={cn("size-full", className)} role="img" aria-label="Illustration: letter blocks, an abacus and crayons under a smiling sun">
      <rect width="400" height="300" fill="#FFF3BF" />
      <g stroke={INK} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
        {rays.map((r, i) => <line key={i} {...r} />)}
        <circle cx="320" cy="70" r="38" fill="#FFC800" />
        <path d="M306 76 q14 12 28 0" fill="none" />
      </g>
      <circle cx="308" cy="63" r="3.5" fill={INK} /><circle cx="332" cy="63" r="3.5" fill={INK} />
      <rect x="0" y="232" width="400" height="68" fill="#FF6A13" stroke={INK} strokeWidth="4" />
      {/* blocks */}
      <g stroke={INK} strokeWidth="4" strokeLinejoin="round">
        <rect x="40" y="172" width="60" height="60" fill="#1F5BFF" />
        <rect x="100" y="172" width="60" height="60" fill="#FF3D8B" />
        <rect x="70" y="112" width="60" height="60" fill="#00B85C" transform="rotate(-6 100 142)" />
      </g>
      <g fontFamily="'Arial Black', Arial, sans-serif" fontWeight="900" fontSize="34" textAnchor="middle" fill="#fff">
        <text x="70" y="214">A</text>
        <text x="130" y="214">ẹ</text>
        <text x="100" y="154" transform="rotate(-6 100 142)" fill={INK}>3</text>
      </g>
      {/* abacus */}
      <g transform="translate(200 116)" stroke={INK} strokeWidth="4">
        <rect x="0" y="0" width="134" height="114" fill="#fff" />
        {[26, 56, 86].map((y, r) => (
          <g key={y}>
            <line x1="4" x2="130" y1={y} y2={y} strokeWidth="3" />
            {[0, 1, 2, 3, 4].map((k) => (
              <circle key={k} cx={(k < 2 + r ? 20 : 52) + k * 16} cy={y} r="8" fill={["#1F5BFF", "#FFC800", "#FF3D8B"][r]} strokeWidth="3" />
            ))}
          </g>
        ))}
      </g>
      {/* crayons */}
      {["#1F5BFF", "#00B85C", "#FF3D8B"].map((c, i) => (
        <g key={c} transform={`translate(${46 + i * 30} 254) rotate(${-10 + i * 8})`} stroke={INK} strokeWidth="3" strokeLinejoin="round">
          <rect x="0" y="0" width="80" height="16" fill={c} />
          <path d="M80 0 L98 8 L80 16Z" fill="#fff" />
        </g>
      ))}
    </svg>
  );
}

export function TeensIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 300" className={cn("size-full", className)} role="img" aria-label="Illustration: a laptop showing Python code beside a compass, a calculator and an exam plan">
      <rect width="400" height="300" fill="#DDF7E8" />
      <g stroke={INK} strokeWidth="4" strokeLinejoin="round">
        {/* laptop */}
        <rect x="90" y="62" width="206" height="136" fill="#111" />
        <rect x="100" y="72" width="186" height="116" fill="#1F5BFF" />
        <path d="M70 198 h246 l-16 20 h-214z" fill="#fff" />
      </g>
      <g fontFamily="ui-monospace, Menlo, monospace" fontSize="12" fontWeight="700">
        <text x="112" y="96" fill="#FFC800">for week in range(7):</text>
        <text x="126" y="116" fill="#fff">practise(&quot;algebra&quot;)</text>
        <text x="126" y="136" fill="#fff">check(&quot;Tue&quot;, &quot;Fri&quot;)</text>
        <text x="112" y="164" fill="#00B85C"># BECE ready</text>
      </g>
      {/* compass */}
      <g transform="translate(328 168)" stroke={INK} strokeWidth="4">
        <circle r="40" fill="#fff" />
        <path d="M0 -28 L9 0 L0 28 L-9 0Z" fill="#FF3D8B" strokeWidth="3" />
      </g>
      {/* calculator */}
      <g transform="translate(26 190)" stroke={INK} strokeWidth="3">
        <rect width="58" height="84" fill="#FFC800" strokeWidth="4" />
        <rect x="8" y="8" width="42" height="16" fill="#fff" />
        {[0, 1, 2].map((r) => [0, 1, 2].map((c) => <rect key={`${r}${c}`} x={8 + c * 14} y={32 + r * 15} width="10" height="10" fill="#fff" strokeWidth="2" />))}
      </g>
      {/* exam plan card */}
      <g transform="translate(262 22) rotate(6)" stroke={INK} strokeWidth="3">
        <rect width="114" height="74" fill="#fff" strokeWidth="4" />
        <text x="10" y="22" fontSize="11" fontWeight="900" fill={INK} stroke="none" fontFamily="'Arial Black', Arial, sans-serif">EXAM PLAN</text>
        {[0, 1, 2].map((i) => (
          <g key={i}><rect x="10" y={32 + i * 12} width="8" height="8" fill={i < 2 ? "#00B85C" : "#fff"} strokeWidth="2" /><line x1="26" x2={86 - i * 10} y1={36 + i * 12} y2={36 + i * 12} strokeWidth="3" /></g>
        ))}
      </g>
    </svg>
  );
}

/** Abstract "lesson board" used as a recorded-lesson poster when no video exists. */
export function LessonBoard({ title, hue = 258, className }: { title: string; hue?: number; className?: string }) {
  const palette = ["#1F5BFF", "#00B85C", "#FF3D8B", "#FF6A13", "#111111"];
  const bg = palette[Math.abs(Math.round(hue / 47)) % palette.length];
  return (
    <svg viewBox="0 0 640 360" className={cn("size-full", className)} role="img" aria-label={`Lesson slide: ${title}`}>
      <rect width="640" height="360" fill={bg} />
      <g stroke="#fff" strokeOpacity="0.14">
        {Array.from({ length: 16 }, (_, i) => <line key={i} x1={i * 40} y1="0" x2={i * 40} y2="360" />)}
        {Array.from({ length: 9 }, (_, i) => <line key={i} x1="0" y1={i * 40} x2="640" y2={i * 40} />)}
      </g>
      <rect x="44" y="70" width="552" height="96" fill="#fff" stroke={INK} strokeWidth="4" />
      <text x="64" y="128" fill={INK} fontSize="30" fontWeight="900" fontFamily="'Arial Black', Arial, sans-serif">{title.length > 30 ? title.slice(0, 29) + "…" : title}</text>
      <path d="M60 300 L180 236 L270 280 L400 210 L580 240" stroke="#FFC800" strokeWidth="8" fill="none" strokeLinejoin="round" strokeLinecap="round" />
      <text x="64" y="200" fill="#fff" fontSize="15" fontFamily="ui-monospace, Menlo, monospace" fontWeight="700">LUMEN LEARN / RECORDED LESSON</text>
    </svg>
  );
}
