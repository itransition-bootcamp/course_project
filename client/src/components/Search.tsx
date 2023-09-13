import { SearchOutlined } from "@mui/icons-material";
import {
  Popper,
  TextField,
  Link,
  alpha,
  debounce,
  styled,
  List,
  ListItem,
  ClickAwayListener,
  Paper,
} from "@mui/material";
import { FC, useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { Review } from "../types";
import { FormattedMessage } from "react-intl";
import { isMobile } from "react-device-detect";

const SearchBar = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  "&:hover": {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  width: "100%",
  [theme.breakpoints.up("sm")]: {
    width: "20ch",
  },
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  paddingLeft: `calc(1em + ${theme.spacing(4)})`,
  "& .MuiInputBase-root": {
    color: "inherit",
  },
}));

const Search: FC = () => {
  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [options, setOptions] = useState<Review[]>([]);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    setOpen(true);
  };
  const fetchOptions = useMemo(
    () =>
      debounce(async (newInputValue) => {
        const res = await fetch("/api/search", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            search: newInputValue,
            limit: isMobile ? 10 : 20,
          }),
        });
        const json = await res.json();
        setOptions(json);
      }, 500),
    []
  );

  return (
    <SearchBar>
      <SearchIconWrapper>
        <SearchOutlined />
      </SearchIconWrapper>
      <StyledTextField
        variant="standard"
        autoComplete="off"
        onClick={handleClick}
        onChange={(e) => {
          if (e.target.value == "") setOptions([]);
          else fetchOptions(e.target.value);
        }}
        InputProps={{
          disableUnderline: true,
        }}
      />
      <ClickAwayListener onClickAway={() => setOpen(false)}>
        <Popper
          open={open}
          anchorEl={anchorEl}
          placement="bottom-start"
          sx={{ p: 3 }}
        >
          <List component={Paper} elevation={8}>
            {options.length > 0 ? (
              options.map((option) => (
                <ListItem
                  key={option.id}
                  dense={!isMobile}
                  sx={{
                    "&:hover": {
                      bgcolor: "primary.light",
                      color: "primary.contrastText",
                    },
                  }}
                >
                  <Link
                    width={"100%"}
                    component={RouterLink}
                    to={"/reviews/" + option.id}
                    underline="none"
                    color={"inherit"}
                    onClick={() => setOpen(false)}
                  >
                    {option.title}
                  </Link>
                </ListItem>
              ))
            ) : (
              <ListItem>
                <FormattedMessage id="app.header.search.noResults" />
              </ListItem>
            )}
          </List>
        </Popper>
      </ClickAwayListener>
    </SearchBar>
  );
};

export default Search;
