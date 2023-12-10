import { SERVER, TOAST_MESSAGES } from "./common";

const checkApikey = async (apiKey: string) => {
  /** Request server for authorizing */
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
    figma.notify(TOAST_MESSAGES.ERR_SERVER);
    return false;
  }

  /**
   * 200: authorized. Save api key to the clientStorage and return true.
   * 401: unauthorized. Notify message.
   */
  switch (authResponse.status) {
    case 200:
      return true;

    case 401:
      figma.notify(TOAST_MESSAGES.ERR_WRONG_APIKEY);
      return false;

    default:
      figma.notify(TOAST_MESSAGES.ERR_AUTH_UNKNOWN);
      return false;
  }
};

export default checkApikey;
