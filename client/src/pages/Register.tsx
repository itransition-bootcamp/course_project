import Container from "@mui/material/Container";
import { Alert, AlertTitle, Link, Snackbar } from "@mui/material";
import { useState } from "react";
import { LoginRegisterForm } from "../components/LoginRegisterForm";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { useAuth } from "../components/AuthProvider";

const Register = () => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleClose = (_: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === "clickaway") {
      return;
    }

    setOpen(false);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const response = await register(data.get("username"), data.get("password"));
    if (response.success) {
      navigate("/");
    } else {
      if (response.message) {
        setMessage(response.message);
        setOpen(true);
      }
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <LoginRegisterForm
        handleSubmit={handleSubmit}
        text="Sign up"
        rememberMe={false}
        bottomLink={
          <Link component={RouterLink} to="/login" variant="body2">
            {"Already have an account? Sign In"}
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

export default Register;
