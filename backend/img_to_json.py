import requests
import json

from google import genai
from google.genai import types

_GEMINI_INSTRUCTION = """
Extract all individual item entries from the receipt. Respond only with a JSON array. Each item object must have "name" (string), "price" (number), and "quantity" (number).
Example output:
[
  {
    "name": "Milk (1 Gallon)",
    "price": 3.49,
    "quantity": 1
  },
  {
    "name": "Bread (Wheat)",
    "price": 2.99,
    "quantity": 2
  }
]
Do not include any additional text or markdown quotes. If no items are found, return an empty array [].
"""

def _call_ocr_space_api(filename, overlay=False, api_key='helloworld', language='eng'):
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

def _call_gemini_api(extracted_text = "", api_key = ""):
    client = genai.Client(api_key=api_key)

    response = client.models.generate_content(
        model="gemini-2.5-flash", contents=[_GEMINI_INSTRUCTION,extracted_text],
        config=types.GenerateContentConfig(
            thinking_config=types.ThinkingConfig(thinking_budget=0), # Disables thinking
            temperature=0
        ),
    )
    return response.text

def process_image_to_receipt_json(
    image_filepath: str,
    ocr_api_key: str,
    gemini_api_key: str
):
    ocr_response_raw = _call_ocr_space_api(filename=image_filepath, api_key=ocr_api_key)
    json_response = json.loads(ocr_response_raw)

    extracted_text = json_response['ParsedResults'][0]['ParsedText']

    gemini_output_raw = _call_gemini_api(extracted_text, gemini_api_key)
    python_dict = json.loads(gemini_output_raw)
    print(python_dict)