"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Typography,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Box,
  Collapse,
  IconButton,
  Checkbox,
  Chip,
  Button,
  AlertTitle,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Link,
  Skeleton,
  Container,
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { useRouter } from "next/navigation";

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

    const ingredientList = selectedItems.map((item) => item.name).join(",");

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
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* --- LEFT COLUMN: INVENTORY --- */}
        <Grid>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="h4" component="h1">
              My Inventory
            </Typography>
            <TextField
              label="Search Inventory"
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Box>
          {selectedItems.length > 0 && (
            <Alert
              severity="info"
              sx={{ mb: 2 }}
              action={
                <Button
                  color="primary"
                  size="small"
                  variant="contained"
                  onClick={handleFindRecipes}
                  disabled={isRecipesLoading}
                >
                  {isRecipesLoading ? (
                    <CircularProgress size={20} />
                  ) : (
                    "Find Recipes"
                  )}
                </Button>
              }
            >
              <AlertTitle>
                Selected Ingredients ({selectedItems.length})
              </AlertTitle>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {selectedItems.map((item) => (
                  <Chip
                    key={item.id}
                    label={item.name}
                    onDelete={() => handleSelectItem(item, false)}
                  />
                ))}
              </Box>
            </Alert>
          )}

          {Object.keys(filteredAndGroupedItems).length === 0 ? (
            <Paper
              elevation={2}
              sx={{
                p: 4,
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
              }}
            >
              <Typography variant="h6">
                Your inventory is looking a little empty!
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Upload a receipt to automatically add items and get recipe
                suggestions.
              </Typography>
              <Button
                variant="contained"
                onClick={() => router.push("/upload")}
              >
                Upload a Receipt
              </Button>
            </Paper>
          ) : (
            Object.keys(filteredAndGroupedItems)
              .sort()
              .map((category) => {
                const categoryItems = filteredAndGroupedItems[category];
                const selectedInCategory = categoryItems.filter((item) =>
                  selectedItems.some((sel) => sel.id === item.id)
                );
                const areAllSelected =
                  categoryItems.length > 0 &&
                  selectedInCategory.length === categoryItems.length;

                return (
                  <Paper sx={{ width: "100%", mb: 2 }} key={category}>
                    <Box
                      sx={{
                        p: 2,
                        cursor: "pointer",
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                      onClick={() => toggleCategory(category)}
                    >
                      <Typography variant="h6">{category}</Typography>
                      <IconButton size="small">
                        {openCategories[category] ? (
                          <KeyboardArrowUpIcon />
                        ) : (
                          <KeyboardArrowDownIcon />
                        )}
                      </IconButton>
                    </Box>
                    <Collapse
                      in={openCategories[category]}
                      timeout="auto"
                      unmountOnExit
                    >
                      <TableContainer>
                        <Table
                          size="small"
                          stickyHeader
                          aria-label={`${category} items`}
                        >
                          <TableHead>
                            <TableRow>
                              <TableCell padding="checkbox">
                                <Checkbox
                                  indeterminate={
                                    selectedInCategory.length > 0 &&
                                    !areAllSelected
                                  }
                                  checked={areAllSelected}
                                  onChange={() =>
                                    handleSelectAllInCategory(
                                      categoryItems,
                                      areAllSelected
                                    )
                                  }
                                />
                              </TableCell>
                              <TableCell>Item Name</TableCell>
                              <TableCell align="right">Quantity</TableCell>
                              <TableCell align="right">Unit</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {categoryItems.map((item) => {
                              const isSelected = selectedItems.some(
                                (selected) => selected.id === item.id
                              );
                              return (
                                <TableRow
                                  hover
                                  key={item.id}
                                  selected={isSelected}
                                  sx={{
                                    "&:last-child td, &:last-child th": {
                                      border: 0,
                                    },
                                  }}
                                >
                                  <TableCell padding="checkbox">
                                    <Checkbox
                                      checked={isSelected}
                                      onChange={(e) =>
                                        handleSelectItem(item, e.target.checked)
                                      }
                                    />
                                  </TableCell>
                                  <TableCell>{item.name}</TableCell>
                                  <TableCell align="right">
                                    {item.quantity}
                                  </TableCell>
                                  <TableCell align="right">
                                    {item.unit}
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Collapse>
                  </Paper>
                );
              })
          )}
        </Grid>

        {/* --- RIGHT COLUMN: RECIPE RESULTS --- */}
        <Grid sx={{ position: { md: "sticky" }, top: "80px", height: "100%" }}>
          <Paper sx={{ p: 2, height: "100%" }}>
            <Typography variant="h6" gutterBottom>
              Recipe Suggestions
            </Typography>
            {isRecipesLoading && (
              <Grid container spacing={2}>
                {Array.from(new Array(6)).map((_, index) => (
                  <Grid key={index}>
                    <Skeleton variant="rectangular" height={140} />
                    <Skeleton />
                    <Skeleton width="60%" />
                  </Grid>
                ))}
              </Grid>
            )}
            {recipesError && <Alert severity="error">{recipesError}</Alert>}
            {!isRecipesLoading && recipes.length === 0 && !recipesError && (
              <Typography variant="body1" color="text.secondary">
                Select ingredients from your inventory and click &quot;Find
                Recipes&quot; to see suggestions.
              </Typography>
            )}
            <Grid container spacing={2}>
              {recipes.map((recipe) => (
                <Grid key={recipe.id}>
                  <Card>
                    <CardMedia
                      component="img"
                      height="140"
                      image={recipe.image}
                      alt={recipe.title}
                    />
                    <CardContent sx={{ p: 1.5 }}>
                      <Link
                        href={`https://spoonacular.com/recipes/${recipe.title.replace(
                          /\s+/g,
                          "-"
                        )}-${recipe.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        underline="hover"
                        variant="body2"
                      >
                        {recipe.title}
                      </Link>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        component="div"
                        sx={{ mt: 1 }}
                      >
                        Uses: {recipe.usedIngredientCount} | Missing:{" "}
                        {recipe.missedIngredientCount}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

