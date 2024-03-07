from PIL import Image, ImageFilter
import os
from io import BytesIO
import base64


def remove_bg(pil_image):
    raw_image_data = pil_image.getdata()

    # Get the top-left pixel color.
    background_color = pil_image.getpixel((0, 0))

    new_image_data = []
    for pixel in raw_image_data:
        # Change all pixels that match the background to be transparent.
        if pixel == background_color:
            new_image_data.append((255, 255, 255, 0))
        else:
            new_image_data.append(pixel)

    rgba = pil_image.convert("RGBA")
    rgba.putdata(new_image_data)
    rgba = rgba.filter(ImageFilter.MedianFilter(size=3))

    return rgba


def crop_and_remove_bg(
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

        bg_removed_image = remove_bg(cropped_image)

        byte_arr = BytesIO()
        bg_removed_image.save(byte_arr, format="PNG")
        compo["bytes"] = base64.b64encode(byte_arr.getvalue()).decode("utf-8")

    return object_info
