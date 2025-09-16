"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  CircularProgress,
  Alert,
  Box,
  Container,
} from "@mui/material";
import { useRouter } from "next/navigation";

import Inventory from "./components/Inventory";
import RecipeSuggestions from "./components/RecipeSuggestions";
import SelectedIngredients from "./components/SelectedIngredients";

// --- TYPE DEFINITIONS ---
interface ReceiptItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  unit: string;
  category: string;
  created: string;
}

interface SpoonacularRecipe {
  id: number;
  title: string;
  image: string;
  usedIngredientCount: number;
  missedIngredientCount: number;
}

const groupItemsByCategory = (
  items: ReceiptItem[]
): Record<string, ReceiptItem[]> => {
  return items.reduce((acc, item) => {
    const category = item.category || "Other";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, ReceiptItem[]>);
};

// --- COMPONENT START ---
export default function DashboardPage() {
  const router = useRouter();
  // State for inventory
  const [items, setItems] = useState<ReceiptItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>(
    {}
  );
  const [selectedItems, setSelectedItems] = useState<ReceiptItem[]>([]);

  // State for Spoonacular recipes
  const [recipes, setRecipes] = useState<SpoonacularRecipe[]>([]);
  const [isRecipesLoading, setIsRecipesLoading] = useState(false);
  const [recipesError, setRecipesError] = useState<string | null>(null);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await fetch("/api/items");
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to fetch data.");
        }
        const data: ReceiptItem[] = await response.json();
        setItems(data);
        // By default, open the first category
        if (data.length > 0) {
          const firstCategory = data[0].category || "Other";
          setOpenCategories({ [firstCategory]: true });
        }
      } catch (err: unknown) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred."
        );
      } finally {
        setIsLoading(false);
      }
    };
    fetchItems();
  }, []);

  const filteredAndGroupedItems = useMemo(() => {
    const filteredItems = items.filter((item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return groupItemsByCategory(filteredItems);
  }, [items, searchTerm]);

  const handleFindRecipes = async () => {
    if (selectedItems.length === 0) return;

    setIsRecipesLoading(true);
    setRecipesError(null);
    setRecipes([]);

    const ingredientList = [...new Set(selectedItems.map((item) => item.name))].join(",");

    try {
      const response = await fetch("/api/recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ingredients: ingredientList }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch recipes.");
      }

      setRecipes(data);
    } catch (err) {
      setRecipesError(
        err instanceof Error ? err.message : "An unknown error occurred."
      );
    } finally {
      setIsRecipesLoading(false);
    }
  };

  const toggleCategory = (category: string) => {
    setOpenCategories((prev) => ({ ...prev, [category]: !prev[category] }));
  };

  const handleSelectItem = (item: ReceiptItem, isSelected: boolean) => {
    if (isSelected) {
      setSelectedItems((prev) => [...prev, item]);
    } else {
      setSelectedItems((prev) =>
        prev.filter((selected) => selected.id !== item.id)
      );
    }
  };

  const handleSelectAllInCategory = (
    categoryItems: ReceiptItem[],
    areAllSelected: boolean
  ) => {
    if (areAllSelected) {
      const categoryItemIds = new Set(categoryItems.map((i) => i.id));
      setSelectedItems((prev) =>
        prev.filter((item) => !categoryItemIds.has(item.id))
      );
    } else {
      const newItems = categoryItems.filter(
        (item) => !selectedItems.some((selected) => selected.id === item.id)
      );
      setSelectedItems((prev) => [...prev, ...newItems]);
    }
  };

  // --- RENDER LOGIC ---
  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4, px: { xs: 2, sm: 3 } }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 4,
          alignItems: "flex-start",
        }}
      >
        <Box sx={{ flex: { xs: "unset", md: 2 }, width: { xs: "100%", md: "auto" } }}>
          <Inventory
            filteredAndGroupedItems={filteredAndGroupedItems}
            searchTerm={searchTerm}
            onSearchTermChange={setSearchTerm}
            openCategories={openCategories}
            toggleCategory={toggleCategory}
            selectedItems={selectedItems}
            handleSelectItem={handleSelectItem}
            handleSelectAllInCategory={handleSelectAllInCategory}
            router={router}
          />
        </Box>

        <Box sx={{ flex: { xs: "unset", md: 1 }, width: { xs: "100%", md: "auto" } }}>
          <Box sx={{ position: { md: "sticky" }, top: "80px" }}>
            <SelectedIngredients
              selectedItems={selectedItems}
              isRecipesLoading={isRecipesLoading}
              onFindRecipes={handleFindRecipes}
              onDeselectItem={(item) => handleSelectItem(item, false)}
            />
            <RecipeSuggestions
              recipes={recipes}
              isLoading={isRecipesLoading}
              error={recipesError}
            />
          </Box>
        </Box>
      </Box>
    </Container>
  );
}