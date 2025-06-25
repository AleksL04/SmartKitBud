import json

from google import genai
from google.genai import types

_GEMINI_INSTRUCTION = """
Please review the provided JSON array of receipt items for any spelling errors or inconsistencies. Apply the following corrections and standardizations:

1.  **Name Standardization:** Convert all item names to lowercase.
2.  **Unit and Quantity Correction:**
    * **Detect and Correct Misparsed Units/Quantities:** Thoroughly re-evaluate each item's `name` string to identify any **numerical values or common unit abbreviations** that might have been incorrectly parsed or left within the `name` field during the initial extraction.
    * **Extract and Move:** If a numerical quantity and a standard unit (e.g., "lb", "kg", "gr", "g", "oz", "ml", "l", "ea", "ct") are found within the `name`, extract the numerical value and move it to the `quantity` field. Move the corresponding unit to the `unit` field.
    * **Remove from Name:** After extraction, ensure these quantities and units are **removed from the `name` field**.
    * **Handle Common OCR/Typo Errors:** For known patterns like "44DGR", interpret 'D' as '0' and correct it to '440GR' or '440gr', then extract '440' to `quantity` and 'gr' to `unit`. Apply similar logic for other common OCR errors.
    * **Standardize Unit Abbreviations:** Convert all units to their most common lowercase abbreviation (e.g., "LBS" -> "lb", "KG" -> "kg", "GR" -> "gr", "OZ" -> "oz", "ML" -> "ml", "CT" -> "ct").
    * **Default for Discrete Items:** If an item's `name` clearly indicates a discrete item (e.g., "milk", "bread") and no specific weight/volume is found, ensure `quantity` is set to 1 and `unit` is an empty string ("").
    * **Handle "by unit" without amount:** If the name implies a unit (e.g., "by LB", "per kg") but no specific amount is found, set `quantity` to 1 and the `unit` field to the corresponding unit (e.g., "lb", "kg").
    * **Preserve Existing Correct Values:** If `quantity` and `unit` are already correctly populated and consistent with the `name`, leave them as is.

Maintain the exact JSON structure. Respond only with a JSON array. Do not include any additional text or markdown quotes. If no items are found, return an empty array [].
"""

def format_json_to_lowercase(raw_json_string: str, api_key: str):
    client = genai.Client(api_key=api_key)

    response = client.models.generate_content(
        model="gemini-2.5-flash", contents=[raw_json_string, _GEMINI_INSTRUCTION],
        config=types.GenerateContentConfig(
            thinking_config=types.ThinkingConfig(thinking_budget=0), # Disables thinking
            temperature=0
        ),
    )
    python_dict = json.loads(response.text)
    return python_dict