import { IMAGE_NUM_LIMIT, SERVER, TOAST_MESSAGES } from "./common";
import runConverting from "./run-converting";
import sendStatData from "./send-stat-data";
import sendUserData from "./send-user-data";

type userData = {
  email: string;
  companyName: string;
  companySize: string;
  role: string;
  usage: string;
  careerStage: string;
};

async function main() {
  figma.showUI(__uiFiles__.enroll, { width: 525, height: 420 });
  const userData: userData = await figma.clientStorage.getAsync("userData");
  figma.ui.postMessage(userData);

  let successRun = 0;
  let totalRun = 0;
  const resultFrames: FrameNode[] = [];

  figma.ui.onmessage = async (msg) => {
    switch (msg.type) {
      /**
       * Enrollment
       * 1. save userData to clientStorage
       * 2. fetch userData and get apiKey
       * 3. send apiKey to the view
       */
      case "enroll": {
        const { userData } = msg;
        await figma.clientStorage.setAsync("userData", userData);

        const response = await fetch(`${SERVER}/auth`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userData),
        }).catch((error) => {
          console.error(error);
        });

        if (!response || response.status > 299) {
          figma.notify(TOAST_MESSAGES.ERR_SERVER);
        }

        figma.showUI(__uiFiles__.beforeConvert, { width: 320, height: 440 });
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
          figma.notify(TOAST_MESSAGES.ERR_EMPTY_SCREENSHOTS);
          return;
        }

        if (selection.length > IMAGE_NUM_LIMIT) {
          figma.notify(TOAST_MESSAGES.ERR_TOO_MANY_SCREENSHOTS);
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

        figma.notify(
          TOAST_MESSAGES.MSG_COMPLETE_CONVERTING(successRun, totalRun)
        );
        figma.showUI(__uiFiles__.afterConvert);
        figma.ui.resize(460, 350);

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
        figma.notify(TOAST_MESSAGES.MSG_ClOSE);

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
