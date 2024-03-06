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
  offset?: { offsetX: number; offsetY: number };
};

const drawRecognizedImage = ({
  recognizedImage,
  selected,
  offset,
}: DrawRecognizedImageParams) => {
  const { width, height, x, y, name } = selected;
  const {
    img_shape: [resizedWidth, resizedHeight, _],
    compos,
  } = recognizedImage;
  const ratio = height / resizedHeight;

  const { offsetX, offsetY } = offset ?? { offsetX: 0, offsetY: 0 };

  const frame = figma.createFrame();
  frame.name = name;
  frame.x = x + 30 + offsetX;
  frame.y = y + offsetY;
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

const getOffset = (nodes: readonly SceneNode[]) => {
  let minX = Infinity;
  let maxX = -Infinity;

  nodes.forEach((node) => {
    if (node.x < minX) {
      minX = node.x;
    }
    if (node.x + node.width > maxX) {
      maxX = node.x + node.width;
    }
  });

  return { offsetX: maxX - minX, offsetY: 0 };
};

/**
 * Draw the converting result on the user screen
 */
const drawResult = ({
  recognitionDataList,
  selection,
}: DrawResultParams): FrameNode[] => {
  const offset = getOffset(selection);
  const resultFrames = recognitionDataList.map((recognizedImage, index) =>
    drawRecognizedImage({
      recognizedImage,
      selected: selection[index],
      offset,
    })
  );

  return resultFrames;
};

export default drawResult;
