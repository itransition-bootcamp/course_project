import { Facebook, GitHub } from "@mui/icons-material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { Divider } from "@mui/material";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { FC, FormEventHandler, ReactElement } from "react";
import { FormattedMessage } from "react-intl";

export const LoginRegisterForm: FC<{
  handleSubmit: FormEventHandler<HTMLFormElement>;
  text: string;
  rememberMe?: boolean;
  bottomLink: ReactElement;
}> = ({ handleSubmit, text, rememberMe = true, bottomLink }) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
        <LockOutlinedIcon />
      </Avatar>
      <Typography component="h1" variant="h5">
        {text}
      </Typography>
      <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
        <TextField
          margin="normal"
          required
          fullWidth
          id="username"
          label={<FormattedMessage id="app.loginRegister.label.username" />}
          name="username"
          autoFocus
        />
        <TextField
          margin="normal"
          required
          fullWidth
          name="password"
          label={<FormattedMessage id="app.loginRegister.label.password" />}
          type="password"
          id="password"
          autoComplete="current-password"
        />
        {rememberMe && (
          <FormControlLabel
            control={<Checkbox value="remember" />}
            label={<FormattedMessage id="app.loginRegister.label.rememberMe" />}
          />
        )}
        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 2, mb: 2 }}
        >
          {text}
        </Button>
        {bottomLink}
      </Box>
      <Box width={"100%"} sx={{ mt: 6 }}>
        <Divider>OR</Divider>
        <Button
          fullWidth
          href="/auth/github"
          variant="outlined"
          startIcon={<GitHub />}
          sx={{ mt: 1, mb: 2 }}
        >
          <FormattedMessage id="app.loginRegister.button.github" />
        </Button>
        <Button
          fullWidth
          href="/auth/facebook"
          variant="outlined"
          startIcon={<Facebook />}
        >
          <FormattedMessage id="app.loginRegister.button.facebook" />
        </Button>
      </Box>
    </Box>
  );
};
