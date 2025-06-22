# Define the C++ compiler to use
CXX = g++

# Define the source file(s)
SRCS = image_to_text.cpp

# Define the executable name
TARGET = ocr_app

# Flags for pkg-config to get cflags (include paths) and libs (library paths and names)
# IMPORTANT: Use 'lept' for Leptonica with pkg-config, not 'leptonica'
CXXFLAGS = $(shell pkg-config --cflags tesseract lept) -std=c++11
LIBS = $(shell pkg-config --libs tesseract lept)

# Default rule: compiles the main program
all: $(TARGET)

$(TARGET): $(SRCS)
	# Compiles the source file(s) and links the libraries
	$(CXX) $(SRCS) $(CXXFLAGS) $(LIBS) -o $(TARGET)

# Clean rule: removes compiled files
clean:
	rm -f $(TARGET) *.o

.PHONY: all clean
