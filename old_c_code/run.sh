#!/bin/bash

# Define the C++ executable name from your Makefile
CPP_EXECUTABLE="ocr_app"
PYTHON_SCRIPT="extract_receipt_items.py"
IMAGE_FOLDER="img" # <--- **DEFINE YOUR IMAGE FOLDER HERE**

# --- Step 1: Compile the C++ program using Makefile ---
echo "Compiling C++ program using Makefile..."
make all

# Check if compilation was successful
if [ $? -ne 0 ]; then
    echo "C++ compilation failed! Exiting."
    exit 1
fi
echo "C++ program compiled successfully."

# --- Step 2: Check if the image folder exists ---
if [ ! -d "$IMAGE_FOLDER" ]; then
    echo "Error: Image folder '$IMAGE_FOLDER' not found. Please create it or update IMAGE_FOLDER variable."
    exit 1
fi

# --- Step 3: Loop through images in the folder and run executables for each ---
echo "Processing images in '$IMAGE_FOLDER'..."

# Using a for loop with a glob pattern to iterate over image files
# This will pick up files directly in IMAGE_FOLDER.
# You can extend the pattern to include other image types or
# use 'find' for recursive scanning (see "More Advanced" below).
for image_file in "$IMAGE_FOLDER"/*.jpg "$IMAGE_FOLDER"/*.png "$IMAGE_FOLDER"/*.jpeg; do
    # Check if the glob found any files. If not, the pattern itself might be returned.
    # The -f check ensures we only process actual files.
    if [ -f "$image_file" ]; then
        echo "--------------------------------------------------"
        echo "Processing image: $image_file"

        # Run the C++ executable with the current image file as an argument
        echo "Running C++ executable for $image_file..."
        ./"${CPP_EXECUTABLE}" "$image_file"

        # Check if C++ program succeeded
        if [ $? -eq 0 ]; then
            echo "C++ program finished successfully for $image_file"

            # Run the Python script.
            # IMPORTANT: How does your Python script get the text?
            # 1. If C++ writes text to a file (e.g., "$image_file.txt"),
            #    Python should read that file. You'll need to adapt the Python command:
            #    python3 "${PYTHON_SCRIPT}" "${image_file%.*}.txt"
            # 2. If C++ prints text to standard output, you can pipe it to Python:
            #    ./"${CPP_EXECUTABLE}" "$image_file" | python3 "${PYTHON_SCRIPT}"
            #    In this case, your Python script should be designed to read from stdin.
            # 3. If Python re-processes the image or needs the original image path:
            #    python3 "${PYTHON_SCRIPT}" "$image_file" (as shown below)
            # Choose the appropriate one for your setup.
            echo "Running Python script for $image_file..."
            python3 "${PYTHON_SCRIPT}" "$image_file" # <--- Adjust arguments for Python script

            # Check if Python script ran successfully
            if [ $? -eq 0 ]; then
                echo "Python script finished successfully for $image_file"
            else
                echo "Error: Python script execution failed for $image_file!"
                # Optionally, break or exit here if a single failure is critical
            fi
        else
            echo "Error: C++ program execution failed for $image_file! Skipping Python script for this image."
            # Optionally, continue to the next image instead of exiting if non-critical
        fi
    fi
done

echo "--------------------------------------------------"
echo "All images processed."

# --- Step 4: Clean up C++ executable (optional, use 'make clean') ---
echo "Cleaning up compiled files..."
make clean

echo "Script finished."