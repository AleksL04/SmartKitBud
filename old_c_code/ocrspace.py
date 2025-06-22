import requests
import json
import os

def get_text_from_image_ocr_space(image_path, api_key, language='eng'):
    """
    Performs OCR on an image using the OCR.space API.

    Args:
        image_path (str): The path to the image file.
        api_key (str): Your personal API key from ocr.space.
        language (str): The language code for OCR (e.g., 'eng' for English).

    Returns:
        str: The full raw text detected by OCR.space, or None if an error occurs.
    """
    # Check if the image file exists
    if not os.path.exists(image_path):
        print(f"Error: Image file not found at {image_path}")
        return None

    try:
        # Determine the MIME type based on the file extension
        # This is a simple way; for a more robust solution, use 'mimetypes' module
        file_extension = os.path.splitext(image_path)[1].lower()
        if file_extension == '.jpg' or file_extension == '.jpeg':
            mime_type = 'image/jpeg'
        elif file_extension == '.png':
            mime_type = 'image/png'
        elif file_extension == '.gif':
            mime_type = 'image/gif'
        elif file_extension == '.bmp':
            mime_type = 'image/bmp'
        elif file_extension == '.pdf': # If you also plan to upload PDFs
            mime_type = 'application/pdf'
        else:
            print(f"Error: Unsupported file type or unknown extension: {file_extension}")
            return None

        # Open the image file in binary read mode
        with open(image_path, 'rb') as f:
            image_data = f.read()

        # Define the API endpoint
        api_url = 'https://api.ocr.space/parse/image'

        # Define the payload (parameters for the API request)
        payload = {
            'apikey': api_key,
            'language': language,
            'isOverlayRequired': False,  # Set to True if you want bounding box data
            'OCREngine': 2               # Use OCREngine2 for better accuracy on documents
        }

        # The 'files' parameter now includes the content_type
        files = {
            'filename': (os.path.basename(image_path), image_data, mime_type)
            # Tuple format: (filename, file_content, content_type)
        }

        print(f"Sending image '{os.path.basename(image_path)}' with type '{mime_type}' to OCR.space API...")
        response = requests.post(
            api_url,
            files=files, # Use the updated 'files' dictionary
            data=payload
        )

        response.raise_for_status() # Raise an HTTPError for bad responses (4xx or 5xx)

        result = response.json()
        
        if result and result.get('IsErroredOnProcessing') == False:
            if result.get('ParsedResults'):
                extracted_text = result['ParsedResults'][0]['ParsedText']
                print("OCR.space API call successful.")
                return extracted_text.strip()
            else:
                print("OCR.space API successful, but no text was parsed.")
                return None
        elif result and result.get('IsErroredOnProcessing') == True:
            error_message = result.get('ErrorMessage', 'Unknown error from OCR.space.')
            print(f"OCR.space API Error: {error_message}")
            if result.get('ErrorDetails'):
                print(f"Error Details: {result['ErrorDetails']}")
            return None
        else:
            print("Unexpected response structure from OCR.space API.")
            return None

    except requests.exceptions.RequestException as e:
        print(f"Network or API request error: {e}")
        return None
    except json.JSONDecodeError:
        print(f"Failed to decode JSON response. Raw response: {response.text}")
        return None
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return None

# The __main__ block remains the same as before
if __name__ == "__main__":
    # --- Configuration ---
    MY_OCR_SPACE_API_KEY = 'K87199939888957' # Replace with your actual key!
    TEST_IMAGE_PATH = "img/test1.jpg" # Adjust path to your test image

    print(f"--- Starting OCR.space Text Extraction ---")
    print(f"Attempting to extract text from: {TEST_IMAGE_PATH}")

    extracted_text = get_text_from_image_ocr_space(TEST_IMAGE_PATH, api_key=MY_OCR_SPACE_API_KEY)

    if extracted_text:
        print("\n--- Extracted Text ---")
        print(extracted_text)
    else:
        print("Failed to extract text. Check the error messages above.")

    print("\n--- Program Finished ---")