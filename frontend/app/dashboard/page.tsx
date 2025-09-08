import { Container, Typography } from "@mui/material";

export default function DashboardPage() {
  return (
    <Container>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>
      <Typography variant="body1">Welcome to your dashboard!</Typography>
    </Container>
  );
}