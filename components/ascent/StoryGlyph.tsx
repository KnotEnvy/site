import { hashf } from "@/lib/prng";
/**
 * Still illustrations of The Ascent's seven shapes, for devices where the
 * WebGL sky has given up (lib/skyStatus.ts). The particle spirit IS that
 * page's imagery; without these the stage beside the narration would simply
 * be empty. Drawn as glowing line art so they sit in the same visual family.
 */
type Kind = "scatter" | "galaxy" | "helix" | "star" | "heart" | "butterfly" | "radiance";

export default function StoryGlyph({ kind }: { kind: Kind }) {
  const stroke = kind === "heart" ? "#ffcf7a" : kind === "helix" ? "#86e6ff" : "#fff1c0";
  return (
    <svg
      viewBox="-100 -100 200 200"
      className="h-72 w-72 drop-shadow-[0_0_24px_rgba(255,207,122,0.45)]"
      fill="none"
      stroke={stroke}
      strokeWidth={1.6}
      strokeLinecap="round"
    >
      {kind === "scatter" &&
        Array.from({ length: 70 }, (_, i) => (
          <circle key={i} cx={(hashf(i) * 2 - 1) * 90} cy={(hashf(i + 9) * 2 - 1) * 70} r={0.6 + hashf(i + 3) * 1.6} fill="#8c97d8" stroke="none" />
        ))}
      {kind === "galaxy" &&
        [0, 1, 2].map((arm) => (
          <path
            key={arm}
            transform={`rotate(${arm * 120})`}
            d={Array.from({ length: 40 }, (_, i) => {
              const r = 6 + i * 2.1;
              const a = Math.log(r / 6) * 1.9;
              return `${i === 0 ? "M" : "L"}${(Math.cos(a) * r).toFixed(1)} ${(Math.sin(a) * r * 0.55).toFixed(1)}`;
            }).join(" ")}
          />
        ))}
      {kind === "helix" && (
        <>
          <path d={Array.from({ length: 60 }, (_, i) => `${i === 0 ? "M" : "L"}${(Math.sin(i * 0.32) * 30).toFixed(1)} ${-90 + i * 3}`).join(" ")} />
          <path d={Array.from({ length: 60 }, (_, i) => `${i === 0 ? "M" : "L"}${(-Math.sin(i * 0.32) * 30).toFixed(1)} ${-90 + i * 3}`).join(" ")} />
          {Array.from({ length: 15 }, (_, i) => {
            const y = -84 + i * 12;
            const x = Math.sin(((y + 90) / 3) * 0.32) * 30;
            return <line key={i} x1={x} x2={-x} y1={y} y2={y} opacity={0.6} />;
          })}
        </>
      )}
      {kind === "star" && (
        <>
          <circle r={10} fill="#fff4d6" stroke="none" />
          <circle r={26} opacity={0.4} />
          <path d="M0 -60V60M-60 0H60M-34 -34L34 34M34 -34L-34 34" opacity={0.5} />
        </>
      )}
      {kind === "heart" && (
        <path
          d={Array.from({ length: 64 }, (_, i) => {
            const t = (i / 63) * Math.PI * 2;
            const x = 16 * Math.pow(Math.sin(t), 3) * 4.4;
            const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * 4.4;
            return `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
          }).join(" ")}
        />
      )}
      {kind === "butterfly" && (
        <path
          d={Array.from({ length: 360 }, (_, i) => {
            const t = (i / 359) * Math.PI * 12;
            const r = Math.exp(Math.cos(t)) - 2 * Math.cos(4 * t) - Math.pow(Math.sin(t / 12), 5);
            return `${i === 0 ? "M" : "L"}${(Math.sin(t) * r * 22).toFixed(1)} ${(-Math.cos(t) * r * 22 + 20).toFixed(1)}`;
          }).join(" ")}
          strokeWidth={1}
        />
      )}
      {kind === "radiance" && (
        <>
          {Array.from({ length: 24 }, (_, i) => {
            const a = (i / 24) * Math.PI * 2;
            return (
              <line key={i} x1={Math.cos(a) * 42} y1={-24 + Math.sin(a) * 42} x2={Math.cos(a) * 92} y2={-24 + Math.sin(a) * 92} opacity={0.45} />
            );
          })}
          <circle cy={-24} r={34} opacity={0.5} />
          <path d="M0 -92V92M-40 -24H40" strokeWidth={9} stroke="#fff4d8" />
        </>
      )}
    </svg>
  );
}
