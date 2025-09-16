"use client";

import React from "react";
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Chip,
  CircularProgress,
} from "@mui/material";

// --- TYPE DEFINITIONS -- -
interface ReceiptItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  unit: string;
  category: string;
  created: string;
}

interface SelectedIngredientsProps {
  selectedItems: ReceiptItem[];
  isRecipesLoading: boolean;
  onFindRecipes: () => void;
  onDeselectItem: (item: ReceiptItem) => void;
}

export default function SelectedIngredients({
  selectedItems,
  isRecipesLoading,
  onFindRecipes,
  onDeselectItem,
}: SelectedIngredientsProps) {
  if (selectedItems.length === 0) {
    return null;
  }

  return (
    <Alert
      severity="info"
      sx={{ mb: 2 }}
      action={
        <Button
          color="primary"
          size="small"
          variant="contained"
          onClick={onFindRecipes}
          disabled={isRecipesLoading}
        >
          {isRecipesLoading ? <CircularProgress size={20} /> : "Find Recipes"}
        </Button>
      }
    >
      <AlertTitle>Selected Ingredients ({selectedItems.length})</AlertTitle>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
        {selectedItems.map((item) => (
          <Chip
            key={item.id}
            label={item.name}
            onDelete={() => onDeselectItem(item)}
          />
        ))}
      </Box>
    </Alert>
  );
}