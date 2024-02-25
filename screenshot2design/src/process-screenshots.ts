import { RecognizedImage, SERVER, TOAST_MESSAGES } from "./common";

type ImageDataDto = {
  width: number;
  height: number;
  imageBytes: number[];
};

/**
 * Send raw image data and get JSON result for the design elements
 * 1. Check if the selected node is Image
 * 2. Check the image size
 * 3.
 */
const getImageData = async (selected: SceneNode): Promise<ImageDataDto> => {
  if (
    selected.type !== "RECTANGLE" ||
    !Array.isArray(selected.fills) ||
    selected.fills[0].type !== "IMAGE"
  ) {
    throw new Error(TOAST_MESSAGES.ERR_NOT_IMAGE(selected.name));
  }

  const { imageHash }: { imageHash: string } = selected.fills[0];

  const image = figma.getImageByHash(imageHash);

  if (!image) {
    throw new Error(TOAST_MESSAGES.ERR_IMAGE_LOAD_FAIL(selected.name));
  }

  const imageBytes = await image.getBytesAsync();
  const { width, height } = selected;

  return { width, height, imageBytes: Array.from(imageBytes) };
};

const processScreenshots = async (
  selection: readonly SceneNode[]
): Promise<RecognizedImage[]> => {
  const { email }: { email: string } = await figma.clientStorage.getAsync(
    "userData"
  );

  const imagesData = await Promise.all(selection.map(getImageData));

  const requestBody = {
    email,
    images: imagesData,
  };

  const runResponse = await fetch(`${SERVER}/run`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  }).catch((error) => {
    console.log(error);
  });

  if (!runResponse) {
    throw new Error(TOAST_MESSAGES.ERR_SERVER);
  }

  switch (runResponse.status) {
    case 200: {
      const runResult = (await runResponse.json())
        .replace(/'/g, '"')
        .replace(/\(/g, "[")
        .replace(/\)/g, "]");

      const recognizedImages: RecognizedImage[] = JSON.parse(runResult);

      return recognizedImages;
    }

    case 401:
      throw new Error(TOAST_MESSAGES.ERR_TOO_LARGE_PAYLOAD);

    default:
      throw new Error(TOAST_MESSAGES.ERR_SERVER);
  }
};

export default processScreenshots;
