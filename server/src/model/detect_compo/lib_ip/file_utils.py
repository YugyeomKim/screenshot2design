import os
import json
from os.path import join as pjoin
import cv2


def save_corners_json(file_path, compos, img_shape):
    output = {"img_shape": img_shape, "compos": []}
    f_out = open(file_path, "w")

    for compo in compos:
        c = {"id": compo.id, "class": compo.category}
        (c["column_min"], c["row_min"], c["column_max"], c["row_max"]) = (
            compo.put_bbox()
        )

        c["column_max"] += 1
        c["row_max"] += 1

        c["width"] = compo.width
        c["height"] = compo.height
        output["compos"].append(c)

    json.dump(output, f_out, indent=4)

    return file_path


def save_clipping(org, output_root, corners, compo_classes, compo_index):
    if not os.path.exists(output_root):
        os.mkdir(output_root)
    pad = 2
    for i in range(len(corners)):
        compo = compo_classes[i]
        (up_left, bottom_right) = corners[i]
        (col_min, row_min) = up_left
        (col_max, row_max) = bottom_right
        col_min = max(col_min - pad, 0)
        col_max = min(col_max + pad, org.shape[1])
        row_min = max(row_min - pad, 0)
        row_max = min(row_max + pad, org.shape[0])

        # if component type already exists, index increase by 1, otherwise add this type
        compo_path = pjoin(output_root, compo)
        if compo_classes[i] not in compo_index:
            compo_index[compo_classes[i]] = 0
            if not os.path.exists(compo_path):
                os.mkdir(compo_path)
        else:
            compo_index[compo_classes[i]] += 1
        clip = org[row_min:row_max, col_min:col_max]
        cv2.imwrite(
            pjoin(compo_path, str(compo_index[compo_classes[i]]) + ".png"), clip
        )


def build_directory(directory):
    if not os.path.exists(directory):
        os.mkdir(directory)
    return directory
