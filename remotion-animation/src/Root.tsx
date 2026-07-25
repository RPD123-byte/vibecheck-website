import { Composition } from "remotion";
import { VibeCheckIntro } from "./VibeCheckIntro";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="VibeCheckIntro"
      component={VibeCheckIntro}
      durationInFrames={280}
      fps={30}
      width={1280}
      height={720}
    />
  );
};
