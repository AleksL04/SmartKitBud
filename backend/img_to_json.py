import requests
import json
import os
import sys

from google import genai
from google.genai import types

def ocr_space_file(filename, overlay=False, api_key='helloworld', language='eng'):
    """ OCR.space API request with local file.
        Python3.5 - not tested on 2.7
    :param filename: Your file path & name.
    :param overlay: Is OCR.space overlay required in your response.
                    Defaults to False.
    :param api_key: OCR.space API key.
                    Defaults to 'helloworld'.
    :param language: Language code to be used in OCR.
                    List of available language codes can be found on https://ocr.space/OCRAPI
                    Defaults to 'en'.
    :return: Result in JSON format.
    """

    payload = {'isOverlayRequired': overlay,
               'apikey': api_key,
               'language': language,
               }
    with open(filename, 'rb') as f:
        r = requests.post('https://api.ocr.space/parse/image',
                          files={filename: f},
                          data=payload,
                          )
    return r.content.decode()

if len(sys.argv) > 1:
    file_path = sys.argv[1]
else:
    print("Usage: python my_script.py <file_path>")

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
client = genai.Client(api_key=GEMINI_API_KEY)
OCR_API_KEY = os.environ.get("OCR_API_KEY")

#'processed_receipts/test2_2_processed.jpg'
test_file = ocr_space_file(filename=file_path,api_key=OCR_API_KEY)
json_response = json.loads(test_file)
extracted_text = json_response['ParsedResults'][0]['ParsedText']

promt1 = "Extract reciept entries in valid JSON only. Do not include any explanation or extra text. Each item should have: name (string), price (number), quantity (number)"

response = client.models.generate_content(
    model="gemini-2.5-flash", contents=[promt1,extracted_text],
    config=types.GenerateContentConfig(
        thinking_config=types.ThinkingConfig(thinking_budget=0) # Disables thinking
    ),
)
python_dict = json.loads(response.text)
print(python_dict)
