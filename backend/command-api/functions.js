
async function process_image_to_normalized_json(ai, base64ImageFile) {
  const _GEMINI_INSTRUCTION = `You are an intelligent grocery receipt processing assistant. Your task is to analyze a receipt image and produce a clean, structured JSON output of the food items found.

  Perform the following actions in a single step:
  
  1.  **Extraction**: Identify all individual item entries from the receipt.
  2.  **Filtering**: Discard all non-food items (e.g., household supplies, toiletries). Your final output should ONLY contain food items.
  3.  **Data Extraction**: For each food item, extract the following fields:
      * \`name\`: The name of the item.
      * \`price\`: The total price for that item line (must be a number).
      * \`quantity\`: The quantity of the item (must be a number).
      * \`unit\`: The unit of measure (e.g., "lb", "g", "oz").
  4.  **Normalization and Standardization**:
      * **Name Normalization**: Convert the item name to a simple, generic, lowercase, and common name (e.g., "hss avcdo org" becomes "avocado", "Coca-Cola Classic" becomes "cola").
      * **Unit Standardization**:
          * Standardize all units to their common lowercase abbreviation (e.g., "LBS" -> "lb", "GR" -> "g", "Ounces" -> "oz").
          * If an item is a discrete unit (e.g., "Milk", "Bread") with no specific weight, the \`quantity\` should be 1 and the \`unit\` should be an empty string ("").
          * If a unit is implied (e.g., "by LB") but no amount is listed, set \`quantity\` to 1 and \`unit\` to "lb".
  5.  **Categorization**: Assign a relevant grocery category to each food item from this exact list: "Produce", "Dairy & Eggs", "Meat & Seafood", "Bakery & Bread", "Pantry", "Frozen Foods", "Beverages", "Snacks", "Other".
  
  **Final Output Format**:
  Your response must be ONLY a valid JSON array. Each object in the array must have the following structure:
  {
    "name": "the normalized lowercase name",
    "category": "the assigned category",
    "price": number,
    "quantity": number,
    "unit": "the standardized unit"
  }
  
  Example:
  [
    {
      "name": "avocado",
      "category": "Produce",
      "price": 4.12,
      "quantity": 1.5,
      "unit": "lb"
    },
    {
      "name": "milk",
      "category": "Dairy & Eggs",
      "price": 3.49,
      "quantity": 1,
      "unit": ""
    }
  ]
  
  If no food items are found, return an empty array []. Do not include any additional text or markdown quotes.`;
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
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contents,
      config: {
        thinkingConfig: {
          thinkingBudget: 0
        }
      }
    });
    return response.text;
}

module.exports = {
  process_image_to_normalized_json
};
