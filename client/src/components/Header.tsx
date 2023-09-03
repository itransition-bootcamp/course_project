import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Menu from "@mui/material/Menu";
import { FC, useState } from "react";
import { useAuth } from "./AuthProvider";
import {
  Avatar,
  Button,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import Search from "./Search";
import { NavLink, useNavigate } from "react-router-dom";
import { Games, Home, LibraryBooks, Movie } from "@mui/icons-material";

const Header: FC = () => {
  const { user, authenticated, loading, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [drawerOpened, setDrawerOpened] = useState(false);
  const navigate = useNavigate();

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    setAnchorEl(null);
    navigate("/");
  };

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
                      bgcolor: "ActiveBorder",
                    },
                  }}
                >
                  <ListItemIcon>
                    {text === "Home" && <Home />}
                    {text === "Movies" && <Movie />}
                    {text === "Books" && <LibraryBooks />}
                    {text === "Games" && <Games />}
                  </ListItemIcon>
                  <ListItemText primary={text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Drawer>
        <Search />
        {!authenticated && !loading && (
          <Button
            variant="contained"
            sx={{ marginLeft: "auto" }}
            onClick={() => navigate("/login")}
          >
            Login
          </Button>
        )}
        {authenticated && (
          <Box
            sx={{ display: "flex", alignItems: "center", marginLeft: "auto" }}
          >
            <Typography variant="h6" mr={2}>
              {user?.username}
            </Typography>
            <Avatar
              onClick={handleMenu}
              alt={user?.username}
              src={user?.avatar}
            >
              {user?.username.charAt(0)}
            </Avatar>

            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem
                onClick={() => {
                  navigate("/profile/" + user?.id);
                  handleClose();
                }}
              >
                Profile
              </MenuItem>
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;
