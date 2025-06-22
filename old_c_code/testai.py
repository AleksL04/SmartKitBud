import os
import io
from google.cloud import vision

# Initialize the Vision AI client
# This will automatically pick up credentials from GOOGLE_APPLICATION_CREDENTIALS
client = vision.ImageAnnotatorClient()

def get_text_from_image_vision_ai(image_path):
    """
    Performs OCR on an image using Google Cloud Vision AI's DOCUMENT_TEXT_DETECTION
    and returns the full raw text.
    """
    # Check if the image file exists
    if not os.path.exists(image_path):
        print(f"Error: Image file not found at {image_path}")
        return None

    with io.open(image_path, 'rb') as image_file:
        content = image_file.read()

    image = vision.Image(content=content)

    # Use DOCUMENT_TEXT_DETECTION for best results on dense text like receipts.
    # This feature is more robust for document layouts than basic TEXT_DETECTION.
    response = client.document_text_detection(image=image)

    # The `full_text_annotation.text` attribute contains all the detected text
    # as a single string, including line breaks.
    full_text = response.full_text_annotation.text

    return full_text

if __name__ == "__main__":
    # --- Configuration ---
    # Make sure this image path is correct relative to where you run the script,
    # or provide a full absolute path.
    TEST_IMAGE_PATH = "img/test1.jpg" # <--- CHANGE THIS TO YOUR IMAGE PATH

    print(f"Attempting to extract text from: {TEST_IMAGE_PATH}")

    try:
        extracted_text = get_text_from_image_vision_ai(TEST_IMAGE_PATH)
        if extracted_text:
            print("\n--- Extracted Text ---")
            print(extracted_text)
        else:
            print("No text extracted or an error occurred.")

    except Exception as e:
        print(f"\nAn error occurred: {e}")
        print("Please ensure:")
        print("1. Your 'GOOGLE_APPLICATION_CREDENTIALS' environment variable is set correctly.")
        print("2. You have enabled the 'Cloud Vision API' in your Google Cloud project.")
        print("3. Your image file path is correct and the image is accessible.")