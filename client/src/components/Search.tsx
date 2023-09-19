import { ArrowBack, ArrowForward, SearchOutlined } from "@mui/icons-material";
import {
  ClickAwayListener,
  Link,
  List,
  ListItem,
  ListItemButton,
  Paper,
  Popper,
  TextField,
  alpha,
  styled,
} from "@mui/material";
import { FC, useEffect, useState } from "react";
import { isMobile } from "react-device-detect";
import { FormattedMessage } from "react-intl";
import { Link as RouterLink } from "react-router-dom";
import { Review } from "../types";
import { useDebounce } from "usehooks-ts";

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
  const [searchInput, setSearchInput] = useState<string>("");
  const debouncedSearchInput = useDebounce<string>(searchInput, 500);
  const [page, setPage] = useState(0);
  const limit = isMobile ? 10 : 20;
  const [totalOptions, setTotalOptions] = useState(0);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    if (open) return;
    setAnchorEl(event.currentTarget);
    setOpen(true);
  };

  useEffect(() => {
    if (!searchInput) {
      setOptions([]);
      return;
    }
    async function fetchData() {
      console.log("first");
      const res = await fetch(
        `/api/search?search=${searchInput}&limit=${limit}&offset=${
          limit * page
        }`
      );
      if (!res.ok || res.status == 204) {
        setOptions([]);
        return;
      }
      const resJson = await res.json();
      setTotalOptions(resJson.fullCount);
      setOptions(resJson.results);
    }
    fetchData();
  }, [debouncedSearchInput, page]);

  return (
    <ClickAwayListener onClickAway={() => setOpen(false)}>
      <SearchBar>
        <SearchIconWrapper>
          <SearchOutlined />
        </SearchIconWrapper>
        <StyledTextField
          variant="standard"
          autoComplete="off"
          onClick={handleClick}
          value={searchInput}
          onChange={(e) => {
            setPage(0);
            setSearchInput(e.target.value);
          }}
          InputProps={{
            disableUnderline: true,
          }}
        />
        <Popper
          open={open}
          anchorEl={anchorEl}
          placement="bottom-start"
          sx={{ p: 3 }}
        >
          {searchInput && (
            <List component={Paper} elevation={8}>
              {options.length > 0 ? (
                [
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
                  )),
                  <ListItem key="b">
                    <ListItemButton
                      sx={{ justifyContent: "center" }}
                      disabled={page < 1}
                      onClick={() => setPage((prev) => prev - 1)}
                    >
                      <ArrowBack fontSize="small" />
                    </ListItemButton>
                    <ListItemButton
                      sx={{ justifyContent: "center" }}
                      disabled={totalOptions / limit <= page + 1}
                      onClick={() => setPage((prev) => prev + 1)}
                    >
                      <ArrowForward fontSize="small" />
                    </ListItemButton>
                  </ListItem>,
                ]
              ) : (
                <ListItem>
                  <FormattedMessage id="app.header.search.noResults" />
                </ListItem>
              )}
            </List>
          )}
        </Popper>
      </SearchBar>
    </ClickAwayListener>
  );
};

export default Search;
