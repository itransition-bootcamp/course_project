import {
  Route,
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
} from "react-router-dom";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { CssBaseline, Paper, useMediaQuery } from "@mui/material";

import Home, { homePageLoader } from "./pages/Home";
import Profile, { profilePageLoader } from "./pages/Profile";
import LogIn from "./pages/Login";
import Register from "./pages/Register";
import AuthProvider from "./components/AuthProvider";
import Header from "./components/Header";
import { useMemo } from "react";

import { Outlet } from "react-router-dom";
import Review, { reviewPageAction, reviewPageLoader } from "./pages/Review";

function WithHeader() {
  return (
    <>
      <Header />
      <Outlet />
    </>
  );
}

function App() {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: prefersDarkMode ? "dark" : "light",
        },
      }),
    [prefersDarkMode]
  );

  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/">
        <Route path="/" element={<WithHeader />}>
          <Route path="/" element={<Home />} loader={homePageLoader} />
          <Route
            path="/profile/:id"
            element={<Profile />}
            loader={profilePageLoader}
          />
          <Route
            path="/reviews/:id"
            element={<Review />}
            action={reviewPageAction}
            loader={reviewPageLoader}
          ></Route>
        </Route>
        <Route path="/login" element={<LogIn />} />
        <Route path="/register" element={<Register />} />
      </Route>
    )
  );
  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <CssBaseline />
        <Paper sx={{ minHeight: "100dvh" }}>
          <RouterProvider router={router} />
        </Paper>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
