import google.generativeai as genai
from google.generativeai import types
import json
import os

# --- Configuration and Authentication ---
try:
    genai.configure(api_key=os.environ["GEMINI_API_KEY"])
except KeyError:
    print("Please set the GEMINI_API_KEY environment variable.")
    exit()

# Define the model to use
MODEL_FLASH = "gemini-2.5-flash"

# --- 1. Define your Instructions (Prompts) ---

# Instruction for the FIRST model call (Combined OCR + Initial Extraction)
_GEMINI_INSTRUCTION_STEP1 = """
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

# Instruction for the SECOND model call (Cleaning and Correction)
_GEMINI_INSTRUCTION_STEP2 = """
Please review the provided JSON array of receipt items for any spelling errors, OCR inconsistencies, or extraneous information within the item names. Apply the following corrections and standardizations:

1.  **Name Standardization:** Convert all item names to lowercase.
2.  **General Spelling and OCR Correction in Name:**
    * **Correct common OCR errors and misspellings within the name.** Pay close attention to numbers mistaken for letters (e.g., '1' for 'i', 'k' for 'r' if visually similar), or truncated words.
        * Examples: "lvovsk1y" should become "lvovskiy", "whea" should become "wheat", "iavarmoy" should become "zavarnoy".
        * If a word appears partially or truncated (e.g., "cran"), attempt to complete it if the context strongly suggests a common full word (e.g., "cranberry").
    * **Remove any trailing numerical codes or identifiers** from the end of the `name` if they are clearly product codes and not descriptive parts of the item (e.g., "1501" from "egg dhallah 1501"). Be cautious not to remove numbers that are part of the product name (e.g., "Coca-Cola Zero").
3.  **Unit and Quantity Correction (Reiterate and Reinforce):**
    * **Detect and Correct Misparsed Units/Quantities:** Thoroughly re-evaluate each item's `name` string to identify any numerical values or common unit abbreviations that might have been incorrectly parsed or left within the `name` field during the initial extraction.
    * **Extract and Move:** If a numerical quantity and a standard unit (e.g., "lb", "kg", "gr", "g", "oz", "ml", "l", "ea", "ct") are found within the `name`, extract the numerical value and move it to the `quantity` field. Move the corresponding unit to the `unit` field.
    * **Remove from Name:** After extraction, ensure these quantities and units are removed from the `name` field.
    * **Handle Common OCR/Typo Errors in Units/Quantities:** For known patterns like "44DGR", interpret 'D' as '0' and correct it to '440gr' then extract '440' to `quantity` and 'gr' to `unit`. Apply similar logic for other common OCR errors.
    * **Standardize Unit Abbreviations:** Convert all units to their most common lowercase abbreviation (e.g., "LBS" -> "lb", "KG" -> "kg", "GR" -> "gr", "OZ" -> "oz", "ML" -> "ml", "CT" -> "ct").
    * **Default for Discrete Items:** If an item's `name` clearly indicates a discrete item (e.g., "milk", "bread") and no specific weight/volume is found, ensure `quantity` is set to 1 and `unit` is an empty string ("").
    * **Handle "by unit" without amount:** If the name implies a unit (e.g., "by LB", "per kg") but no specific amount is found, set `quantity` to 1 and the `unit` field to the corresponding unit (e.g., "lb", "kg").
    * **Preserve Existing Correct Values:** If `quantity` and `unit` are already correctly populated and consistent with the `name`, leave them as is.

Maintain the exact JSON structure. Respond only with a JSON array. Do not include any additional text or markdown quotes. If no items are found, return an empty array [].
"""

# --- Functions for API Calls ---

def call_gemini_vision_api_for_extraction(image_data: bytes):
    """
    Calls the Gemini API to perform OCR and initial item extraction directly from an image.
    Uses types.Part.from_bytes for image input.
    """
    model = genai.GenerativeModel(MODEL_FLASH)

    # Correct way to pass image data as part of contents
    contents = [
        types.Part.from_bytes(data=image_data, mime_type='image/jpeg'), # Use image/png if applicable
        _GEMINI_INSTRUCTION_STEP1
    ]

    response = model.generate_content(
        contents=contents,
        generation_config=types.GenerationConfig(
            temperature=0.0,
            response_mime_type="application/json"
        ),
        thinking_config=types.ThinkingConfig(
            thinking_budget=0
        ),
    )
    return response.text

def call_gemini_api_for_cleaning(raw_json_string: str):
    """
    Calls the Gemini API to clean and correct the previously extracted JSON data.
    """
    model = genai.GenerativeModel(MODEL_FLASH)

    response = model.generate_content(
        contents=[raw_json_string, _GEMINI_INSTRUCTION_STEP2],
        generation_config=types.GenerationConfig(
            temperature=0.0,
            response_mime_type="application/json"
        ),
        thinking_config=types.ThinkingConfig(
            thinking_budget=-1 # Enable dynamic thinking for better correction
        ),
    )
    return response.text


# --- Main Processing Function ---
def process_receipt_with_gemini(image_filepath: str):
    """
    Processes a receipt image using Gemini for both initial extraction and cleaning.
    """
    # Step 1: Load image data
    try:
        with open(image_filepath, 'rb') as f:
            image_data = f.read()
    except FileNotFoundError:
        print(f"Error: Image file not found at {image_filepath}")
        return []

    print("--- Running Step 1: Gemini OCR & Initial Extraction from image ---")
    try:
        # Step 1: Gemini performs OCR and initial extraction
        gemini_output_raw_step1 = call_gemini_vision_api_for_extraction(image_data)
        print("\n--- Raw JSON Output from Step 1 (Gemini) ---")
        print(gemini_output_raw_step1)

        # Parse the JSON string from Step 1
        extracted_items = json.loads(gemini_output_raw_step1)

    except json.JSONDecodeError as e:
        print(f"Error parsing JSON from Gemini Step 1: {e}")
        print(f"Gemini raw response was:\n{gemini_output_raw_step1}")
        return []
    except Exception as e:
        print(f"An unexpected error occurred during Gemini Step 1: {e}")
        return []

    # Prepare input for Step 2: Convert extracted_items list back to JSON string
    json_string_for_step2 = json.dumps(extracted_items)

    print("\n--- Running Step 2: Cleaning and Correcting items with Gemini ---")
    try:
        # Step 2: Gemini cleans and corrects the extracted JSON
        final_gemini_output_raw_step2 = call_gemini_api_for_cleaning(json_string_for_step2)
        print("\n--- Final Cleaned JSON Output from Step 2 (Gemini) ---")
        print(final_gemini_output_raw_step2)

        # Parse the final JSON string
        cleaned_items = json.loads(final_gemini_output_raw_step2)
        return cleaned_items

    except json.JSONDecodeError as e:
        print(f"Error parsing JSON from Gemini Step 2: {e}")
        print(f"Gemini raw response was:\n{final_gemini_output_raw_step2}")
        return []
    except Exception as e:
        print(f"An unexpected error occurred during Gemini Step 2: {e}")
        return []


# --- Example Usage ---
if __name__ == "__main__":
    # Ensure your API key is set in environment variables or hardcoded (less secure)
    # e.g., export GEMINI_API_KEY="YOUR_API_KEY_HERE" in your terminal
    gemini_api_key = os.getenv("GEMINI_API_KEY")

    if not gemini_api_key:
        print("Error: GEMINI_API_KEY environment variable not set.")
        print("Please set it before running, e.g., export GEMINI_API_KEY='your_key_here'")
        exit()

    image_file = 'uploads/test2_2_processed.jpg' # Your image path

    final_receipt_data = process_receipt_with_gemini(image_file)

    if final_receipt_data:
        print("\n--- Final Processed Receipt Data ---")
        for item in final_receipt_data:
            print(f"Name: {item['name']}, Price: {item['price']}, Quantity: {item['quantity']}, Unit: '{item['unit']}'")
    else:
        print("\nFailed to process receipt.")