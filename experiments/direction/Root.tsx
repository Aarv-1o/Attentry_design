import { Composition } from "remotion";
import { Campsite } from "./Campsite";
import { Dragon } from "./Dragon";
import { Plane } from "./Plane";

// The direction-card test: each prompt made twice, plain and directed, 4 s at 30 fps.
const common = { durationInFrames: 120, fps: 30, width: 1920, height: 1080 } as const;

export const Root = () => (
  <>
    <Composition id="DragonPlain" component={Dragon} defaultProps={{ directed: false }} {...common} />
    <Composition id="DragonDirected" component={Dragon} defaultProps={{ directed: true }} {...common} />
    <Composition id="CampPlain" component={Campsite} defaultProps={{ directed: false }} {...common} />
    <Composition id="CampDirected" component={Campsite} defaultProps={{ directed: true }} {...common} />
    <Composition id="PlanePlain" component={Plane} defaultProps={{ directed: false }} {...common} />
    <Composition id="PlaneDirected" component={Plane} defaultProps={{ directed: true }} {...common} />
  </>
);
