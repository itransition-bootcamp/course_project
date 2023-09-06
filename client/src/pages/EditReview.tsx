import {
  Box,
  Button,
  Container,
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
import TagsAutocomplete from "../components/TagsAutocomplete";
import ReviewGallery from "../components/ReviewGallery";

const EditReview: FC = () => {
  const { state } = useNavigation();
  const { user, loading: loadingAuth } = useAuth();
  const fetcher = useFetcher();
  const review = useOutletContext() as Review;

  const [title, setTitle] = useState(() => review.title);
  const [body, setbody] = useState(() => review.text);
  const [rating, setRating] = useState(() => review.rating);
  const [isPreview, setIsPreview] = useState(false);

  const isAuthor = user?.id == review.UserId || user?.role == "admin";
  if (state == "loading" || loadingAuth) return <LoadingSpinner />;
  if (!isAuthor) return <Navigate to={"/"} />;
  return (
    <Container sx={{ mt: 2 }}>
      <fetcher.Form
        method="put"
        autoComplete="off"
        style={{ display: "flex", flexDirection: "column", rowGap: 10 }}
      >
        <TextField
          name="reviewTitle"
          placeholder="Title"
          fullWidth
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          sx={{ mb: 1 }}
        />
        {isPreview ? (
          <Box
            sx={{
              p: 2,
              border: 1,
              borderRadius: 1,
              borderColor: "action.disabled",
            }}
          >
            <MuiMarkdown>{body}</MuiMarkdown>
          </Box>
        ) : (
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
        )}
        <Button
          variant="outlined"
          onClick={() => setIsPreview((prev) => !prev)}
        >
          Markdown Preview
        </Button>
        <Box display={"flex"} mb={1}>
          <Typography display={"inline"}>Rating: </Typography>
          <Rating
            name="reviewRating"
            value={rating / 2}
            precision={0.5}
            onChange={(_, value) => value && setRating(value * 2)}
          />
        </Box>

        <TagsAutocomplete tags={review.Tags?.map((tag) => tag.name)} />
        <ReviewGallery images={review.Review_Images} canEdit={true} />
        <Button fullWidth type="submit" variant="contained">
          Finish Editing
        </Button>
      </fetcher.Form>
    </Container>
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
        tags: JSON.parse(formData.get("reviewTags") as string),
      }),
    });
  }
  return redirect("../");
};

export default EditReview;
