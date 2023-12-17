from os.path import join as pjoin
import cv2

from cnn.CNN import CNN
import detect_text.text_detection as text
import detect_compo.ip_region_proposal as ip
import detect_merge.merge as merge


def resize_height_by_longest_edge(img_path, resize_length=800):
    org = cv2.imread(img_path)
    height, width = org.shape[:2]
    if height > width:
        return resize_length
    else:
        return int(resize_length * (height / width))


def run_batch(image_names, input_root="./buffer/input", output_root="./buffer/output"):
    # initialization
    key_params = {
        "min-grad": 10,
        "ffl-block": 5,
        "min-ele-area": 50,
        "merge-contained-ele": True,
        "max-word-inline-gap": 10,
        "max-line-ingraph-gap": 4,
        "remove-top-bar": True,
    }

    # Load deep learning models in advance
    compo_classifier = CNN()

    # set the range of target inputs' indices
    num = 0
    for image_name in image_names:
        input_image = pjoin(input_root, image_name + ".jpg")
        resized_height = resize_height_by_longest_edge(input_image)

        text.text_detection(input_image, output_root)

        ip.compo_detection(
            input_image,
            output_root,
            key_params,
            classifier=compo_classifier,
            resize_by_height=resized_height,
            show=False,
        )

        compo_path = pjoin(output_root, "ip", image_name + ".json")
        ocr_path = pjoin(output_root, "ocr", image_name + ".json")
        merge.merge(
            input_image,
            compo_path,
            ocr_path,
            output_root,
            is_remove_top=key_params["remove-top-bar"],
            show=True,
        )

        num += 1
