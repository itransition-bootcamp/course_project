import { Avatar, Box, Menu, MenuItem, Typography } from "@mui/material";
import { useState } from "react";
import { FormattedMessage } from "react-intl";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthProvider";

const ProfileMenu = () => {
  const { user, authenticated, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
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
  if (!authenticated) return null;
  else
    return (
      <Box sx={{ display: "flex", alignItems: "center", marginLeft: "auto" }}>
        <Typography variant="h6" mr={2}>
          {user?.username}
        </Typography>
        <Avatar onClick={handleMenu} alt={user?.username} src={user?.avatar}>
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
          {user?.role == "admin" && (
            <MenuItem
              onClick={() => {
                navigate("/admin");
                handleClose();
              }}
            >
              <FormattedMessage id="app.header.profileMenu.admin" />
            </MenuItem>
          )}
          <MenuItem
            onClick={() => {
              navigate("/profile/" + user?.id);
              handleClose();
            }}
          >
            <FormattedMessage id="app.header.profileMenu.profile" />
          </MenuItem>
          <MenuItem onClick={handleLogout}>
            <FormattedMessage id="app.header.profileMenu.logout" />
          </MenuItem>
        </Menu>
      </Box>
    );
};

export default ProfileMenu;
