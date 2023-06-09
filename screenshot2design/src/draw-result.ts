import { Elements, ImageInfo } from "./common";
/**
 * Draw the converting result on the user screen
 */
function drawResult(elements: Elements, imageInfo: ImageInfo): FrameNode {
  const { width, height, x, y, imageHash, name } = imageInfo;
  const {
    img_shape: [resizedHeight, resizedWidth, _],
    compos,
  } = elements;
  const ratio = height / resizedHeight;

  const frame = figma.createFrame();
  frame.name = name;
  frame.x = x + width + 30;
  frame.y = y;
  frame.resize(width, height);
  frame.fills = [
    {
      type: "IMAGE",
      imageHash,
      scaleMode: "FILL",
      opacity: 0.5,
    },
  ];

  compos.map((compo) => {
    if (compo.class === "Compo") {
      const rectangle = figma.createRectangle();
      rectangle.name = `${name} - ${compo.id}`;
      rectangle.x = compo.position.column_min * ratio;
      rectangle.y = compo.position.row_min * ratio;
      rectangle.resize(compo.width * ratio, compo.height * ratio);
      rectangle.fills = [
        {
          type: "SOLID",
          color: {
            r: 0 / 255,
            g: 0 / 255,
            b: 0 / 255,
          },
          opacity: 0.2,
        },
      ];
      rectangle.strokes = [
        {
          type: "SOLID",
          color: {
            r: 0 / 255,
            g: 0 / 255,
            b: 0 / 255,
          },
        },
      ];
      frame.appendChild(rectangle);
    } else if (compo.class === "Text") {
      const text = figma.createText();
      let textContents = "Placeholder";
      if (compo.text_content) {
        textContents = compo.text_content;
      }
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
}

export default drawResult;
