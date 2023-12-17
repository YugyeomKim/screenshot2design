from os.path import join as pjoin
import cv2
import os
import sys


def resize_height_by_longest_edge(img_path, resize_length=800):
    org = cv2.imread(img_path)
    height, width = org.shape[:2]
    if height > width:
        return resize_length
    else:
        return int(resize_length * (height / width))


if __name__ == "__main__":
    key_params = {
        "min-grad": 10,
        "ffl-block": 5,
        "min-ele-area": 50,
        "merge-contained-ele": True,
        "merge-line-to-paragraph": False,
        "remove-bar": True,
    }

    # set input image path
    input_path_img = sys.argv[1]
    output_root = sys.argv[2]

    resized_height = resize_height_by_longest_edge(input_path_img, resize_length=800)

    is_ip = True
    is_ocr = True
    is_merge = True

    if is_ocr:
        import detect_text.text_detection as text

        os.makedirs(pjoin(output_root, "ocr"), exist_ok=True)
        text.text_detection(input_path_img, output_root, method="google")

    if is_ip:
        import detect_compo.ip_region_proposal as ip

        os.makedirs(pjoin(output_root, "ip"), exist_ok=True)
        ip.compo_detection(
            input_path_img, output_root, key_params, resize_by_height=resized_height
        )

    if is_merge:
        import detect_merge.merge as merge

        os.makedirs(pjoin(output_root, "merge"), exist_ok=True)
        name = input_path_img.split("/")[-1][:-4]
        compo_path = pjoin(output_root, "ip", str(name) + ".json")
        ocr_path = pjoin(output_root, "ocr", str(name) + ".json")
        merge.merge(
            input_path_img,
            compo_path,
            ocr_path,
            pjoin(output_root, "merge"),
            is_remove_bar=key_params["remove-bar"],
            is_paragraph=key_params["merge-line-to-paragraph"],
        )
