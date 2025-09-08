"use client";

import { Container, Box, Typography, Button, Paper } from "@mui/material";
import Link from "next/link";
import KitchenIcon from '@mui/icons-material/Kitchen';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import LightbulbIcon from '@mui/icons-material/Lightbulb';

export default function AboutPage() {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          minHeight: 'calc(100vh - 160px)',
        }}
      >
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold', mt: 2 }}>
          Welcome to SmartKitchenBuddy
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
          Never wonder what to cook again. Keep track of your ingredients, get smart recipe suggestions, and simplify your grocery trips.
        </Typography>

        {/* --- MODIFIED LAYOUT SECTION --- */}
        <Box
          sx={{
            my: 3,
            width: '100%',
            display: 'grid',
            gap: 3,
            // Responsive grid columns: 1 on mobile, 3 on larger screens
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(3, 1fr)',
            },
          }}
        >
          {/* Feature 1 */}
          <Paper elevation={2} sx={{ p: 2, borderRadius: 2 }}>
            <KitchenIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h6" component="h3" sx={{ fontSize: '1.15rem', fontWeight: 'bold' }} gutterBottom>
              Inventory Your Ingredients
            </Typography>
            <Typography variant="body2">
              Easily log the ingredients you have at home. Your virtual pantry is always up-to-date.
            </Typography>
          </Paper>

          {/* Feature 2 */}
          <Paper elevation={2} sx={{ p: 2, borderRadius: 2 }}>
            <LightbulbIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h6" component="h3" sx={{ fontSize: '1.15rem', fontWeight: 'bold' }} gutterBottom>
              Get Recipe Suggestions
            </Typography>
            <Typography variant="body2">
              Our app suggests delicious recipes based on the ingredients you already have.
            </Typography>
          </Paper>

          {/* Feature 3 */}
          <Paper elevation={2} sx={{ p: 2, borderRadius: 2 }}>
            <ReceiptLongIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h6" component="h3" sx={{ fontSize: '1.15rem', fontWeight: 'bold' }} gutterBottom>
              Upload Your Receipts
            </Typography>
            <Typography variant="body2">
              Simply upload a photo of your grocery receipt, and we will automatically add the items to your inventory.
            </Typography>
          </Paper>
        </Box>
        <Button
          component={Link}
          href="/login"
          variant="contained"
          size="large"
          sx={{ mt: 3, px: 4, py: 1.2, borderRadius: '50px', textTransform: 'none', fontSize: '1rem' }}
        >
          Get Started for Free
        </Button>
      </Box>
    </Container>
  );
}