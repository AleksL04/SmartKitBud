"use client";

import React from "react";
import {
  Typography,
  Alert,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Link,
  Skeleton,
  Paper,
} from "@mui/material";

// --- TYPE DEFINITIONS ---
interface SpoonacularRecipe {
  id: number;
  title: string;
  image: string;
  usedIngredientCount: number;
  missedIngredientCount: number;
}

interface RecipeSuggestionsProps {
  recipes: SpoonacularRecipe[];
  isLoading: boolean;
  error: string | null;
}

export default function RecipeSuggestions({
  recipes,
  isLoading,
  error,
}: RecipeSuggestionsProps) {
  return (
    <Paper sx={{ p: 2, height: "100%" }}>
      <Typography variant="h6" gutterBottom>
        Recipe Suggestions
      </Typography>
      {isLoading && (
        <Grid container spacing={2}>
          {Array.from(new Array(6)).map((_, index) => (
            <Grid item xs={12} sm={6} md={12} key={index}>
              <Skeleton variant="rectangular" height={140} />
              <Skeleton />
              <Skeleton width="60%" />
            </Grid>
          ))}
        </Grid>
      )}
      {error && <Alert severity="error">{error}</Alert>}
      {!isLoading && recipes.length === 0 && !error && (
        <Typography variant="body1" color="text.secondary">
          Select ingredients from your inventory and click &quot;Find
          Recipes&quot; to see suggestions.
        </Typography>
      )}
      <Grid container spacing={2}>
        {recipes.map((recipe) => (
          <Grid item xs={12} sm={6} md={12} key={recipe.id}>
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
  );
}
