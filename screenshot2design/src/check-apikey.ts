import {
  SERVER,
  ERR_SERVER,
  ERR_WRONG_APIKEY,
  ERR_AUTH_UNKNOWN,
} from "./common";

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
    figma.notify(ERR_SERVER);
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
      figma.notify(ERR_WRONG_APIKEY);
      return false;

    default:
      figma.notify(ERR_AUTH_UNKNOWN);
      return false;
  }
};

export default checkApikey;
