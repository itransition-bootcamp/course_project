import Container from "@mui/material/Container";
import { Alert, AlertTitle, Link, Snackbar } from "@mui/material";
import { useState } from "react";
import { LoginRegisterForm } from "../components/LoginRegisterForm";
import { useNavigate, Link as RouterLink, Navigate } from "react-router-dom";
import { useAuth } from "../components/AuthProvider";
import { useIntl } from "react-intl";

const Register = () => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const { authenticated, register } = useAuth();
  const intl = useIntl();

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
  if (authenticated) return <Navigate to="/" />;
  return (
    <Container component="main" maxWidth="xs" sx={{ pt: 10 }}>
      <LoginRegisterForm
        handleSubmit={handleSubmit}
        text={intl.formatMessage({ id: "app.loginRegister.button.signup" })}
        rememberMe={false}
        bottomLink={
          <Link component={RouterLink} to="/login" variant="body2">
            {intl.formatMessage({
              id: "app.loginRegister.bottomLink.toSignin",
            })}
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
