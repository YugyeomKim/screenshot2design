import { IMAGE_NUM_LIMIT, SERVER, TOAST_MESSAGES } from "./common";
import runConverting from "./run-converting";
import { sendStatData, sendUserData } from "./send-data";

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

      case "send-user-data": {
        const { userData } = msg;
        sendUserData(userData);
        return;
      }

      case "convert": {
        const { selection } = figma.currentPage;

        totalRun = selection.length;

        if (totalRun === 0) {
          figma.notify(TOAST_MESSAGES.ERR_EMPTY_SCREENSHOTS);
          return;
        }

        if (totalRun > IMAGE_NUM_LIMIT) {
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
            // TODO: Show the result at the last page
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

      case "cancel": {
        figma.showUI(__uiFiles__.cancel);
        figma.ui.resize(400, 115);

        return;
      }

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
