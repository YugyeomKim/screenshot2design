import detect_text.ocr as ocr
from detect_text.Text import Text
import numpy as np
import cv2
import json
from os.path import join as pjoin
import os
from dotenv import load_dotenv

load_dotenv(verbose=True)


def save_detection_json(file_path, texts, img_shape):
    f_out = open(file_path, "w")
    output = {"img_shape": img_shape, "texts": []}
    for text in texts:
        c = {"id": text.id, "content": text.content}
        loc = text.location
        c["column_min"], c["row_min"], c["column_max"], c["row_max"] = (
            loc["left"],
            loc["top"],
            loc["right"],
            loc["bottom"],
        )
        c["width"] = text.width
        c["height"] = text.height
        output["texts"].append(c)
    json.dump(output, f_out, indent=4)


def visualize_texts(org_img, texts, write_path):
    img = org_img.copy()
    for text in texts:
        text.visualize_element(img, line=2)

    if write_path is not None:
        cv2.imwrite(write_path, img)


def text_sentences_recognition(texts):
    changed = True
    while changed:
        changed = False
        temp_set = []
        for text_a in texts:
            merged = False
            for text_b in temp_set:
                if text_a.is_on_same_line(
                    text_b,
                    "h",
                    bias_justify=0.2 * min(text_a.height, text_b.height),
                    bias_gap=2 * max(text_a.word_width, text_b.word_width),
                ):
                    text_b.merge_text(text_a)
                    merged = True
                    changed = True
                    break
            if not merged:
                temp_set.append(text_a)
        texts = temp_set.copy()

    for i, text in enumerate(texts):
        text.id = i
    return texts


def merge_intersected_texts(texts):
    changed = True
    while changed:
        changed = False
        temp_set = []
        for text_a in texts:
            merged = False
            for text_b in temp_set:
                if text_a.is_intersected(text_b, bias=2):
                    text_b.merge_text(text_a)
                    merged = True
                    changed = True
                    break
            if not merged:
                temp_set.append(text_a)
        texts = temp_set.copy()
    return texts


def text_cvt_orc_format(ocr_result):
    texts = []
    if ocr_result is not None:
        for i, result in enumerate(ocr_result):
            error = False
            x_coordinates = []
            y_coordinates = []
            text_location = result["boundingPoly"]["vertices"]
            content = result["description"]
            for loc in text_location:
                if "x" not in loc or "y" not in loc:
                    error = True
                    break
                x_coordinates.append(loc["x"])
                y_coordinates.append(loc["y"])
            if error:
                continue
            location = {
                "left": min(x_coordinates),
                "top": min(y_coordinates),
                "right": max(x_coordinates),
                "bottom": max(y_coordinates),
            }
            texts.append(Text(i, content, location))
    return texts


def text_filter_noise(texts):
    valid_texts = []
    for text in texts:
        if len(text.content) <= 1 and text.content.lower() not in [
            "a",
            ",",
            ".",
            "!",
            "?",
            "$",
            "%",
            ":",
            "&",
            "+",
        ]:
            continue
        text.content = text.content.replace("'", "").replace('"', "")
        valid_texts.append(text)
    return valid_texts


def text_detection(input_image, output_root, image_name):
    os.makedirs(pjoin(output_root, "ocr"), exist_ok=True)
    ocr_root = pjoin(output_root, "ocr")
    img = cv2.imread(input_image)

    ocr_result = ocr.ocr_detection_google(input_image)
    texts = text_cvt_orc_format(ocr_result)
    texts = merge_intersected_texts(texts)
    texts = text_filter_noise(texts)
    texts = text_sentences_recognition(texts)

    if os.getenv("FLASK_ENV") == "development":
        visualize_texts(
            img,
            texts,
            write_path=pjoin(ocr_root, image_name + ".png"),
            shown_resize_height=800,
        )

    save_detection_json(pjoin(ocr_root, image_name + ".json"), texts, img.shape)
