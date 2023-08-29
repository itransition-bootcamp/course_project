import { Button, Grid, TextField, Typography } from "@mui/material";
import MuiMarkdown from "mui-markdown";
import { useState } from "react";
import { useFetcher } from "react-router-dom";

const EditReview = () => {
  const fetcher = useFetcher();
  const [body, setbody] = useState("");
  const [title, setTitle] = useState("");

  return (
    <Grid container columns={2} bgcolor={"InactiveBorder"}>
      <Grid item pr={2} xs={2} md={1}>
        <fetcher.Form method="post">
          <TextField
            name="reviewTitle"
            placeholder="Title"
            fullWidth
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <TextField
            multiline
            name="reviewText"
            placeholder="Write your review here"
            fullWidth
            minRows={10}
            value={body}
            onChange={(e) => setbody(e.target.value)}
          />
          <Button fullWidth type="submit" variant="contained">
            Finish Review
          </Button>
        </fetcher.Form>
      </Grid>
      <Grid item xs={2} md={1}>
        <Typography variant="h3">{title ? title : "Title..."}</Typography>
        <MuiMarkdown>{body}</MuiMarkdown>
      </Grid>
    </Grid>
  );
};

export default EditReview;
