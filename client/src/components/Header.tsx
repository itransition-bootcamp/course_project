import {
  DarkMode,
  Games,
  Home,
  LibraryBooks,
  LightMode,
  Movie,
} from "@mui/icons-material";
import MenuIcon from "@mui/icons-material/Menu";
import {
  Button,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Select,
} from "@mui/material";
import AppBar from "@mui/material/AppBar";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import Toolbar from "@mui/material/Toolbar";
import { FC, useState } from "react";
import { FormattedMessage } from "react-intl";
import { NavLink, useNavigate } from "react-router-dom";
import { useDarkMode, useLocalStorage } from "usehooks-ts";
import { useAuth } from "./AuthProvider";
import ProfileMenu from "./ProfileMenu";
import Search from "./Search";

const Header: FC = () => {
  const { authenticated, loading } = useAuth();
  const [drawerOpened, setDrawerOpened] = useState(false);
  const [locale, setLocale] = useLocalStorage("locale", "enUS");
  const { isDarkMode, toggle: toggleDarkMode } = useDarkMode();
  const navigate = useNavigate();

  return (
    <AppBar position="sticky">
      <Toolbar>
        <IconButton
          size="large"
          edge="start"
          color="inherit"
          aria-label="menu"
          sx={{ mr: 2 }}
          onClick={() => setDrawerOpened((prev) => !prev)}
        >
          <MenuIcon />
        </IconButton>
        <Drawer
          anchor={"left"}
          open={drawerOpened}
          onClose={() => setDrawerOpened((prev) => !prev)}
        >
          <List sx={{ width: 250 }}>
            {["Home", "Movies", "Books", "Games"].map((text) => (
              <ListItem key={text} onClick={() => setDrawerOpened(false)}>
                <ListItemButton
                  component={NavLink}
                  to={text === "Home" ? "/" : text.toLowerCase()}
                  sx={{
                    "&.active": {
                      bgcolor: "action.selected",
                    },
                  }}
                >
                  <ListItemIcon>
                    {text === "Home" && <Home />}
                    {text === "Movies" && <Movie />}
                    {text === "Books" && <LibraryBooks />}
                    {text === "Games" && <Games />}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <FormattedMessage id={`app.header.drawer.${text}`} />
                    }
                  />
                </ListItemButton>
              </ListItem>
            ))}
            <ListItem>
              <Select
                size="small"
                fullWidth
                value={locale}
                onChange={(e) => {
                  setLocale(e.target.value);
                  setDrawerOpened(false);
                }}
              >
                <MenuItem value="enUS">English</MenuItem>
                <MenuItem value="plPL">Polski</MenuItem>
                <MenuItem value="ukUA">Українська</MenuItem>
                <MenuItem value="ruRU">Русский</MenuItem>
                <MenuItem value="esES">Español</MenuItem>
              </Select>
            </ListItem>
            <ListItem>
              <ListItemButton
                onClick={() => {
                  toggleDarkMode();
                  setDrawerOpened(false);
                }}
              >
                <ListItemText
                  primary={
                    <FormattedMessage id={"app.header.drawer.themeToggle"} />
                  }
                />
                <ListItemIcon>
                  {isDarkMode ? <DarkMode /> : <LightMode />}
                </ListItemIcon>
              </ListItemButton>
            </ListItem>
          </List>
        </Drawer>
        <Search />
        {!authenticated && !loading && (
          <Button
            variant="contained"
            sx={{ marginLeft: "auto" }}
            onClick={() => navigate("/login")}
          >
            <FormattedMessage id="app.header.button.login" />
          </Button>
        )}
        <ProfileMenu />
      </Toolbar>
    </AppBar>
  );
};

export default Header;
