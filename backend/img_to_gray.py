from PIL import Image
import os

def preprocess_and_compress_image_for_ocr(
    input_path: str, 
    output_directory: str = "processed_images",
    max_dimension: int = 1800, # Max width/height for resizing (pixels)
    jpeg_quality: int = 85 # JPEG compression quality (0-100, higher is better quality, larger file)
) -> str | None:
    """
    Performs a pipeline of image preprocessing and lossy compression for OCR:
    1. Resizes the image if its largest dimension exceeds max_dimension.
    2. Converts the image to grayscale.
    3. Saves the image as a JPEG with specified quality level (lossy compression).

    Args:
        input_path (str): The path to the original image file.
        output_directory (str): The directory where the processed image will be saved.
                                 It will be created if it doesn't exist.
        max_dimension (int): Maximum allowed dimension (width or height) for resizing.
                             Images larger than this will be scaled down.
        jpeg_quality (int): JPEG compression quality (0-100). Higher values
                            mean better image quality but larger file sizes.
                            Values between 80-90 are often a good balance.

    Returns:
        str: The path to the processed and compressed image, or None on failure.
    """
    if not os.path.exists(input_path):
        print(f"Error: Input image file not found at {input_path}")
        return None

    os.makedirs(output_directory, exist_ok=True)
    
    # Construct an output filename based on the original, with a .jpg extension
    base_filename = os.path.basename(input_path)
    name_without_ext = os.path.splitext(base_filename)[0]
    output_filename = f"{name_without_ext}_processed.jpg" # Changed to .jpg
    output_path = os.path.join(output_directory, output_filename)

    try:
        with Image.open(input_path) as img:
            original_width, original_height = img.size
            original_size_mb = os.path.getsize(input_path) / (1024 * 1024)

            print(f"Processing image: {base_filename}")
            print(f"  Original dimensions: {original_width}x{original_height}, size: {original_size_mb:.2f} MB")

            # 1. Resize if necessary (lossy step in terms of pixel count)
            if max(original_width, original_height) > max_dimension:
                print(f"  Resizing image to fit within {max_dimension}px...")
                if original_width > original_height:
                    new_width = max_dimension
                    new_height = int(original_height * (max_dimension / original_width))
                else:
                    new_height = max_dimension
                    new_width = int(original_width * (max_dimension / original_height))
                
                # Use LANCZOS filter for high-quality downsampling
                img = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
                print(f"  Image resized to: {new_width}x{new_height}")
            else:
                print(f"  Image already within {max_dimension}px max dimension. No resizing needed.")

            # 2. Convert to grayscale (lossy step in terms of color information)
            print("  Converting image to grayscale (L mode)...")
            img = img.convert('L') # 'L' mode for 8-bit pixels, black and white (grayscale)

            # 3. Save as JPEG with specified quality (lossy compression)
            print(f"  Saving as JPEG with quality level {jpeg_quality}...")
            img.save(output_path, "JPEG", quality=jpeg_quality) # Changed to JPEG and added quality parameter

            final_size_mb = os.path.getsize(output_path) / (1024 * 1024)
            print(f"  Processed image saved to: {output_path}")
            print(f"  Final processed image size: {final_size_mb:.2f} MB")

            if final_size_mb <= 1.0:
                print("  Target achieved: Image is under 1 MB.")
            else:
                print("  Warning: Image is still over 1 MB. Consider lowering max_dimension or jpeg_quality.")
            
            return output_path

    except Exception as e:
        print(f"An error occurred during image processing: {e}")
        return None

if __name__ == "__main__":
    # --- Example Usage ---
    
    # Create a dummy image for demonstration if not found
    test_image_input_path = "img/test2_2.jpg" 
    if not os.path.exists(test_image_input_path):
        print(f"Creating a dummy large image at {test_image_input_path} for testing...")
        try:
            from PIL import ImageDraw
            # Create a larger image to demonstrate resizing and compression
            img_dummy = Image.new('RGB', (4000, 8000), color = 'white') # Larger dimensions
            d = ImageDraw.Draw(img_dummy)
            d.text((100,100), "Receipt Test - Small Text Area", fill=(0,0,0))
            d.text((100,200), "Item A: $12.34", fill=(0,0,0))
            d.text((100,250), "Item B: $56.78", fill=(0,0,0))
            d.text((100,300), "TOTAL: $69.12", fill=(255,0,0)) 
            img_dummy.save(test_image_input_path, quality=95) # Save as JPEG to get a larger initial size
            print("Dummy image created.")
        except ImportError:
            print("Pillow not fully installed or missing dependencies for ImageDraw. Cannot create dummy image.")
            exit(1)

    # Define output directory for processed images
    output_dir = "p_img"

    # Process and compress the image
    processed_image_path = preprocess_and_compress_image_for_ocr(
        input_path=test_image_input_path,
        output_directory=output_dir,
        max_dimension=1800, 
        jpeg_quality=85 # Set JPEG quality for lossy compression
    )

    if processed_image_path:
        print(f"\nSuccessfully preprocessed and compressed: {processed_image_path}")
        print("This image is now ready to be sent to OCR.space API.")
        # You would then integrate this 'processed_image_path' into your OCR.space API call.
        
        # Example of integrating with ocr_space_file (requires that function defined)
        # from your_ocr_space_module import ocr_space_file # Assuming you put ocr_space_file in its own module
        # MY_OCR_SPACE_API_KEY = os.environ.get('OCR_SPACE_API_KEY')
        # if MY_OCR_SPACE_API_KEY:
        #     ocr_result_json = ocr_space_file(processed_image_path, api_key=MY_OCR_SPACE_API_KEY)
        #     if ocr_result_json:
        #         print("\nOCR.space Response (first 500 chars):", str(ocr_result_json)[:500])
        # else:
        #     print("\nOCR_SPACE_API_KEY not set. Cannot call OCR.space API.")
    else:
        print("\nImage preprocessing and compression failed.")
