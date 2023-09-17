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
import LogIn from "./pages/Login";
import Register from "./pages/Register";

import { Outlet } from "react-router-dom";
import * as locales from "@mui/material/locale";
import intlMessagesEN from "./translations/en.json";
import intlMessagesRU from "./translations/ru.json";
import intlMessagesES from "./translations/es.json";
import intlMessagesUK from "./translations/uk.json";
import intlMessagesPL from "./translations/pl.json";
import { useLocalStorage } from "usehooks-ts";
import { IntlProvider } from "react-intl";

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
  const [locale] = useLocalStorage<keyof typeof locales>("locale", "enUS");

  const theme = useMemo(
    () =>
      createTheme(
        {
          palette: {
            mode: prefersDarkMode ? "dark" : "light",
          },
        },
        locales[locale]
      ),
    [prefersDarkMode, locale]
  );

  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route element={<Root />}>
        <Route element={<WithHeader />}>
          <Route path="/:category?" lazy={() => import("./pages/Home")} />
          <Route path="/admin" lazy={() => import("./pages/AdminDashboard")} />
          <Route path="/profile/:id" lazy={() => import("./pages/Profile")} />
          <Route
            path="/reviews/create"
            lazy={() => import("./pages/CreateReview")}
          />
          <Route
            path="/reviews/:id"
            lazy={() => import("./pages/ReviewRoot")}
            shouldRevalidate={({ formData, defaultShouldRevalidate }) => {
              if (formData?.get("intent") === "add comment") return false;
              else return defaultShouldRevalidate;
            }}
          >
            <Route path="" lazy={() => import("./pages/Review")} />
            <Route
              path="edit"
              lazy={() => import("./pages/EditReview")}
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
  let intlProps = {
    locale: "en",
    messages: intlMessagesEN,
  };
  if (locale == "ruRU") intlProps = { locale: "ru", messages: intlMessagesRU };
  if (locale == "esES") intlProps = { locale: "es", messages: intlMessagesES };
  if (locale == "ukUA") intlProps = { locale: "uk", messages: intlMessagesUK };
  if (locale == "plPL") intlProps = { locale: "pl", messages: intlMessagesPL };
  return (
    <IntlProvider locale={intlProps.locale} messages={intlProps.messages}>
      <ThemeProvider theme={theme}>
        <AuthProvider>
          <CssBaseline />
          <RouterProvider router={router} />
        </AuthProvider>
      </ThemeProvider>
    </IntlProvider>
  );
}

export default App;
