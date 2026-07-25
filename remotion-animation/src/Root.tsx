import { Composition } from "remotion";
import { VibeCheckIntro } from "./VibeCheckIntro";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="VibeCheckIntro"
      component={VibeCheckIntro}
      durationInFrames={300}
      fps={30}
      width={1280}
      height={720}
    />
  );
};
