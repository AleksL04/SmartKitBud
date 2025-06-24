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
#test_file = ocr_space_file(filename=file_path,api_key=OCR_API_KEY)
#json_response = json.loads(test_file)
#extracted_text = json_response['ParsedResults'][0]['ParsedText']
extracted_text = """
RECEIPT
1x Chicken Soup
2x Tomato Soup
1x Crispy Chicken
1x Mineral Water
2x Ice Tea
1x Lemon Juice
1x Mango Juice
TOTAL AMOUNT
CASH
CHANGE
$ 45.00
S
15.00
30.00
1.00
$
S
3.00
7.00
7.00
$108.00
$200.00
$ 92.00
THANK YOU
- —
"""

instruction = """
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

response = client.models.generate_content(
    model="gemini-2.5-flash", contents=[instruction,extracted_text],
    config=types.GenerateContentConfig(
        thinking_config=types.ThinkingConfig(thinking_budget=0), # Disables thinking
        temperature=0
    ),
)
python_dict = json.loads(response.text)
print(python_dict)
