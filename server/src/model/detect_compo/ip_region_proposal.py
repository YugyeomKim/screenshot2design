from os.path import join as pjoin

import model.detect_compo.lib_ip.ip_preprocessing as pre
import model.detect_compo.lib_ip.ip_draw as draw
import model.detect_compo.lib_ip.ip_detection as det
import model.detect_compo.lib_ip.file_utils as file
import model.detect_compo.lib_ip.Component as Compo
from model.config.CONFIG_UIED import Config

C = Config()


def debug(output, file_path="model/UIED/logs"):
    f = open(file_path, "a")
    f.write(str(output) + "\n")
    f.close()


def nesting_inspection(org, grey, compos, ffl_block):
    """
    Inspect all big compos through block division by flood-fill
    :param ffl_block: gradient threshold for flood-fill
    :return: nesting compos
    """
    nesting_compos = []
    for i, compo in enumerate(compos):
        if compo.height > 50:
            replace = False
            clip_grey = compo.compo_clipping(grey)
            n_compos = det.nested_components_detection(
                clip_grey, org, grad_thresh=ffl_block, show=False
            )
            Compo.cvt_compos_relative_pos(
                n_compos, compo.bbox.col_min, compo.bbox.row_min
            )

            for n_compo in n_compos:
                if n_compo.redundant:
                    compos[i] = n_compo
                    replace = True
                    break
            if not replace:
                nesting_compos += n_compos
    return nesting_compos


def compo_detection(input_img_path, output_root, uied_params, resize_by_height=800):
    name = (
        input_img_path.split("/")[-1][:-4]
        if "/" in input_img_path
        else input_img_path.split("\\")[-1][:-4]
    )
    ip_root = file.build_directory(pjoin(output_root, "ip"))

    # *** Step 1 *** pre-processing: read img -> get binary map
    org, grey = pre.read_img(input_img_path, resize_by_height)
    binary = pre.binarization(org, grad_min=int(uied_params["min-grad"]))

    # *** Step 2 *** element detection
    det.rm_line(binary)
    uicompos = det.component_detection(
        binary, min_obj_area=int(uied_params["min-ele-area"])
    )

    # *** Step 3 *** results refinement
    uicompos = det.compo_filter(
        uicompos, min_area=int(uied_params["min-ele-area"]), img_shape=binary.shape
    )
    uicompos = det.merge_intersected_compos(uicompos)
    det.compo_block_recognition(binary, uicompos)
    if uied_params["merge-contained-ele"]:
        uicompos = det.rm_contained_compos_not_in_block(uicompos)
    Compo.compos_update(uicompos, org.shape)
    Compo.compos_containment(uicompos)

    # *** Step 4 ** nesting inspection: check if big compos have nesting element
    uicompos += nesting_inspection(
        org, grey, uicompos, ffl_block=uied_params["ffl-block"]
    )
    Compo.compos_update(uicompos, org.shape)
    draw.draw_bounding_box(
        org, uicompos, name="merged compo", write_path=pjoin(ip_root, name + ".jpg")
    )

    # *** Step 7 *** save detection result
    Compo.compos_update(uicompos, org.shape)
    file.save_corners_json(pjoin(ip_root, name + ".json"), uicompos, org.shape)
