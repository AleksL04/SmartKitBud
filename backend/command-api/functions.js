// This file contains all the logic for interacting with the Google AI API.

async function process_image_to_receipt_json(ai, base64ImageFile) {
    const _GEMINI_INSTRUCTION = `
    Extract all individual item entries from the receipt. Respond only with a JSON array. Each item object must have "name" (string), "price" (number), "quantity" (number), and "unit" (string).

    Specific instructions for items with quantities by weight or volume:
    - Identify any numerical value directly followed by a unit of weight (e.g., "LB", "lb", "LBS", "KG", "kg", "GR", "gr", "G", "g", "OZ", "oz") or volume (e.g., "ML", "ml", "L", "l", "GAL", "gal", "ea", "ct").
    - If such a specific quantity and unit are indicated for an item (e.g., "1.5 LB Pickles", "440GR Bread", "12 OZ Soda", "500G Coffee"), set the \`quantity\` field to the numerical value of that amount (e.g., 1.5, 440, 12, 500).
    - Extract the detected unit (e.g., "LB", "GR", "OZ", "g", "ml") and place it into the "unit" field. Do NOT append the unit to the "name" in this case.
    - For items that are discrete units (e.g., "Milk", "Bread") or where no specific unit of measure is listed (e.g., "by LB" without a specific weight), the "unit" field should be an empty string ("").
    - The \`price\` should always be the total price for that item line.
    - If an item is marked "by unit" (e.g., "by LB", "by KG", "by OZ") but no specific amount is listed, set the \`quantity\` to 1 and the "unit" field to the corresponding unit (e.g., "lb", "oz").

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
    `;
    const contents = [
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: base64ImageFile
        }
      },
      {
        text: _GEMINI_INSTRUCTION
      }
    ];
    const response1 = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contents,
      config: {
        thinkingConfig: {
          thinkingBudget: 0
        }
      }
    });
    return response1.text;
}

async function format_json_to_lowercase(ai, raw_json_string) {
  const _GEMINI_INSTRUCTION = `
    Please review the provided JSON array of receipt items for any spelling errors or inconsistencies. Apply the following corrections and standardizations:

    1.  **Name Standardization:** Convert all item names to lowercase.
    2.  **Unit and Quantity Correction:**
        * **Detect and Correct Misparsed Units/Quantities:** Thoroughly re-evaluate each item's \`name\` string to identify any **numerical values or common unit abbreviations** that might have been incorrectly parsed or left within the \`name\` field during the initial extraction.
        * **Recognized Units:** Be prepared to find any of the following units: "lb", "kg", "gr", "g", "oz", "ml", "l", "ea", "ct".
        * **Extract and Move:** If a numerical quantity and one of the recognized units are found within the \`name\`, extract the numerical value to the \`quantity\` field and the unit to the \`unit\` field.
        * **Remove from Name:** After extraction, ensure these quantities and units are **removed from the \`name\` field**.
        * **Handle Common OCR/Typo Errors:** For known patterns like "44DGR", interpret 'D' as '0' and correct it to '440GR' or '440gr', then extract '440' to \`quantity\` and 'gr' to \`unit\`. Apply similar logic for other common OCR errors.
        
    3. **Unit Standardization:**
        * **Standardize Grams:** Convert all variations of grams ("GR", "gr", "G") to the single, standardized unit "g".
        * **Standardize Other Units:** Convert all other units to their most common lowercase abbreviation (e.g., "LBS" -> "lb", "KG" -> "kg", "OZ" -> "oz", "ML" -> "ml", "CT" -> "ct").
        * **Default for Discrete Items:** If an item's \`name\` clearly indicates a discrete item (e.g., "milk", "bread") and no specific weight/volume is found, ensure \`quantity\` is set to 1 and \`unit\` is an empty string ("").
        * **Handle "by unit" without amount:** If the name implies a unit (e.g., "by LB", "per kg") but no specific amount is found, set \`quantity\` to 1 and the \`unit\` field to the corresponding unit (e.g., "lb", "kg").
        * **Preserve Existing Correct Values:** If \`quantity\` and \`unit\` are already correctly populated and consistent with the \`name\`, leave them as is.

    Maintain the exact JSON structure. Respond only with a JSON array. Do not include any additional text or markdown quotes. If no items are found, return an empty array [].
    `;
    const response1 = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        _GEMINI_INSTRUCTION,
        raw_json_string
      ],
      config: {
        thinkingConfig: {
          thinkingBudget: 0
        }
      }
    });
    return response1.text;
}

async function classify_and_normalize_items(ai, formatted_json_string) {
  const _GEMINI_INSTRUCTION = `
  You are an intelligent grocery receipt processing assistant. Your task is to analyze a JSON array of receipt items and enrich it.

  For each item in the input array, perform the following actions:
  1.  **Classification**: Determine if the item is a 'Food' item or a 'Non-Food' item.
  2.  **Normalization**: If it is a food item, convert its name into a simple, generic, and common name (e.g., "hss avcdo org" becomes "avocado").
  3.  **Categorization**: Assign a relevant grocery category to the food item from this list: Produce, Dairy & Eggs, Meat & Seafood, Bakery & Bread, Pantry, Frozen Foods, Beverages, Snacks, Household, Personal Care, Other.

  Your response must be ONLY a valid JSON array containing objects for the **food items only**. Discard all non-food items.

  Crucially, each output object must preserve the original "price", "quantity", and "unit" from the input, and have the following structure:
  {
    "name": "The normalized name",
    "category": "The assigned category",
    "price": number,
    "quantity": number,
    "unit": "string"
  }

  Do not include any additional text or markdown quotes. If no food items are found, return an empty array [].
  `;
  const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
          _GEMINI_INSTRUCTION,
          formatted_json_string
      ],
      config: {
          thinkingConfig: {
              thinkingBudget: 0
          }
      }
  });
  return response.text;
}

module.exports = {
    process_image_to_receipt_json,
    format_json_to_lowercase,
    classify_and_normalize_items
};