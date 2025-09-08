"use client";
import React, { useState } from "react";
import {
  Container,
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

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

export default function Upload() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
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
    formData.append("image", selectedFile, selectedFile?.name || "default.png");

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (response.ok) {
        setSuccessMessage(
          `File uploaded successfully: ${JSON.stringify(result)}`
        );
      } else {
        throw new Error(result.error || "Unknown error");
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "An error occurred while uploading the file."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography component="h1" variant="h5">
          Upload Document
        </Typography>
        <Typography component="p" sx={{ mt: 1, mb: 2 }}>
          Select a file from your device to begin processing.
        </Typography>

        <Box sx={{ mt: 3 }}>
          <Button
            component="label"
            variant="contained"
            startIcon={<CloudUploadIcon />}
          >
            Select File
            <VisuallyHiddenInput type="file" onChange={handleFileChange} />
          </Button>
          {selectedFile && (
            <Typography variant="body2" sx={{ mt: 2 }}>
              Selected file: {selectedFile.name}
            </Typography>
          )}

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
          {successMessage && (
            <Alert severity="success" sx={{ mt: 2 }}>
              {successMessage}
            </Alert>
          )}

          <Button
            onClick={handleFileUpload}
            disabled={!selectedFile || isLoading}
            fullWidth
            variant="contained"
            sx={{ mt: 3 }}
          >
            {isLoading ? <CircularProgress size={24} /> : "Upload File"}
          </Button>
        </Box>
      </Box>
    </Container>
  );
}