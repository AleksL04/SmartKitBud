import requests

# --- Configuration ---
BASE_URL = "https://api.spoonacular.com"

# --- API Endpoints ---

SEARCH_BY_INGREDIENTS_ENDPOINT = "/recipes/findByIngredients"

def search_recipes_by_ingredients(ingredients_list, number=5, API_KEY=""):
    """
    Searches for recipes based on a list of ingredients.

    Args:
        ingredients_list (list or str): A list of ingredients (e.g., ["apples", "flour", "sugar"])
                                        or a comma-separated string (e.g., "apples,flour,sugar").
        number (int): The maximum number of recipes to return.
        API_KEY (str): Your Spoonacular API key.

    Returns:
        list: A list of dictionaries, where each dictionary represents a recipe,
              or None if an error occurs.
    """
    url = f"{BASE_URL}{SEARCH_BY_INGREDIENTS_ENDPOINT}"

    # Ensure ingredients are in the correct comma-separated string format
    if isinstance(ingredients_list, list):
        ingredients_string = ",".join(ingredients_list)
    elif isinstance(ingredients_list, str):
        ingredients_string = ingredients_list # Assume it's already comma-separated
    else:
        print("Error: ingredients_list must be a list of strings or a comma-separated string.")
        return None

    params = {
        "apiKey": API_KEY,
        "ingredients": ingredients_string, # This is the correct parameter name
        "number": number
    }

    try:
        response = requests.get(url, params=params)
        response.raise_for_status()  # Raise an exception for HTTP errors (4xx or 5xx)
        data = response.json()
        return data # The findByIngredients endpoint directly returns a list of recipes, not a "results" key
    except requests.exceptions.RequestException as e:
        print(f"Error searching recipes: {e}")
        return None
    except json.JSONDecodeError:
        print(f"Error decoding JSON response: {response.text}")
        return None