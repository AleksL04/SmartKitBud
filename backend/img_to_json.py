import json

from google import genai
from google.genai import types

_GEMINI_INSTRUCTION = """
Extract all individual item entries from the receipt. Respond only with a JSON array. Each item object must have "name" (string), "price" (number), "quantity" (number), and "unit" (string).

Specific instructions for items with quantities by weight or volume:
- Identify any numerical value directly followed by a unit of weight (e.g., "LB", "lb", "LBS", "KG", "kg", "GR", "gr", "G", "g", "OZ", "oz") or volume (e.g., "ML", "ml", "L", "l", "GAL", "gal", "ea", "ct").
- If such a specific quantity and unit are indicated for an item (e.g., "1.5 LB Pickles", "440GR Bread", "12 OZ Soda", "500G Coffee"), set the `quantity` field to the numerical value of that amount (e.g., 1.5, 440, 12, 500).
- Extract the detected unit (e.g., "LB", "GR", "OZ", "g", "ml") and place it into the "unit" field. Do NOT append the unit to the "name" in this case.
- For items that are discrete units (e.g., "Milk", "Bread") or where no specific unit of measure is listed (e.g., "by LB" without a specific weight), the "unit" field should be an empty string ("").
- The `price` should always be the total price for that item line.
- If an item is marked "by unit" (e.g., "by LB", "by KG", "by OZ") but no specific amount is listed, set the `quantity` to 1 and the "unit" field to the corresponding unit (e.g., "lb", "oz").

Example output:
[
  {
    "name": "Milk",
    "price": 3.49,
    "quantity": 1,
    "unit": ""
  },
  {
    "name": "Bread (Wheat)",
    "price": 2.99,
    "quantity": 2,
    "unit": ""
  },
  {
    "name": "Pickles",
    "price": 4.12,
    "quantity": 1.5,
    "unit": "lb"
  },
  {
    "name": "Bread Lvovsky",
    "price": 3.69,
    "quantity": 440,
    "unit": "gr"
  },
  {
    "name": "Coca-Cola",
    "price": 1.99,
    "quantity": 12,
    "unit": "oz"
  },
  {
    "name": "Coffee",
    "price": 8.50,
    "quantity": 500,
    "unit": "g"
  },
  {
    "name": "Salads Mushroom Carrot",
    "price": 6.22,
    "quantity": 1,
    "unit": "lb"
  },
  {
    "name": "Candy",
    "price": 3.00,
    "quantity": 1,
    "unit": "oz"
  }
]
Do not include any additional text or markdown quotes. If no items are found, return an empty array [].
"""

def _call_gemini_api_from_img(image_bytes, api_key = ""):
    client = genai.Client(api_key=api_key)

    response = client.models.generate_content(
        model="gemini-2.5-flash", contents=[_GEMINI_INSTRUCTION,types.Part.from_bytes(
        data=image_bytes,
        mime_type='image/jpeg',
      )],
        config=types.GenerateContentConfig(
            thinking_config=types.ThinkingConfig(thinking_budget=0), # Disables thinking
            temperature=0
        ),
    )
    return response.text

def process_image_to_receipt_json(image_filepath: str,gemini_api_key: str):
    try:
        with open(image_filepath, 'rb') as f:
            image_bytes = f.read()
    except FileNotFoundError:
        print(f"Error: Image file not found at {image_filepath}. Please ensure the path is correct.")
        exit()

    gemini_output_raw = _call_gemini_api_from_img(image_bytes, gemini_api_key)
    python_dict = json.loads(gemini_output_raw)
    return python_dict