#include <tesseract/baseapi.h>
#include <leptonica/allheaders.h>

int main(int argc, char *args[]){
    char *outText;
    
    FILE * fp;
    fp = fopen("output_from_cpp.txt", "w");
    if (fp == NULL) {
        perror("Error opening file");
        exit(1);
    }

    tesseract::TessBaseAPI *api = new tesseract::TessBaseAPI();
    // Initialize tesseract-ocr with English, without specifying tessdata path
    char * buff;
    buff = args[1];
    if (api->Init(NULL, "eng")) {
        fprintf(stderr, "Could not initialize tesseract.\n");
        exit(1);
    }

    // Open input image with leptonica library
    Pix *image = pixRead(buff);
    api->SetImage(image);
    // Get OCR result
    outText = api->GetUTF8Text();

    fprintf(fp,"%s", outText);
    fclose(fp);
    // Destroy used object and release memory
    api->End();
    delete api;
    delete [] outText;
    pixDestroy(&image);

    return 0;
}
