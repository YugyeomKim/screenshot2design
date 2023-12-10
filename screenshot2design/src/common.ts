// const SERVER = "https://s2dlab.click:443";
const SERVER = "http://localhost:3001";
const IMAGE_NUM_LIMIT = 10;
const IMAGE_SIZE_LIMIT = 10;

// Toast messages
const TOAST_MESSAGES = {
  ERR_SERVER: "Server error. Sorry for the inconvenience.",

  MSG_SETTING_API_KEY: "Setting API KEY",
  ERR_EMPTY_FORM: "Please fill in the entire form.",
  MSG_APIKEY_CREATED:
    "API Key has been entered automatically. Save the key for converting.",

  ERR_EMPTY_APIKEY: "API Key is empty.",
  MSG_APIKEY_SAVED: "API Key saved.",
  ERR_WRONG_APIKEY: "Expired or wrong API Key. Please set again.",
  ERR_CLIENTSTORAGE_FAILED:
    "Failed to save API Key. Please clear the browser cache and try it again.",
  ERR_AUTH_UNKNOWN: "Unknown Authentication Error.",

  ERR_EMPTY_SCREENSHOTS: "Please select one or more screenshots.",
  ERR_TOO_MANY_SCREENSHOTS: "We support up to 10 screenshots at once.",
  MSG_COMPLETE_CONVERTING: (successRun: number, totalRun: number) =>
    `Completed ${successRun} images out of ${totalRun}.`,
  ERR_NOT_IMAGE: (nodeName: string) => `Not an image: ${nodeName}`,
  ERR_IMAGE_LOAD_FAIL: (nodeName: string) =>
    `Failed to load the image: ${nodeName}`,
  ERR_TOO_LARGE_IMAGE: (nodeName: string) => `File size too large: ${nodeName}`,

  MSG_ClOSE: "Thank you.",
};

// Interfaces
interface Preference {
  uiFormat: string;
  uiSource: string;
  uiPattern: Array<string>;
}

interface Survey {
  pluginUsage: string;
  expectedTimeSave: string;
}

interface Reason {
  reason: string;
}

interface ProcessResult {
  elements: Elements;
  imageInfo: ImageInfo;
}

/** Each elements of a screenshot */
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

interface ImageInfo {
  width: number;
  height: number;
  x: number;
  y: number;
  imageHash: string;
  name: string;
}

interface StatData {
  type: String;
  payload: Object;
}

export {
  Elements,
  IMAGE_NUM_LIMIT,
  IMAGE_SIZE_LIMIT,
  ImageInfo,
  Preference,
  ProcessResult,
  Reason,
  SERVER,
  StatData,
  Survey,
  TOAST_MESSAGES,
};
