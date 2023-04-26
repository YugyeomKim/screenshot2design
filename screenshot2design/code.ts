const SERVER = "http://localhost:3000";
const IMAGE_NUM_LIMIT = 10;
const IMAGE_SIZE_LIMIT = 10;

interface KnownError {
  message: string;
}

interface RunCounter {
  successRun: number;
  totalRun: number;
}

/**
 * Send raw image data and get JSON result for the design elements
 * @param {SceneNode} selection
 * @param {number} index
 * @returns {Promise<void | FetchResponse>}
 */
async function getResultFromServer(
  selection: SceneNode,
  index: number
): Promise<void | FetchResponse> {
  if (
    selection.type === "RECTANGLE" &&
    Array.isArray(selection.fills) &&
    selection.fills[0].type === "IMAGE"
  ) {
    const { imageHash } = selection.fills[0];

    if (!imageHash) {
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

    console.log(image);
    const { width, height } = await image.getSizeAsync();
    const imageData = await image.getBytesAsync();

    // const { width, height } = await figma.createImage(imageData).getSizeAsync();
    const reqBody = {
      size: {
        width,
        height,
      },
      imageData,
    };
    console.log(reqBody);
    // Get server response
    try {
      const runResponse = fetch(`${SERVER}/run`, {
        method: "POST",
        body: JSON.stringify(reqBody),
      });

      return runResponse;
    } catch (error) {
      console.log(error);
      return undefined;
    }
  } else {
    // If fills is not an IMAGE.
    const message = "Please check if you selected images only.";
    throw new Error(message);
  }
}

/**
 * Get the JSON from the server response and draw it on the user screen
 * @param {undefined | void | FetchResponse} runResponse
 */
async function drawResult(runResponse: undefined | void | FetchResponse) {
  if (!runResponse) {
    // If fills is not an IMAGE.
    const message = "No server responses.";
    throw new Error(message);
  }

  const elements = await runResponse.json();
  console.log(elements);
}

/**
 * Run the Plugin.
 * 1. Get data of selected node.
 * 2. Check if the node is image and its size.
 * 3. Call getResultFromServer() to get JSON of design information.
 * 4. Call drawResult() to draw it on the User page/
 * (5. Move viewport)
 */
async function runPlugin(): Promise<RunCounter> {
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

  const serverResponsesArray = selection.map(getResultFromServer);
  serverResponsesArray.forEach(async (promise) => {
    try {
      const runResponse = await promise;
      await drawResult(runResponse);
      successRun += 1;
    } catch (error) {
      const err = error as KnownError;
      const message = err.message || "Unknown Error.";
      console.log(error);
      figma.notify(message);
    }
  });

  return { successRun, totalRun };
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
        const { successRun, totalRun } = await runPlugin();
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
