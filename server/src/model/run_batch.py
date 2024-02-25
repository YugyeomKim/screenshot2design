from os.path import join as pjoin
import cv2

# from cnn.CNN import CNN
import model.detect_text.text_detection as text
import model.detect_compo.ip_region_proposal as ip
import model.detect_merge.merge as merge


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

    # compo_classifier = CNN()

    result_list = []

    for image_name in image_names:
        input_image = pjoin(input_root, image_name + ".jpg")
        resized_height = resize_height_by_longest_edge(input_image)

        ocr_path = text.text_detection(input_image, output_root, image_name)

        compo_path = ip.compo_detection(
            input_image,
            output_root,
            key_params,
            resize_by_height=resized_height,
        )

        result = merge.merge(
            input_image,
            compo_path,
            ocr_path,
            output_root,
            is_remove_topbar=key_params["remove-top-bar"],
        )

        result_list.append(result)

    return result_list
