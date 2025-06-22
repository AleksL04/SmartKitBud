import requests
import json
import os

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

test_file = ocr_space_file(filename='img/test1.jpg', language='eng', api_key='K87199939888957')
json_response = json.loads(test_file)
extracted_text = json_response['ParsedResults'][0]['ParsedText']

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
client = genai.Client(api_key=GEMINI_API_KEY)

cpp_output_file = "output_from_cpp.txt"
with open(cpp_output_file, "r", encoding = "utf-8") as file:
    string_obj = file.read()

promt = "Extract the reciept items in json format with name price and quantity, no markdown quotes, do your best to correct product names"

response = client.models.generate_content(
    model="gemini-2.5-flash", contents=[promt,string_obj],
    config=types.GenerateContentConfig(
        thinking_config=types.ThinkingConfig(thinking_budget=0) # Disables thinking
    ),
)
python_dict = json.loads(response.text)
print(python_dict)
