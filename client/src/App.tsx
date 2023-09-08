import { CssBaseline, Paper, useMediaQuery } from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import {
  Route,
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
  redirect,
} from "react-router-dom";

import { useMemo } from "react";
import AuthProvider from "./components/AuthProvider";
import Header from "./components/Header";
import Home, { homePageLoader } from "./pages/Home";
import LogIn from "./pages/Login";
import Profile, { profilePageAction, profilePageLoader } from "./pages/Profile";
import Register from "./pages/Register";

import { Outlet } from "react-router-dom";
import AdminDashboard, {
  adminPageAction,
  adminPageLoader,
} from "./pages/AdminDashboard";
import EditReview, { editReviewAction } from "./pages/EditReview";
import Review from "./pages/Review";
import ReviewRoot, {
  reviewRootAction,
  reviewRootLoader,
} from "./pages/ReviewRoot";
import CreateReview, {
  CreateReviewAction,
  CreateReviewLoader,
} from "./pages/CreateReview";

function WithHeader() {
  return (
    <>
      <Header />
      <Outlet />
    </>
  );
}

function Root() {
  return (
    <Paper sx={{ minHeight: "100dvh" }}>
      <Outlet />
    </Paper>
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
      <Route element={<Root />}>
        <Route element={<WithHeader />}>
          <Route
            path="/:category?"
            element={<Home />}
            loader={homePageLoader}
          />
          <Route
            path="/admin"
            element={<AdminDashboard />}
            action={adminPageAction}
            loader={adminPageLoader}
          />
          <Route
            path="/profile/:id"
            element={<Profile />}
            action={profilePageAction}
            loader={profilePageLoader}
          />
          <Route
            path="/reviews/create"
            element={<CreateReview />}
            action={CreateReviewAction}
            loader={CreateReviewLoader}
          />
          <Route
            path="/reviews/:id"
            action={reviewRootAction}
            loader={reviewRootLoader}
            element={<ReviewRoot />}
            shouldRevalidate={({ formData, defaultShouldRevalidate }) => {
              if (formData?.get("intent") === "add comment") return false;
              else return defaultShouldRevalidate;
            }}
          >
            <Route path="" element={<Review />} />
            <Route
              path="edit"
              action={editReviewAction}
              element={<EditReview />}
            ></Route>
            <Route
              path="delete"
              action={async ({ params, request }) => {
                if (request.method == "DELETE") {
                  await fetch(`/api/reviews/${params.id}`, {
                    method: "DELETE",
                  });
                  return redirect("/");
                }
              }}
            ></Route>
          </Route>
        </Route>
        <Route element={<Outlet />}>
          <Route path="/login" element={<LogIn />} />
          <Route path="/register" element={<Register />} />
        </Route>
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
