"use client";

import React from "react";
import {
  Typography,
  TextField,
  Box,
  IconButton,
  Collapse,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  Button,
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

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

interface InventoryProps {
  filteredAndGroupedItems: Record<string, ReceiptItem[]>;
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  openCategories: Record<string, boolean>;
  toggleCategory: (category: string) => void;
  selectedItems: ReceiptItem[];
  handleSelectItem: (item: ReceiptItem, isSelected: boolean) => void;
  handleSelectAllInCategory: (items: ReceiptItem[], areAllSelected: boolean) => void;
  router: AppRouterInstance;
}

export default function Inventory({
  filteredAndGroupedItems,
  searchTerm,
  onSearchTermChange,
  openCategories,
  toggleCategory,
  selectedItems,
  handleSelectItem,
  handleSelectAllInCategory,
  router,
}: InventoryProps) {
  return (
    <>
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
          onChange={(e) => onSearchTermChange(e.target.value)}
        />
      </Box>

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
          <Button variant="contained" onClick={() => router.push("/upload")}>
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
                                selectedInCategory.length > 0 && !areAllSelected
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
                                "&:last-child td, &:last-child th": { border: 0 },
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
                              <TableCell align="right">{item.unit}</TableCell>
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
    </>
  );
}
