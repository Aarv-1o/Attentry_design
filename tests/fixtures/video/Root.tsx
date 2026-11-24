// Test promos for the video checks: one with the faults the baseline found most, one without.
// 4 s at 30 fps, 1920 × 1080.
import { AbsoluteFill, Composition, interpolate, useCurrentFrame } from "remotion";

const common = { durationInFrames: 120, fps: 30, width: 1920, height: 1080 } as const;
const font = "Arial, sans-serif";

// Black for the first second, a headline shown for 0.4 s, grey-on-dark small text, a URL at the edge.
const BadPromo = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: frame < 30 ? "#000" : "#1b1d22", fontFamily: font }}>
      {frame >= 30 && frame < 42 && (
        <div style={{ position: "absolute", left: 300, top: 400, fontSize: 90, color: "#fff" }}>Ship faster with less code</div>
      )}
      {frame >= 30 && (
        <div style={{ position: "absolute", left: 300, top: 600, fontSize: 18, color: "#4a4d55" }}>Free for teams</div>
      )}
      {frame >= 30 && (
        <div style={{ position: "absolute", left: 10, top: 1030, fontSize: 40, color: "#fff" }}>attentry.js.org</div>
      )}
    </AbsoluteFill>
  );
};

// A headline that fades in and holds, a readable line under it, everything inside the margins.
const GoodPromo = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: "clamp" });
  const rise = interpolate(frame, [0, 10], [30, 0], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ background: "#f5f1e8", fontFamily: font }}>
      <div style={{ position: "absolute", left: 200, top: 380 + rise, fontSize: 96, color: "#1d2a33", opacity }}>Ship faster</div>
      <div style={{ position: "absolute", left: 200, top: 520, fontSize: 48, color: "#2f3f4a", opacity }}>Checks your code without AI</div>
      <div style={{ position: "absolute", left: 1400 - frame, top: 200, width: 220, height: 220, borderRadius: 110, background: "#e07a3f" }} />
    </AbsoluteFill>
  );
};

// GoodPromo with a new color and font: drift from a lock made on GoodPromo.
const DriftPromo = () => (
  <AbsoluteFill style={{ background: "#f5f1e8", fontFamily: "Courier New, monospace" }}>
    <div style={{ position: "absolute", left: 200, top: 380, fontSize: 96, color: "#7b2cbf" }}>Ship faster</div>
    <div style={{ position: "absolute", left: 200, top: 520, fontSize: 48, color: "#2f3f4a" }}>Checks your code without AI</div>
  </AbsoluteFill>
);

// A centered line typed over 1 s that then holds 2.5 s (passes), and a title with a subtitle,
// 62 characters together, up for 1 s (needs 3.6 s), with a counter running beside them.
const CardPromo = () => {
  const frame = useCurrentFrame();
  const line = "Built in a weekend";
  const typed = line.slice(0, Math.min(line.length, Math.floor(frame / 1.6)));
  return (
    <AbsoluteFill style={{ background: "#10151c", fontFamily: font, color: "#f2f2f2" }}>
      <div style={{ position: "absolute", top: 300, width: "100%", textAlign: "center", fontSize: 80 }}>{typed}</div>
      {frame >= 90 && (
        <>
          <div style={{ position: "absolute", left: 200, top: 600, fontSize: 64 }}>Checks every edit</div>
          <div style={{ position: "absolute", left: 200, top: 690, fontSize: 40 }}>and tells Claude what to fix before you see it</div>
        </>
      )}
      <div style={{ position: "absolute", right: 200, top: 860, fontSize: 48 }}>{Math.min(2400, frame * 40)}</div>
    </AbsoluteFill>
  );
};

// A step label with a ring drawn around its icon that cuts through the label (the explainer's
// first version), held for the whole video.
const RingPromo = () => (
  <AbsoluteFill style={{ background: "#f7f1e3", fontFamily: font }}>
    <svg width={1920} height={1080} style={{ position: "absolute" }}>
      <circle cx={960} cy={420} r={70} fill="none" stroke="#1f2430" strokeWidth={8} />
      <ellipse cx={960} cy={460} rx={170} ry={180} fill="none" stroke="#139c80" strokeWidth={8} />
    </svg>
    <div style={{ position: "absolute", left: 760, width: 400, top: 590, textAlign: "center", fontSize: 56, color: "#1f2430" }}>Before an edit</div>
  </AbsoluteFill>
);

export const Root = () => (
  <>
    <Composition id="BadPromo" component={BadPromo} {...common} />
    <Composition id="GoodPromo" component={GoodPromo} {...common} />
    <Composition id="DriftPromo" component={DriftPromo} {...common} />
    <Composition id="CardPromo" component={CardPromo} {...common} />
    <Composition id="RingPromo" component={RingPromo} {...common} />
  </>
);
