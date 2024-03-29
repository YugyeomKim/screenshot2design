import drawResult from "./draw-result";
import processScreenshots from "./process-screenshots";

/**
 * Run the Converting.
 * 1. Call processScreenshots() to get JSON of design information.
 * 2. Call drawResult() to draw it on the Canvas
 */
const runConverting = async (
  selection: readonly SceneNode[]
): Promise<FrameNode[]> => {
  const recognitionDataList = await processScreenshots(selection);
  const resultFrames = drawResult({ recognitionDataList, selection });
  return resultFrames;
};

export default runConverting;
