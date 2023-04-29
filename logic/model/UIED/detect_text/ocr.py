import cv2
import os
import requests
import json
from base64 import b64encode
import time


def Google_OCR_makeImageData(imgpath):
    with open(imgpath, 'rb') as f:
        ctxt = b64encode(f.read()).decode()
        # ctxt = b64encode(f.read())
        img_req = {
            'image': {
                'content': ctxt
            },
            'features': [{
                'type': 'DOCUMENT_TEXT_DETECTION',
                # 'type': 'TEXT_DETECTION',
                'maxResults': 1
            }]
        }
    return {"requests": [img_req]}

def ocr_detection_google(imgpath):
    url = 'https://vision.googleapis.com/v1/images:annotate'
    api_key = os.environ['GOOGLE_CLOUD_API_KEY']
    imgdata = Google_OCR_makeImageData(imgpath)
    
    response = requests.post(url,
                             json=imgdata,
                             params={'key': api_key},
                             headers={'Content_Type': 'application/json'})

    if 'responses' not in response.json():
        raise Exception(response.json())
    if response.json()['responses'] == [{}]:
        return None
    else:
        return response.json()['responses'][0]['textAnnotations'][1:]
