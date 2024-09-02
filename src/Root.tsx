import { Composition, staticFile } from "remotion";
import { ButlerPeter, myCompSchema } from "./ButlerPeter";
import { getAudioData } from "@remotion/media-utils";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="ButlerPeter"
        component={ButlerPeter}
        calculateMetadata={async () => {
          const data = await getAudioData(staticFile("TestAudio.mp3"));

          return {
            durationInFrames: Math.floor(data.durationInSeconds * 30),
          };
        }}
        fps={30}
        width={720}
        height={1280}
        schema={myCompSchema}
        defaultProps={{
          titleText: "Welcome to Remotion",
          titleColor: "#000000",
          logoColor1: "#91EAE4",
          logoColor2: "#86A8E7",
        }}
      />
    </>
  );
};
