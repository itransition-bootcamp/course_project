import { SearchOutlined } from "@mui/icons-material";
import {
  Autocomplete,
  Popper,
  PopperProps,
  TextField,
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

const SearchPopper = function (props: PopperProps) {
  return (
    <Popper
      {...props}
      style={{
        padding: "20px",
        width: "fit-content",
      }}
    />
  );
};

const StyledTextField = styled(TextField)(({ theme }) => ({
  paddingLeft: `calc(1em + ${theme.spacing(4)})`,
  "& .MuiInputBase-root": {
    color: "inherit",
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
      <Autocomplete
        options={options.map((o) => o.text)}
        filterOptions={(x) => x}
        autoComplete
        value={value}
        freeSolo
        onChange={(_: SyntheticEvent, newValue: string | null) => {
          setValue(newValue);
        }}
        onInputChange={(_, newInputValue) => {
          if (!newInputValue) return;
          else fetchOptions(newInputValue);
        }}
        PopperComponent={SearchPopper}
        renderInput={(params) => (
          <>
            <SearchIconWrapper>
              <SearchOutlined />
            </SearchIconWrapper>
            <StyledTextField
              variant="standard"
              {...params}
              onFocus={() => setOptions([])}
              InputProps={{
                disableUnderline: true,
                ...params.InputProps,
              }}
            />
          </>
        )}
        renderOption={(props, option) => {
          return <li {...props}>{option}</li>;
        }}
      />
    </SearchBar>
  );
};

export default Search;
