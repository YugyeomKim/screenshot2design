import { RecognizedImage, SERVER, TOAST_MESSAGES } from "./common";

/**
 * Send raw image data and get JSON result for the design elements
 * 1. Check if the selected node is Image
 * 2. Check the image size
 * 3.
 */
const getImageBytes = async (selected: SceneNode): Promise<number[]> => {
  const imageBytes = await selected.exportAsync({ format: "JPG" });

  if (!imageBytes) {
    throw new Error(TOAST_MESSAGES.ERR_IMAGE_LOAD_FAIL(selected.name));
  }

  return Array.from(imageBytes);
};

const processScreenshots = async (
  selection: readonly SceneNode[]
): Promise<RecognizedImage[]> => {
  const { email }: { email: string } = await figma.clientStorage.getAsync(
    "userData"
  );

  const imageBytes = await Promise.all(selection.map(getImageBytes));

  const requestBody = {
    email,
    imageBytes,
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

  console.log(await runResponse.json());

  switch (runResponse.status) {
    case 200: {
      const recognitionDataList = await runResponse.json();
      return recognitionDataList;
    }

    case 401:
      throw new Error(TOAST_MESSAGES.ERR_TOO_LARGE_PAYLOAD);

    default:
      throw new Error(TOAST_MESSAGES.ERR_SERVER);
  }
};

export default processScreenshots;
