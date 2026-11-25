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

// A headline that fades in and holds, a readable line under it, a link to act on, everything
// inside the margins.
const GoodPromo = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: "clamp" });
  const rise = interpolate(frame, [0, 10], [30, 0], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ background: "#f5f1e8", fontFamily: font }}>
      <div style={{ position: "absolute", left: 200, top: 380 + rise, fontSize: 96, color: "#1d2a33", opacity }}>Ship faster</div>
      <div style={{ position: "absolute", left: 200, top: 520, fontSize: 48, color: "#2f3f4a", opacity }}>Checks your code without AI</div>
      <div style={{ position: "absolute", left: 200, top: 610, fontSize: 48, color: "#2f3f4a", opacity }}>attentry.js.org</div>
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


// A caption that comes in while the stripes behind it are still panning (T3).
const MovePromo = () => {
  const frame = useCurrentFrame();
  const x = -Math.min(frame, 60) * 12;
  return (
    <AbsoluteFill style={{ background: "#1b1d22", fontFamily: font }}>
      <div style={{ position: "absolute", left: x, top: 0, width: 4000, height: 1080, background: "repeating-linear-gradient(90deg, #2b3a55 0 120px, #d8dee9 120px 240px)" }} />
      {frame >= 40 && (
        <div style={{ position: "absolute", left: 560, top: 470, padding: "20px 40px", background: "#10151c", color: "#ffffff", fontSize: 80, opacity: interpolate(frame, [40, 44], [0, 1], { extrapolateRight: "clamp" }) }}>Now in every editor</div>
      )}
    </AbsoluteFill>
  );
};

// The call to action is the smallest, dimmest line on the end card (S1, Hitchcock's rule).
const SmallCtaPromo = () => (
  <AbsoluteFill style={{ background: "#f5f1e8", fontFamily: font }}>
    <div style={{ position: "absolute", left: 200, top: 360, fontSize: 96, color: "#1d2a33" }}>Ship faster</div>
    <div style={{ position: "absolute", left: 200, top: 500, fontSize: 48, color: "#2f3f4a" }}>Checks your code</div>
    <div style={{ position: "absolute", left: 200, top: 600, fontSize: 28, color: "#5a6670" }}>Download at attentry.js.org</div>
  </AbsoluteFill>
);

// A brand ending: a line at the start, then only the logo shape (no call to action needed).
const LogoPromo = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "#f5f1e8", fontFamily: font }}>
      {frame < 28 && <div style={{ position: "absolute", left: 200, top: 400, fontSize: 96, color: "#1d2a33" }}>Ship faster</div>}
      {frame >= 28 && <div style={{ position: "absolute", left: 860, top: 440, width: 200, height: 200, borderRadius: 40, background: "#1d2a33" }} />}
    </AbsoluteFill>
  );
};

// A picture with lettering in it (only pixels to the browser) that runs off the frame's edge.
const ImagePromo = () => (
  <AbsoluteFill style={{ background: "#f5f1e8", fontFamily: font }}>
    <div style={{ position: "absolute", left: 200, top: 200, fontSize: 80, color: "#1d2a33" }}>Try it at attentry.js.org</div>
    <img src="data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%221400%22%20height%3D%22300%22%3E%3Crect%20width%3D%221400%22%20height%3D%22300%22%20fill%3D%22%23ffffff%22%2F%3E%3Ctext%20x%3D%2240%22%20y%3D%22190%22%20font-family%3D%22Arial%22%20font-weight%3D%22700%22%20font-size%3D%22120%22%20fill%3D%22%23111111%22%3ELIMITED%20OFFER%20TODAY%3C%2Ftext%3E%3C%2Fsvg%3E" style={{ position: "absolute", left: 900, top: 560, width: 1400, height: 300 }} />
  </AbsoluteFill>
);

export const Root = () => (
  <>
    <Composition id="BadPromo" component={BadPromo} {...common} />
    <Composition id="GoodPromo" component={GoodPromo} {...common} />
    <Composition id="DriftPromo" component={DriftPromo} {...common} />
    <Composition id="CardPromo" component={CardPromo} {...common} />
    <Composition id="RingPromo" component={RingPromo} {...common} />
    <Composition id="MovePromo" component={MovePromo} {...common} />
    <Composition id="SmallCtaPromo" component={SmallCtaPromo} {...common} />
    <Composition id="LogoPromo" component={LogoPromo} {...common} />
    <Composition id="ImagePromo" component={ImagePromo} {...common} />
  </>
);
