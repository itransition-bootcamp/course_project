import { CssBaseline } from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import routes from "./routes";
import { useMemo } from "react";
import AuthProvider from "./components/AuthProvider";

import * as locales from "@mui/material/locale";
import { IntlProvider } from "react-intl";
import { useDarkMode, useLocalStorage } from "usehooks-ts";
import intlMessagesEN from "./translations/en.json";
import intlMessagesES from "./translations/es.json";
import intlMessagesPL from "./translations/pl.json";
import intlMessagesRU from "./translations/ru.json";
import intlMessagesUK from "./translations/uk.json";

function App() {
  const [locale] = useLocalStorage<keyof typeof localeMessages>(
    "locale",
    "enUS"
  );
  const { isDarkMode } = useDarkMode();

  const theme = useMemo(
    () =>
      createTheme(
        {
          palette: {
            mode: isDarkMode ? "dark" : "light",
          },
        },
        locales[locale]
      ),
    [isDarkMode, locale]
  );

  const localeMessages = {
    enUS: { locale: "en", messages: intlMessagesEN },
    ruRU: { locale: "ru", messages: intlMessagesRU },
    esES: { locale: "es", messages: intlMessagesES },
    ukUA: { locale: "uk", messages: intlMessagesUK },
    plPL: { locale: "pl", messages: intlMessagesPL },
  };

  const intlProps = localeMessages[locale] || localeMessages.enUS;

  const router = createBrowserRouter(routes);

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
