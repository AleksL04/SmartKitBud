import os
import json
from google import genai
from google.genai import types

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
client = genai.Client(api_key=GEMINI_API_KEY)

cpp_output_file = "output_from_cpp.txt"
with open(cpp_output_file, "r", encoding = "utf-8") as file:
    string_obj = file.read()

promt = "Extract the reciept items in json format with name price and quantity, no markdown quotes"

response = client.models.generate_content(
    model="gemini-2.5-flash", contents=[promt,string_obj],
    config=types.GenerateContentConfig(
        thinking_config=types.ThinkingConfig(thinking_budget=0) # Disables thinking
    ),
)
python_dict = json.loads(response.text)
print(python_dict)
