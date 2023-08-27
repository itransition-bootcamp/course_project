import { SearchOutlined } from "@mui/icons-material";
import {
  Autocomplete,
  InputBase,
  alpha,
  debounce,
  styled,
} from "@mui/material";
import { FC, SyntheticEvent, useMemo, useState } from "react";

const SearchBar = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  "&:hover": {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: theme.spacing(3),
  width: "100%",
  [theme.breakpoints.up("sm")]: {
    marginLeft: theme.spacing(3),
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

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create("width"),
    width: "100%",
    [theme.breakpoints.up("md")]: {
      width: "100ch",
    },
  },
}));

const Search: FC = () => {
  const [value, setValue] = useState<string | null>(null);
  const [options, setOptions] = useState<
    { id: number; title: string; text: string }[]
  >([]);

  const fetchOptions = useMemo(
    () =>
      debounce((newInputValue) => {
        return fetch("/api/search", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ search: newInputValue }),
        })
          .then((res) => res.json())
          .then((json) => {
            console.log(json);
            setOptions(json);
          });
      }, 500),
    []
  );

  return (
    <SearchBar>
      <SearchIconWrapper>
        <SearchOutlined />
      </SearchIconWrapper>
      <Autocomplete
        placeholder="Search…"
        options={options.map((o) => o.title)}
        filterOptions={(x) => x}
        autoComplete
        value={value}
        freeSolo
        onChange={(event: SyntheticEvent, newValue: string | null) => {
          setValue(newValue);
        }}
        onInputChange={(event, newInputValue) => {
          if (!newInputValue) return;
          fetchOptions(newInputValue);
        }}
        renderInput={(params) => (
          <StyledInputBase
            id={params.id}
            {...params.InputProps}
            fullWidth
            inputProps={params.inputProps}
            placeholder="Search"
          />
        )}
        renderOption={(props, option) => {
          return <li {...props}>{option}</li>;
        }}
      />
    </SearchBar>
  );
};

export default Search;
