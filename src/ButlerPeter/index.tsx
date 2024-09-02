import { Audio, staticFile } from "remotion";
import { AbsoluteFill } from "remotion";
import { z } from "zod";
import { zColor } from "@remotion/zod-types";
import MediaContainer from "./components/MediaContainer";

export const myCompSchema = z.object({
  titleText: z.string(),
  titleColor: zColor(),
  logoColor1: zColor(),
  logoColor2: zColor(),
});

export const ButlerPeter: React.FC<z.infer<typeof myCompSchema>> = () => {
  return (
    <AbsoluteFill>
      <Audio src={staticFile("TestAudio.mp3")} />
      <MediaContainer />
    </AbsoluteFill>
  );
};
