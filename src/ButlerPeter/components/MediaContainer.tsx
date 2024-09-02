import { Fragment, memo, useMemo } from "react";
import {
  useVideoConfig,
  AbsoluteFill,
  Img,
  interpolate,
  random,
  useCurrentFrame,
} from "remotion";
import {
  TransitionPresentation,
  TransitionSeries,
  springTiming,
} from "@remotion/transitions";
import { SlideDirection, slide } from "@remotion/transitions/slide";
import { FlipDirection, flip } from "@remotion/transitions/flip";
import { fade } from "@remotion/transitions/fade";
import { wipe } from "@remotion/transitions/wipe";
import { IMAGE_TIMELINE, TRANSITION_TYPES } from "../constants";
import { TimelineFrame } from "../types";

// Helper function to get transition presentation method
function getTransitionPresentationMethod({
  transitionType,
  direction,
}: {
  transitionType: string;
  direction: FlipDirection;
}): {
  presentation: TransitionPresentation<Record<string, unknown>> | undefined;
  recommendedDuration: number;
} {
  if (transitionType === TRANSITION_TYPES.FADE) {
    return { presentation: fade(), recommendedDuration: 20 };
  }
  if (transitionType === TRANSITION_TYPES.SLIDE) {
    return { presentation: slide({ direction }), recommendedDuration: 20 };
  }
  if (transitionType === TRANSITION_TYPES.FLIP) {
    return { presentation: flip({ direction }), recommendedDuration: 10 };
  }
  return { presentation: wipe({ direction }), recommendedDuration: 10 };
}

const RenderMedia = () => {
  const { height, width, durationInFrames, fps } = useVideoConfig();
  const currentFrame = useCurrentFrame();

  const timeline: TimelineFrame[] = IMAGE_TIMELINE;

  const lastImageFrame = useMemo(() => {
    return timeline
      .slice()
      .reverse()
      .find((f) => f.url);
  }, [timeline]);

  const transitionDurations = useMemo(() => {
    return timeline.map((frame) => {
      if (frame.transitionType) {
        const { recommendedDuration } = getTransitionPresentationMethod({
          transitionType: frame.transitionType,
          direction: "from-left", // Default direction, adjust as needed
        });
        return recommendedDuration;
      }
      return 0;
    });
  }, [timeline, height, width]);

  const adjustedTimeline = useMemo(() => {
    let accumulatedTransitionFrames = 0;
    return timeline.map((frame, index) => {
      const startFrame =
        Math.ceil(frame.startTimeStamp * fps) + accumulatedTransitionFrames;
      const transitionDuration = transitionDurations[index];
      accumulatedTransitionFrames += transitionDuration;

      const isLastFrame = index === timeline.length - 1;
      const nextImageFrame = timeline.slice(index + 1).find((f) => f.url);
      const calculatedEndFrame = isLastFrame
        ? durationInFrames
        : nextImageFrame
          ? Math.ceil(nextImageFrame.startTimeStamp * fps) +
            accumulatedTransitionFrames
          : durationInFrames + accumulatedTransitionFrames;

      const endFrame = Math.max(startFrame + 30, calculatedEndFrame);

      return {
        ...frame,
        startFrame,
        endFrame,
        transitionDuration,
      };
    });
  }, [timeline, fps, transitionDurations]);

  return (
    <TransitionSeries>
      {adjustedTimeline.map((frame, index) => {
        const mediaUrl = frame.url;

        if (!mediaUrl && frame !== lastImageFrame) return null;

        const slideDirections: SlideDirection[] = [
          "from-left",
          "from-top",
          "from-right",
          "from-bottom",
        ];

        const randomDirection: FlipDirection =
          slideDirections[
            Math.floor(random(`direction-${index}`) * slideDirections.length)
          ];

        const shakeIntensity = 20;
        const shakeFrequency = 10;

        const shakeX = (index: number) => {
          return index % 2 === 0
            ? Math.sin(currentFrame / shakeFrequency) * shakeIntensity
            : Math.cos(currentFrame / shakeFrequency) * shakeIntensity;
        };

        const shakeY = (index: number) => {
          return index % 2 === 0
            ? Math.cos(currentFrame / shakeFrequency) * 0
            : Math.sin(currentFrame / shakeFrequency) * 0;
        };

        const zoomEffect = (index: number) => {
          const zoomPattern = ["zoomIn", "zoomOut"];
          return zoomPattern[(index + 1) % zoomPattern.length];
        };

        const mediaStyle: React.CSSProperties = {
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${Math.max(
            zoomEffect(index) === "zoomIn"
              ? interpolate(
                  currentFrame,
                  [frame.startFrame, frame.endFrame],
                  [1.1, 1.5]
                )
              : zoomEffect(index) === "zoomOut"
                ? interpolate(
                    currentFrame,
                    [frame.startFrame, frame.endFrame],
                    [1.5, 1.1]
                  )
                : 1.1,
            1.1
          )}) translate(${shakeX(index)}px, ${shakeY(index)}px)`,
          transformOrigin: "center center",
        };

        console.log(
          `frameIndex${index}`,
          frame.endFrame,
          frame.startFrame,
          currentFrame,
          durationInFrames
        );

        return (
          <Fragment key={index}>
            {frame.transitionType && frame.transitionDuration > 0 && (
              <TransitionSeries.Transition
                presentation={
                  getTransitionPresentationMethod({
                    transitionType: frame.transitionType,
                    direction: randomDirection,
                  }).presentation
                }
                timing={springTiming({
                  config: { damping: 200 },
                  durationInFrames: frame.transitionDuration,
                })}
              />
            )}
            <TransitionSeries.Sequence
              durationInFrames={
                frame.endFrame - frame.startFrame + frame.transitionDuration
              }
            >
              <AbsoluteFill>
                <AbsoluteFill
                  style={{
                    transform: mediaStyle.transform,
                    transformOrigin: "center center",
                  }}
                >
                  <Img
                    src={(mediaUrl || lastImageFrame?.url) ?? ""}
                    alt={`media-${index}`}
                    style={{
                      ...mediaStyle,
                      width: "100%",
                      height: "100%",
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                    }}
                  />
                </AbsoluteFill>
              </AbsoluteFill>
            </TransitionSeries.Sequence>
          </Fragment>
        );
      })}
    </TransitionSeries>
  );
};

export default memo(RenderMedia);
