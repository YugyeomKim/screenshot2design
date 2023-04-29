const SERVER = "http://localhost:3000";
const IMAGE_NUM_LIMIT = 10;
const IMAGE_SIZE_LIMIT = 10;

interface KnownError {
  message: string;
}

interface ResultFrame {
  results: FrameNode[];
  successRun: number;
  totalRun: number;
}

interface ImageInfo {
  width: number;
  height: number;
  x: number;
  y: number;
  imageHash: string;
  name: string;
}

interface ServerResponse {
  runResponsePromise: Promise<FetchResponse>;
  imageInfo: ImageInfo;
}

interface Elements {
  img_shape: [height: number, width: number, color: number];
  compos: {
    id: number;
    class: "Compo" | "Text";
    width: number;
    height: number;
    position: {
      column_max: number;
      row_max: number;
      row_min: number;
      column_min: number;
    };
    parent?: number;
    text_content?: string;
  }[];
}

/**
 * Send raw image data and get JSON result for the design elements
 * @param {SceneNode} selection
 * @returns {Promise<ServerResponse>}
 */
async function getResultFromServer(
  selection: SceneNode
): Promise<ServerResponse> {
  if (
    selection.type === "RECTANGLE" &&
    Array.isArray(selection.fills) &&
    selection.fills[0].type === "IMAGE"
  ) {
    const { imageHash } = selection.fills[0];

    if (typeof imageHash !== "string") {
      // If no imageHash is available.
      const message = "Please check if you selected images only.";
      throw new Error(message);
    }

    const image = figma.getImageByHash(imageHash);

    if (!image) {
      // If no imageHash is available.
      const message = "Failed to load an image from your selection.";
      throw new Error(message);
    }

    const imageBytes = await image.getBytesAsync();

    /*
    const imageBytes = await selection.exportAsync({
      format: "JPG",
      constraint: { type: "SCALE", value: 1 },
    });
    */

    if (!imageBytes) {
      // If failed to export image.
      const message = "Failed to export an image from your selection.";
      throw new Error(message);
    }

    // Get server response
    const { width, height, x, y, name } = selection;
    const imageData = {
      width,
      height,
      bytes: Array.from(imageBytes),
    };
    try {
      const runResponsePromise = fetch(`${SERVER}/run`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(imageData),
      });

      return {
        runResponsePromise,
        imageInfo: { width, height, x, y, imageHash, name },
      };
    } catch (error) {
      console.log(error);
      const message = "No server responses.";
      throw new Error(message);
    }
  } else {
    // If fills is not an IMAGE.
    const message = "Please check if you selected images only.";
    throw new Error(message);
  }
}

/**
 * Get the JSON from the server response and draw it on the user screen
 * @param {Elements} elements
 * @param {ImageInfo} imageInfo
 */
function drawResult(elements: Elements, imageInfo: ImageInfo): FrameNode {
  const { width, height, x, y, imageHash, name } = imageInfo;
  const {
    img_shape: [resizedHeight, resizedWidth, _],
    compos,
  } = elements;
  const ratio = height / resizedHeight;

  const frame = figma.createFrame();
  frame.name = name;
  frame.x = x + width + 30;
  frame.y = y;
  frame.resize(width, height);
  frame.fills = [
    {
      type: "IMAGE",
      imageHash,
      scaleMode: "FILL",
      opacity: 0.5,
    },
  ];

  compos.map((compo) => {
    if (compo.class === "Compo") {
      const rectangle = figma.createRectangle();
      rectangle.name = `${name} - ${compo.id}`;
      rectangle.x = compo.position.column_min * ratio;
      rectangle.y = compo.position.row_min * ratio;
      rectangle.resize(compo.width * ratio, compo.height * ratio);
      rectangle.fills = [
        {
          type: "SOLID",
          color: {
            r: 0 / 255,
            g: 0 / 255,
            b: 0 / 255,
          },
          opacity: 0.2,
        },
      ];
      rectangle.strokes = [
        {
          type: "SOLID",
          color: {
            r: 0 / 255,
            g: 0 / 255,
            b: 0 / 255,
          },
        },
      ];
      frame.appendChild(rectangle);
    } else if (compo.class === "Text") {
      const text = figma.createText();
      let textContents = "Placeholder";
      if (compo.text_content) {
        textContents = compo.text_content;
      }
      text.name = textContents;
      text.x = compo.position.column_min * ratio;
      text.y = compo.position.row_min * ratio;
      text.resize(compo.width * ratio, compo.height * ratio);
      text.fontSize = compo.height * ratio * (100 / 121);
      text.characters = textContents;
      frame.appendChild(text);
    }
  });

  return frame;
}

/**
 * Run the Plugin.
 * 1. Get data of selected node.
 * 2. Check if the node is image and its size.
 * 3. Call getResultFromServer() to get JSON of design information.
 * 4. Call drawResult() to draw it on the User page/
 * (5. Move viewport)
 */
async function runPlugin(): Promise<ResultFrame> {
  const results = [];

  const { selection } = figma.currentPage;
  const totalRun = selection.length;
  let successRun = 0;
  if (totalRun === 0) {
    const message = "Please select one or more screenshots.";
    throw new Error(message);
  }

  if (totalRun > IMAGE_NUM_LIMIT) {
    const message = "We support up to 10 screenshots at once.";
    throw new Error(message);
  }

  for (const selected of selection) {
    try {
      const { runResponsePromise, imageInfo } = await getResultFromServer(
        selected
      );
      const runResponse = await runResponsePromise;
      const elements = (await runResponse.json())
        .replace(/'/g, '"')
        .replace(/\(/g, "[")
        .replace(/\)/g, "]");

      const newFrame = drawResult(JSON.parse(elements), imageInfo);
      results.push(newFrame);
      successRun += 1;
    } catch (error) {
      const err = error as KnownError;
      const message = err.message || "Unknown Error.";
      console.log(error);
      figma.notify(message);
    }
  }

  return { results, successRun, totalRun };
}

async function main() {
  if (figma.command === "set-api") {
    /**
     * For Set API Key command,
     * 1. Show the API Key setting page, with the link to the website.
     * 2. Check the API Key and Store it into the Client Storage.
     */
    figma.showUI(__uiFiles__.setApi);
    figma.ui.resize(300, 300);
  } else {
    /**
     * For Run command,
     * 1. Get the API Key from client storage.
     * 2. If it exists, send the api key to server for checking.
     * 3. If it is valid, run the model.
     */

    const apiKey = await figma.clientStorage.getAsync("apiKey");

    if (!apiKey) {
      const message = "Set API Key first.";
      figma.closePlugin(message);
    }

    const headers = {
      apikey: apiKey,
    };
    const authResponse = await fetch(`${SERVER}/auth/check`, {
      method: "GET",
      headers,
    }).catch((error) => {
      console.log(error);
    });
    if (!authResponse) {
      const message = "No server responses.";
      figma.closePlugin(message);
      return;
    }

    if (authResponse.status === 200) {
      // Run plugin if the auth result is 200
      try {
        await figma.loadFontAsync({ family: "Inter", style: "Regular" });

        const { results, successRun, totalRun } = await runPlugin();
        figma.currentPage.selection = results;
        figma.viewport.scrollAndZoomIntoView(results);

        const message = `Completed ${successRun} images out of ${totalRun}.`;
        figma.closePlugin(message);
      } catch (error) {
        const err = error as KnownError;
        const { message } = err;
        figma.closePlugin(message);
      }
    } else if (authResponse.status === 401) {
      const message = "Expired or wrong API Key. Set another API Key.";
      figma.closePlugin(message);
    } else {
      const message = "Unknown Authentication Error.";
      figma.closePlugin(message);
    }
  }

  figma.ui.onmessage = async (msg) => {
    if (msg.type === "api_save") {
      /**
       * Activate API Key.
       */
      const { apiKey } = msg;
      if (!apiKey) {
        const message = "API Key is empty.";
        figma.notify(message);
        return;
      }

      const headers = {
        apikey: apiKey,
      };

      const authResponse = await fetch(`${SERVER}/auth/activate`, {
        method: "POST",
        headers,
      }).catch((error) => {
        console.log(error);
      });
      if (!authResponse) {
        const message = "No server responses.";
        figma.closePlugin(message);
        return;
      }

      if (authResponse.status === 200) {
        figma.clientStorage
          .setAsync("apiKey", apiKey)
          .then(() => {
            const message = "API Key was saved.";
            figma.closePlugin(message);
          })
          .catch((error) => {
            console.log(error);
            const message =
              "Couldn't save API Key. Please clear the browser cache and try it again.";
            figma.notify(message);
            return;
          });
      } else if (authResponse.status === 401) {
        const message = "Expired or wrong API Key. Set another API Key.";
        figma.notify(message);
        return;
      } else {
        const message = "Unknown Authentication Error.";
        figma.closePlugin(message);
      }
    }

    if (msg.type === "cancel") {
      /**
       * Cancel the plugin.
       */
      figma.closePlugin();
    }
  };
}

main();
