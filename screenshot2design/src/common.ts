// const SERVER = "https://s2dlab.click:443";
const SERVER = "http://localhost:3000";
const IMAGE_NUM_LIMIT = 10;
const IMAGE_SIZE_LIMIT = 10;

// Toast messages
const ERR_SERVER = "Server error. Sorry for the inconvenience.";

const ERR_EMPTY_FORM = "Plase fill in the entire form.";
const MSG_APIKEY_CREATED =
  "API Key has been entered automatically. Save the key for converting.";

const ERR_EMPTY_APIKEY = "API Key is empty.";
const MSG_APIKEY_SAVED = "API Key was saved.";
const ERR_WRONG_APIKEY = "Expired or wrong API Key. Set another API Key.";
const ERR_CLIENTSTORAGE_FAILED =
  "Couldn't save API Key. Please clear the browser cache and try it again.";
const ERR_AUTH_UNKNOWN = "Unknown Authentication Error.";

const ERR_EMPTY_SCREENSHOTS = "Please select one or more screenshots.";
const ERR_TOO_MANY_SCREENSHOTS = "We support up to 10 screenshots at once.";
const MSG_COMPLETE_CONVERTING = (successRun: number, totalRun: number) =>
  `Completed ${successRun} images out of ${totalRun}.`;
const ERR_NOT_IMAGE = (nodeName: string) => `Not an image: ${nodeName}`;
const ERR_IMAGE_LOAD_FAIL = (nodeName: string) =>
  `Failed to load the image: ${nodeName}`;

// Interfaces
interface Preference {
  uiFormat: string;
  uiPattern: string;
  uiSource: string;
}

interface Survey {
  pluginUsage: string;
  expectedTimeSave: string;
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

export {
  SERVER,
  IMAGE_NUM_LIMIT,
  IMAGE_SIZE_LIMIT,
  ERR_SERVER,
  ERR_EMPTY_FORM,
  MSG_APIKEY_CREATED,
  ERR_EMPTY_APIKEY,
  MSG_APIKEY_SAVED,
  ERR_WRONG_APIKEY,
  ERR_CLIENTSTORAGE_FAILED,
  ERR_AUTH_UNKNOWN,
  ERR_EMPTY_SCREENSHOTS,
  ERR_TOO_MANY_SCREENSHOTS,
  MSG_COMPLETE_CONVERTING,
  ERR_NOT_IMAGE,
  ERR_IMAGE_LOAD_FAIL,
  Preference,
  Survey,
  ProcessResult,
  Elements,
  ImageInfo,
};
