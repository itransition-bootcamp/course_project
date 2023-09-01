import { Button, Card, Grid, TextField, Typography } from "@mui/material";
import MuiMarkdown from "mui-markdown";
import { FC, useState } from "react";
import { useFetcher } from "react-router-dom";
import { Review } from "../types";

const EditReview: FC<{ review: Review }> = ({ review }) => {
  const fetcher = useFetcher();
  const [title, setTitle] = useState(() => review.title);
  const [body, setbody] = useState(() => review.text);

  return (
    <Grid container columns={2}>
      <Grid item pr={{ md: 2 }} xs={2} md={1}>
        <fetcher.Form method="put" autoComplete="off">
          <TextField
            name="reviewTitle"
            placeholder="Title"
            fullWidth
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            sx={{ mb: 1 }}
          />
          <TextField
            multiline
            name="reviewText"
            placeholder="Write your review here"
            fullWidth
            minRows={10}
            value={body}
            onChange={(e) => setbody(e.target.value)}
            sx={{ mb: 1 }}
          />
          <Button fullWidth type="submit" variant="contained">
            Finish Editing
          </Button>
        </fetcher.Form>
      </Grid>
      <Grid item xs={2} md={1} p={1} component={Card}>
        <Typography variant="h3">{title ? title : "Title..."}</Typography>
        <MuiMarkdown>{body}</MuiMarkdown>
      </Grid>
    </Grid>
  );
};

export default EditReview;
