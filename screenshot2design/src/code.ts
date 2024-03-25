import { IMAGE_NUM_LIMIT, SERVER, TOAST_MESSAGES } from "./common";
import runConverting from "./run-converting";
import { sendUserData } from "./send-data";

type userData = {
  email: string;
  companyName: string;
  companySize: string;
  role: string;
  usage: string;
  careerStage: string;
};

async function main() {
  figma.showUI(__uiFiles__.enroll, { width: 300, height: 190 });
  const userData: userData = await figma.clientStorage.getAsync("userData");
  figma.ui.postMessage(userData);

  figma.ui.onmessage = async (msg) => {
    switch (msg.type) {
      case "convert": {
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

        if (!response) {
          figma.notify(TOAST_MESSAGES.ERR_SERVER);
          return;
        }

        if (response.status === 401) {
          figma.notify("인증 키가 올바르지 않습니다.");
          return;
        }

        if (response.status > 299) {
          figma.notify(TOAST_MESSAGES.ERR_SERVER);
          return;
        }

        const { selection } = figma.currentPage;
        const totalRun = selection.length;

        if (totalRun === 0) {
          figma.notify(TOAST_MESSAGES.ERR_EMPTY_SCREENSHOTS);
          return;
        }

        if (totalRun > IMAGE_NUM_LIMIT) {
          figma.notify(TOAST_MESSAGES.ERR_TOO_MANY_SCREENSHOTS);
          return;
        }

        figma.showUI(__uiFiles__.interConvert, { width: 300, height: 190 });

        await figma.loadFontAsync({ family: "Inter", style: "Regular" });

        const resultFrames = await runConverting(selection);
        figma.currentPage.selection = resultFrames;
        figma.viewport.scrollAndZoomIntoView(resultFrames);

        figma.notify("완료되었습니다.");
        figma.closePlugin();

        return;
      }

      case "send-user-data": {
        const { userData } = msg;
        sendUserData(userData);
        return;
      }

      case "notify": {
        figma.notify(msg.message);
        return;
      }

      default: {
        return;
      }
    }
  };
}

main();
