import { Autocomplete, Box, Input, TextField } from "@mui/material";
import { FC, useEffect, useState } from "react";

const TagsAutocomplete: FC<{ tags?: string[] }> = ({ tags }) => {
  const [options, setOptions] = useState([]);
  const [inputTags, setInputTags] = useState(() => tags);
  useEffect(() => {
    fetch("/api/tags")
      .then((resp) => resp.json())
      .then((tags) =>
        setOptions(
          tags.map((tag: { value: string; count: number }) => tag.value)
        )
      );
  }, []);
  return (
    <Box>
      <Autocomplete
        multiple
        freeSolo
        limitTags={3}
        options={options}
        value={inputTags}
        onChange={(_, newVal) => setInputTags(newVal)}
        renderInput={(params) => (
          <TextField {...params} variant="outlined" label="Tags:" />
        )}
      />
      <Input
        name="reviewTags"
        type="hidden"
        value={JSON.stringify(inputTags)}
        sx={{ display: "none" }}
      />
    </Box>
  );
};

export default TagsAutocomplete;
