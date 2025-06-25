import json

from google import genai
from google.genai import types

_GEMINI_INSTRUCTION = """
Please review the item names in the provided JSON array for any spelling errors or inconsistencies, especially regarding product weights and units, and correct them. 
Additionally, convert all item names to lowercase. 
Ensure that numerical values and their associated units are accurately represented (e.g., '44DGR' should be interpreted as '440gr' if 'D' represents '0' in this context). 
Maintain the exact JSON structure. 
Respond only with a JSON array. Do not include any additional text or markdown quotes. If no items are found, return an empty array [].
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