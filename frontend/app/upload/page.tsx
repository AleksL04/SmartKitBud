"use client";
import React, { useState } from "react";
import {
  Container,
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  TextField,
  Grid,
  Card,
  CardContent,
  CardActions,
  Divider,
  IconButton, // Import IconButton
} from "@mui/material";

import { styled } from "@mui/material/styles";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete"; // Import the Delete icon

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

// Type definition for a single receipt item
interface ReceiptItem {
  name: string;
  price: number;
  quantity: number;
  unit: string;
}

export default function Upload() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [extractedItems, setExtractedItems] = useState<ReceiptItem[]>([]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
      setExtractedItems([]);
      setSuccessMessage(null);
      setError(null);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      setError("No file selected!");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    const formData = new FormData();
    formData.append("image", selectedFile);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      console.log("Full server response object:", result);

      if (!response.ok) {
        throw new Error(result.error || "An unknown error occurred during processing.");
      }

      const items = result.text;

      if (Array.isArray(items) && items.length > 0) {
        setSuccessMessage(`Successfully extracted ${items.length} items! Please review below.`);
        setExtractedItems(items);
      } else {
        setSuccessMessage("File processed, but no items were found in the response.");
        setExtractedItems([]);
      }
    } catch (err: unknown) {
      console.error("Upload or parsing failed:", err);
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while processing the file."
      );
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleItemChange = (index: number, field: keyof ReceiptItem, value: string | number) => {
    const updatedItems = [...extractedItems];
    const itemToUpdate = { ...updatedItems[index] };
    
    if (field === 'price' || field === 'quantity') {
      itemToUpdate[field] = parseFloat(value as string) || 0;
    } else {
      itemToUpdate[field] = value as string;
    }
    
    updatedItems[index] = itemToUpdate;
    setExtractedItems(updatedItems);
  };

  const handleRemoveItem = (indexToRemove: number) => {
    setExtractedItems(prevItems => prevItems.filter((_, index) => index !== indexToRemove));
  };

  const handleDataSubmit = async () => {
    if (extractedItems.length === 0) return;

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch("/api/commit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(extractedItems),
        // --- THIS LINE IS THE FIX ---
        // It tells the browser to include the auth cookie with the request.
        credentials: "include",
        // --- END OF FIX ---
      });

      const result = await response.json();
      if (response.ok) {
        setSuccessMessage("Receipt data saved successfully!");
        setExtractedItems([]);
        setSelectedFile(null);
      } else {
        throw new Error(result.error || "Unknown error while saving");
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while saving the data."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="md">
      <Box sx={{ marginTop: 8, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Typography component="h1" variant="h5">
          Upload Receipt
        </Typography>
        <Typography component="p" sx={{ mt: 1, mb: 2 }}>
          Select a receipt image to extract the items.
        </Typography>

        <Box sx={{ mt: 3, width: "100%" }}>
          <Button component="label" variant="contained" startIcon={<CloudUploadIcon />} fullWidth>
            Select File
            <VisuallyHiddenInput type="file" onChange={handleFileChange} />
          </Button>
          {selectedFile && (
            <Typography variant="body2" sx={{ mt: 2, textAlign: "center" }}>
              Selected file: {selectedFile.name}
            </Typography>
          )}

          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          {successMessage && <Alert severity="success" sx={{ mt: 2 }}>{successMessage}</Alert>}

          <Button
            onClick={handleFileUpload}
            disabled={!selectedFile || isLoading || extractedItems.length > 0}
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 3 }}
          >
            {isLoading ? <CircularProgress size={24} /> : "Process Receipt"}
          </Button>

          {extractedItems.length > 0 && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Extracted Items
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Please review and correct the items below before saving.
                </Typography>
                {extractedItems.map((item, index) => (
                  <Box key={index}>
                    <Grid container spacing={2} sx={{ alignItems: 'center', mb: 2 }}>
                      <Grid>
                        <TextField fullWidth label="Item Name" name="name" value={item.name} onChange={(e) => handleItemChange(index, 'name', e.target.value)} />
                      </Grid>
                      <Grid>
                        <TextField fullWidth label="Price" name="price" type="number" value={item.price} onChange={(e) => handleItemChange(index, 'price', e.target.value)} />
                      </Grid>
                      <Grid>
                        <TextField fullWidth label="Quantity" name="quantity" type="number" value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', e.target.value)} />
                      </Grid>
                      <Grid>
                        <TextField fullWidth label="Unit" name="unit" value={item.unit} onChange={(e) => handleItemChange(index, 'unit', e.target.value)} />
                      </Grid>
                      <Grid sx={{ textAlign: 'center' }}>
                        <IconButton aria-label="delete" onClick={() => handleRemoveItem(index)}>
                          <DeleteIcon />
                        </IconButton>
                      </Grid>
                    </Grid>
                    {index < extractedItems.length - 1 && <Divider sx={{ my: 1 }} />}
                  </Box>
                ))}
              </CardContent>
              <CardActions>
                <Button onClick={handleDataSubmit} disabled={isLoading} fullWidth variant="contained" color="primary">
                  {isLoading ? <CircularProgress size={24} /> : "Save All Items"}
                </Button>
              </CardActions>
            </Card>
          )}
        </Box>
      </Box>
    </Container>
  );
}

