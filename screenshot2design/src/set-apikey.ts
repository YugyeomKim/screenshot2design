import { SERVER, TOAST_MESSAGES } from "./common";

/**
 * Activate API Key.
 * Request server for authoriizing.
 * - 200: authorized. Save api key to the clientStorage and return true.
 * - 401: unauthorized. Notify message.
 */
const setApiKey = async (apiKey: string) => {
  /** Activate API Key. */
  if (!apiKey) {
    figma.notify(TOAST_MESSAGES.ERR_EMPTY_APIKEY);
    return false;
  }

  /** Request server for authorizing and activating */
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
    figma.notify(TOAST_MESSAGES.ERR_SERVER);
    return false;
  }

  /**
   * 200: authorized. Save api key to the clientStorage and return true.
   * 401: unauthorized. Notify message.
   */
  switch (authResponse.status) {
    case 200: {
      const authorized = await figma.clientStorage
        .setAsync("apiKey", apiKey)
        .then(() => {
          figma.notify(TOAST_MESSAGES.MSG_APIKEY_SAVED);
          return true;
        })
        .catch((error) => {
          console.log(error);
          figma.notify(TOAST_MESSAGES.ERR_CLIENTSTORAGE_FAILED);
          return false;
        });

      return authorized;
    }

    case 401: {
      figma.notify(TOAST_MESSAGES.ERR_WRONG_APIKEY);
      return false;
    }

    default: {
      figma.notify(TOAST_MESSAGES.ERR_AUTH_UNKNOWN);
      return false;
    }
  }
};

export default setApiKey;
