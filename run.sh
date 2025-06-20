#!/bin/bash

# Define the C++ executable name from your Makefile
CPP_EXECUTABLE="ocr_app"
PYTHON_SCRIPT="geminiapi.py"

# --- Step 1: Compile the C++ program using Makefile ---
echo "Compiling C++ program using Makefile..."
make all # This will build the $(TARGET) defined in your Makefile (ocr_app)

# Check if compilation was successful
if [ $? -ne 0 ]; then
    echo "C++ compilation failed! Exiting."
    exit 1
fi
echo "C++ program compiled successfully."

# --- Step 2: Run the C++ executable ---
echo "Running C++ executable: ${CPP_EXECUTABLE}..."
./"${CPP_EXECUTABLE}" "test1.jpg"

# Check if C++ program ran successfully
if [ $? -ne 0 ]; then
    echo "C++ program execution failed! Exiting."
    exit 1
fi
echo "C++ program finished executing."

# --- Step 3: Run the Python script ---
echo "Running Python script: ${PYTHON_SCRIPT}..."
# Use python3 or python depending on your system setup
# If using a virtual environment: source env/bin/activate && python "${PYTHON_SCRIPT}"
python3 "${PYTHON_SCRIPT}"

# Check if Python script ran successfully
if [ $? -ne 0 ]; then
    echo "Python script execution failed!"
    exit 1
fi
echo "Python script finished."

# --- Optional: Clean up C++ executable (optional, use 'make clean') ---
echo "Cleaning up compiled files..."
make clean