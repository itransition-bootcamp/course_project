import {
  Route,
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
} from "react-router-dom";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { CssBaseline, useMediaQuery } from "@mui/material";

import Home from "./pages/Home";
import LogIn from "./pages/Login";
import Register from "./pages/Register";
import AuthProvider from "./components/AuthProvider";
import Header from "./components/Header";
import { useMemo } from "react";

import { Outlet } from "react-router-dom";
import Review from "./pages/Review";

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
          <Route
            path="/"
            element={<Home />}
            loader={async ({ request }) => {
              const topReviews = await fetch("/api/reviews?top&limit=10", {
                signal: request.signal,
              }).then((res) => res.json());
              const lastReviews = await fetch("/api/reviews?limit=10", {
                signal: request.signal,
              }).then((res) => res.json());
              return [topReviews, lastReviews];
            }}
          />
          <Route
            path="/reviews/:id"
            element={<Review />}
            action={async ({ request }) => {
              const formData = await request.formData();
              if (!formData.get("reviewText")) return null;
              return fetch("/api/reviews", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  title: formData.get("reviewTitle"),
                  text: formData.get("reviewText"),
                }),
              });
            }}
            loader={async ({ params, request }) => {
              return fetch(`/api/reviews/${params.id}?user&comments`, {
                signal: request.signal,
              });
            }}
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
        <RouterProvider router={router} />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
