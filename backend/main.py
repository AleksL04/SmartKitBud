import sys
import json
from pathlib import Path

from config import GEMINI_API_KEY, OCR_API_KEY, UPLOAD_DIR
from format_json import format_json_to_lowercase
from img_to_json import process_image_to_receipt_json

if __name__ == "__main__":
    # --- Instructions for testing ---
    print("--- Running Temporary Image Processor Test ---")
    print("Usage: python main_temp_test.py [path/to/your/receipt.jpg]")
    print("--------------------------------------------")

    # Determine the image file path from command line argument or a default
    if len(sys.argv) > 1:
        image_file_path = sys.argv[1]
    else:
        # --- IMPORTANT: Change this to a path to a real test image file ---
        # For example, create a dummy_receipt.jpg in your 'backend/uploads' folder
        # or specify a full path to an image file on your system.
        dummy_image_name = "test1.jpg" # Replace with your actual test image name
        image_file_path = Path(UPLOAD_DIR) / dummy_image_name

        if not Path(image_file_path).exists():
            print(f"ERROR: Test image '{image_file_path}' not found.")
            print("Please provide a valid path as a command-line argument or update 'dummy_image_name' and ensure the file exists.")
            sys.exit(1)

    print(f"Attempting to process image: {image_file_path}")

    # Call your core processing function
    try:
        extracted_items = process_image_to_receipt_json(
            image_filepath=str(image_file_path),
            gemini_api_key=GEMINI_API_KEY
        )

        formated_items = format_json_to_lowercase(json.dumps(extracted_items), GEMINI_API_KEY)

        print("\n--- Extracted Receipt Items (JSON Output) ---")
        # Use json.dumps for pretty printing the JSON output
        print(json.dumps(extracted_items, indent=2))
        print("--------------------------------------------")

        print("\n--- Formated Receipt Items (JSON Output) ---")
        # Use json.dumps for pretty printing the JSON output
        print(json.dumps(formated_items, indent=2))
        print("--------------------------------------------")

        if not extracted_items:
            print("No items were extracted. Check your image, API keys, and parsing logic.")

    except ValueError as e:
        print(f"Configuration Error: {e}")
        print("Please ensure your .env file is correctly set up with SUPABASE_URL, SUPABASE_KEY, GEMINI_API_KEY, and OCR_API_KEY.")
    except Exception as e:
        print(f"\n--- An Error Occurred ---")
        print(f"Error type: {type(e).__name__}")
        print(f"Message: {e}")
        print("Please check your API keys, network connection, and OCR/Gemini API responses.")
