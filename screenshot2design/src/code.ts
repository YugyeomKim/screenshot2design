import {
  SERVER,
  ERR_EMPTY_FORM,
  ERR_SERVER,
  MSG_SETTING_API_KEY,
  MSG_APIKEY_CREATED,
  ERR_EMPTY_SCREENSHOTS,
  IMAGE_NUM_LIMIT,
  ERR_TOO_MANY_SCREENSHOTS,
  MSG_COMPLETE_CONVERTING,
  MSG_ClOSE,
} from "./common";
import setApiKey from "./set-apikey";
import checkApikey from "./check-apikey";
import sendUserData from "./send-user-data";
import runConverting from "./run-converting";
import sendStatData from "./send-stat-data";

/**
 * For Convert command,
 * 1. Get the API Key from client storage.
 * 2. If it exists, send the api key to server for checking.
 * 3. If it's not valid, show set-apikey view.
 * 4. If it is valid, show before-convert view.
 */
async function main() {
  const apiKey: string = await figma.clientStorage.getAsync("apiKey");

  if (!apiKey) {
    figma.showUI(__uiFiles__.setApiKey);
    figma.ui.resize(525, 500);
  } else {
    const authorized = await checkApikey(apiKey);

    if (!authorized) {
      figma.showUI(__uiFiles__.setApiKey);
      figma.ui.resize(525, 340);
    } else {
      figma.showUI(__uiFiles__.beforeConvert);
      figma.ui.resize(320, 440);
    }
  }

  let successRun = 0;
  let totalRun = 0;
  const resultFrames: FrameNode[] = [];

  figma.ui.onmessage = async (msg) => {
    switch (msg.type) {
      /**
       * Enrollment
       * 1. check if form filled
       * 2. fetch userInfo and get apiKey
       * 3. send apiKey to the view
       */
      case "enroll": {
        const { email, companyName, companySize, role, usage, careerStage } =
          msg.userInfo;

        if (
          !(email && companyName && companySize && role && usage && careerStage)
        ) {
          figma.notify(ERR_EMPTY_FORM);
          return;
        } else {
          const { userInfo } = msg;

          const response = await fetch(`${SERVER}/auth/enroll`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(userInfo),
          }).catch((error) => {
            console.error(error);
          });

          if (!response || response.status !== 200) {
            figma.notify(ERR_SERVER);
            return;
          }

          const apiKey = await response.text();

          figma.ui.postMessage(apiKey);
          figma.notify(MSG_APIKEY_CREATED);
          return;
        }
      }

      /**
       * Set API Key
       * 1. call setApiKey() to check if apiKey is valid
       * 2. if so, show before-convert view
       */
      case "set-api-key": {
        figma.notify(MSG_SETTING_API_KEY);

        const { apiKey }: { apiKey: string } = msg;
        const authorized = await setApiKey(apiKey);

        if (authorized) {
          figma.showUI(__uiFiles__.beforeConvert);
          figma.ui.resize(320, 440);
        }
        return;
      }

      /**
       * Send user data information to server
       */
      case "send-user-data": {
        const { userData } = msg;
        sendUserData(userData);
        return;
      }

      /**
       * Convert the image
       * 1. show inter-convert view
       * 2. request server to process images
       * 3. Draw the design on canvas
       * 4. Move viewport
       * 5. show after-convert view
       */
      case "convert": {
        const { selection } = figma.currentPage;

        totalRun = selection.length;

        if (selection.length === 0) {
          figma.notify(ERR_EMPTY_SCREENSHOTS);
          return;
        }

        if (selection.length > IMAGE_NUM_LIMIT) {
          figma.notify(ERR_TOO_MANY_SCREENSHOTS);
          return;
        }

        figma.showUI(__uiFiles__.interConvert);
        figma.ui.resize(500, 270);

        await figma.loadFontAsync({ family: "Inter", style: "Regular" });

        const convertingResults = await runConverting(selection);

        for (const result of convertingResults) {
          if (result.status === "fulfilled") {
            resultFrames.push(result.value);
            successRun += 1;
          } else {
            console.log(result.reason);
          }
        }

        figma.ui.postMessage("converting-finished");

        return;
      }

      case "complete-converting": {
        figma.currentPage.selection = resultFrames;
        figma.viewport.scrollAndZoomIntoView(resultFrames);

        figma.notify(MSG_COMPLETE_CONVERTING(successRun, totalRun));
        figma.showUI(__uiFiles__.afterConvert);
        figma.ui.resize(460, 250);

        return;
      }

      /**
       * Show cancel view when the user clicked Cancel button.
       */
      case "cancel": {
        figma.showUI(__uiFiles__.cancel);
        figma.ui.resize(400, 115);

        return;
      }

      /**
       * Submit the reason and close plugin.
       */
      case "submit-and-close": {
        figma.ui.hide();
        figma.notify(MSG_ClOSE);

        await sendStatData(msg.statData);

        figma.closePlugin();
      }

      case "notify": {
        figma.notify(msg.message);
        return;
      }
    }
  };
}

main();
