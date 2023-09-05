import {
  Button,
  Card,
  Grid,
  Rating,
  TextField,
  Typography,
} from "@mui/material";
import MuiMarkdown from "mui-markdown";
import { FC, useState } from "react";
import {
  ActionFunction,
  Navigate,
  redirect,
  useFetcher,
  useNavigation,
  useOutletContext,
} from "react-router-dom";
import { Review } from "../types";
import { useAuth } from "../components/AuthProvider";
import LoadingSpinner from "../components/LoadingSpinner";

const EditReview: FC = () => {
  const { state } = useNavigation();
  const { user, loading: loadingAuth } = useAuth();
  const fetcher = useFetcher();
  const review = useOutletContext() as Review;
  console.log(review);

  const [title, setTitle] = useState(() => review.title);
  const [body, setbody] = useState(() => review.text);
  const [rating, setRating] = useState(() => review.rating);

  const isAuthor = user?.id == review.UserId || user?.role == "admin";
  if (state == "loading" || loadingAuth) return <LoadingSpinner />;
  if (!isAuthor) return <Navigate to={"/"} />;
  return (
    <Grid container columns={2} p={2}>
      <Grid item pr={{ md: 2 }} xs={2} md={1}>
        <fetcher.Form method="put" autoComplete="off">
          <Rating
            name="reviewRating"
            value={rating / 2}
            precision={0.5}
            onChange={(_, value) => value && setRating(value * 2)}
            sx={{ mb: 1 }}
          />
          <TextField
            name="reviewTitle"
            placeholder="Title"
            fullWidth
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            sx={{ mb: 1 }}
          />
          <TextField
            multiline
            name="reviewText"
            placeholder="Write your review here"
            fullWidth
            label="Text"
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

export const editReviewAction: ActionFunction = async ({ params, request }) => {
  if (request.method == "PUT") {
    const formData = await request.formData();
    if (!formData.has("reviewTitle")) return null;
    if (!formData.has("reviewText")) return null;
    if (!formData.has("reviewRating")) return null;
    await fetch(`/api/reviews/${params.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: formData.get("reviewTitle"),
        text: formData.get("reviewText"),
        rating: parseFloat(formData.get("reviewRating") as string) * 2,
      }),
    });
  }
  return redirect("../");
};

export default EditReview;
