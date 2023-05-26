import {
  SERVER,
  ProcessResult,
  ERR_NOT_IMAGE,
  ERR_IMAGE_LOAD_FAIL,
  ERR_SERVER,
  Elements,
  ERR_TOO_LARGE_IMAGE,
} from "./common";

/**
 * Send raw image data and get JSON result for the design elements
 * 1. Check if the selected node is Image
 * 2. Check the image size
 * 3.
 */
async function processScreenshots(selected: SceneNode): Promise<ProcessResult> {
  if (
    selected.type !== "RECTANGLE" ||
    !Array.isArray(selected.fills) ||
    selected.fills[0].type !== "IMAGE"
  ) {
    throw new Error(ERR_NOT_IMAGE(selected.name));
  }

  const { imageHash }: { imageHash: string } = selected.fills[0];

  const image = figma.getImageByHash(imageHash);

  if (!image) {
    throw new Error(ERR_IMAGE_LOAD_FAIL(selected.name));
  }

  const imageBytes = await image.getBytesAsync();

  // TODO: check the image size

  const { width, height, x, y, name } = selected;
  const imageData = {
    width,
    height,
    bytes: Array.from(imageBytes),
  };
  const runResponse = await fetch(`${SERVER}/run`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(imageData),
  }).catch((error) => {
    console.log(error);
  });

  if (!runResponse) {
    throw new Error(ERR_SERVER);
  }

  switch (runResponse.status) {
    case 200: {
      const runResult = (await runResponse.json())
        .replace(/'/g, '"')
        .replace(/\(/g, "[")
        .replace(/\)/g, "]");

      const elements: Elements = JSON.parse(runResult);

      return {
        elements,
        imageInfo: { width, height, x, y, imageHash, name },
      };
    }

    case 401:
      throw new Error(ERR_TOO_LARGE_IMAGE(selected.name));

    default:
      throw new Error(ERR_SERVER);
  }
}

export default processScreenshots;
