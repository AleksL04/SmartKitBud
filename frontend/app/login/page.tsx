"use client"; // This is a client component

import { useState, useRef, FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Link,
  CircularProgress,
  Alert,
} from "@mui/material";

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const passwordInputRef = useRef<HTMLInputElement>(null);
  const passwordConfirmInputRef = useRef<HTMLInputElement>(null);

  // This function calls the secure backend route
  const handleLogin = async () => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to log in.");
      }

      // On success, redirect to the dashboard
      router.push("/dashboard");
      router.refresh(); // Forces a refresh to update server-side auth checks
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async () => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    if (password !== passwordConfirm) {
      setError("Passwords do not match.");
      setIsLoading(false);
      return;
    }

    try {
      // Also uses a secure backend route
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, passwordConfirm }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to sign up.");
      }

      // On success, show a message and switch to the login form
      setSuccessMessage("Account created! Please log in.");
      setIsSignUp(false);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSignUp) {
      handleSignUp();
    } else {
      handleLogin();
    }
  };

  const isButtonDisabled =
    isLoading ||
    !email.trim() ||
    !password.trim() ||
    (isSignUp && !passwordConfirm.trim());

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography component="h1" variant="h5">
          {isSignUp ? "Create an Account" : "Welcome Back"}
        </Typography>
        <Typography component="p" sx={{ mt: 1, mb: 2 }}>
          {isSignUp
            ? "Get started with your new account."
            : "Please enter your details to log in."}
        </Typography>

        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            inputRef={passwordInputRef}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {isSignUp && (
            <TextField
              margin="normal"
              required
              fullWidth
              name="passwordConfirm"
              label="Confirm Password"
              type="password"
              id="passwordConfirm"
              inputRef={passwordConfirmInputRef}
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
            />
          )}

          {error && <Alert severity="error">{error}</Alert>}
          {successMessage && <Alert severity="success">{successMessage}</Alert>}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={isButtonDisabled}
          >
            {isLoading ? (
              <CircularProgress size={24} />
            ) : isSignUp ? (
              "Create Account"
            ) : (
              "Log In"
            )}
          </Button>
          <Typography variant="body2" align="center">
            {isSignUp ? "Already have an account? " : "Don't have an account? "}
            <Link
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setIsSignUp(!isSignUp);
                setError(null);
                setSuccessMessage(null);
              }}
            >
              {isSignUp ? "Log In" : "Sign Up"}
            </Link>
          </Typography>
        </Box>
      </Box>
    </Container>
  );
}