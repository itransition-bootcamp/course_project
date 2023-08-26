import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Box from "@mui/material/Box";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import { FC, FormEventHandler, ReactElement } from "react";
import { Divider } from "@mui/material";
import { GitHub } from "@mui/icons-material";

export const LoginRegisterForm: FC<{
  handleSubmit: FormEventHandler<HTMLFormElement>;
  text: string;
  rememberMe?: boolean;
  bottomLink: ReactElement;
}> = ({ handleSubmit, text, rememberMe = true, bottomLink }) => {
  return (
    <Box
      sx={{
        marginTop: 8,
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
          label="User Name"
          name="username"
          autoFocus
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
        />
        {rememberMe && (
          <FormControlLabel
            control={<Checkbox value="remember" />}
            label="Remember me"
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
          sign in with github
        </Button>
      </Box>
    </Box>
  );
};
