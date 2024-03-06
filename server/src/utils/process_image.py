from PIL import Image
from os.path import join
import os
from io import BytesIO
import base64


def crop_image(
    object_info,
    image_name,
    input_root,
):
    input_path = os.path.join(input_root, f"{image_name}.jpg")
    image = Image.open(input_path)

    width_ratio = image.width / object_info["img_shape"][0]
    height_ratio = image.height / object_info["img_shape"][1]
    components = object_info["compos"]

    for compo in components:
        position = compo["position"]
        column_min, row_min, column_max, row_max = (
            position["column_min"],
            position["row_min"],
            position["column_max"],
            position["row_max"],
        )

        cropped_image = image.crop(
            (
                column_min * width_ratio,
                row_min * height_ratio,
                column_max * width_ratio,
                row_max * height_ratio,
            )
        )

        byte_arr = BytesIO()
        cropped_image.save(byte_arr, format="JPEG")
        compo["bytes"] = base64.b64encode(byte_arr.getvalue()).decode("utf-8")

    return object_info
