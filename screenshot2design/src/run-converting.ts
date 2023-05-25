import processScreenshots from "./process-screenshots";
import drawResult from "./draw-result";

/**
 * Run the Converting.
 * 1. Call processScreenshots() to get JSON of design information.
 * 2. Call drawResult() to draw it on the Canvas
 */
function runConverting(
  selection: readonly SceneNode[]
): Promise<PromiseSettledResult<FrameNode>[]> {
  return Promise.allSettled(
    selection.map(async (selected) => {
      const { elements, imageInfo } = await processScreenshots(selected);
      const newFrame = drawResult(elements, imageInfo);

      return newFrame;
    })
  );
}

export default runConverting;
