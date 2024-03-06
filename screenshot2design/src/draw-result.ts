import { RecognizedImage } from "./common";

const getImageHash = (node: SceneNode) => {
  if (
    node.type !== "RECTANGLE" ||
    !Array.isArray(node.fills) ||
    node.fills[0].type !== "IMAGE"
  ) {
    return "";
  }

  const { imageHash }: { imageHash: string } = node.fills[0];
  return imageHash;
};

type DrawRecognizedImageParams = {
  recognizedImage: RecognizedImage;
  selected: SceneNode;
};

const drawRecognizedImage = ({
  recognizedImage,
  selected,
}: DrawRecognizedImageParams) => {
  const { width, height, x, y, name } = selected;
  const {
    img_shape: [resizedWidth, resizedHeight, _],
    compos,
  } = recognizedImage;
  const ratio = height / resizedHeight;

  const frame = figma.createFrame();
  frame.name = name;
  frame.x = x + width + 30;
  frame.y = y;
  frame.resize(width, height);
  frame.fills = [
    {
      type: "IMAGE",
      imageHash: getImageHash(selected),
      scaleMode: "FILL",
      opacity: 0.5,
    },
  ];

  compos.map((compo) => {
    if (compo.class === "Compo" && compo.bytes) {
      const image = figma.createImage(figma.base64Decode(compo.bytes));

      const rectangle = figma.createRectangle();
      rectangle.name = `${name} - ${compo.id}`;
      rectangle.x = compo.position.column_min * ratio;
      rectangle.y = compo.position.row_min * ratio;
      rectangle.resize(compo.width * ratio, compo.height * ratio);
      rectangle.fills = [
        {
          type: "IMAGE",
          imageHash: image.hash,
          scaleMode: "FILL",
        },
      ];
      frame.appendChild(rectangle);
    } else if (compo.class === "Text") {
      const text = figma.createText();
      const textContents = compo.text_content ?? "LoremIpsum";
      text.name = textContents;
      text.x = compo.position.column_min * ratio;
      text.y = compo.position.row_min * ratio;
      text.resize(compo.width * ratio, compo.height * ratio);
      text.fontSize = compo.height * ratio * (100 / 121);
      text.characters = textContents;
      frame.appendChild(text);
    }
  });

  return frame;
};

type DrawResultParams = {
  recognitionDataList: RecognizedImage[];
  selection: readonly SceneNode[];
};

/**
 * Draw the converting result on the user screen
 */
const drawResult = ({
  recognitionDataList,
  selection,
}: DrawResultParams): FrameNode[] => {
  const resultFrames = recognitionDataList.map((recognizedImage, index) =>
    drawRecognizedImage({ recognizedImage, selected: selection[index] })
  );

  return resultFrames;
};

export default drawResult;
