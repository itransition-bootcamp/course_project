import Container from "@mui/material/Container";
import { Alert, AlertTitle, Link, Snackbar } from "@mui/material";
import { useState } from "react";
import { LoginRegisterForm } from "../components/LoginRegisterForm";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../components/AuthProvider";

const LogIn = () => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const { authenticated, login } = useAuth();

  const handleClose = (_: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === "clickaway") {
      return;
    }

    setOpen(false);
  };
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const response = await login(data.get("username"), data.get("password"));

    if (response.success) {
      navigate("/");
    } else {
      if (response.message) {
        setMessage(response.message);
        setOpen(true);
      }
    }
  };

  if (authenticated) return <Navigate to="/" />;
  return (
    <Container component="main" maxWidth="xs">
      <LoginRegisterForm
        handleSubmit={handleSubmit}
        text="Sign in"
        bottomLink={
          <Link href="/register" variant="body2">
            {"Don't have an account? Sign Up"}
          </Link>
        }
      />
      <Snackbar
        open={open}
        autoHideDuration={3000}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        onClose={handleClose}
      >
        <Alert onClose={handleClose} severity="error">
          <AlertTitle>Error</AlertTitle>
          {message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default LogIn;
