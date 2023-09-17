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
import { useIntl } from "react-intl";

export const Component: FC = () => {
  const { state } = useNavigation();
  const { user, loading: loadingAuth } = useAuth();
  const editForm = useFetcher();
  const review = useOutletContext() as Review;

  const [title, setTitle] = useState(() => review.title);
  const [body, setbody] = useState(() => review.text);
  const [rating, setRating] = useState(() => review.rating);
  const [isPreview, setIsPreview] = useState(false);
  const intl = useIntl();

  const isAuthor = user?.id == review.UserId || user?.role == "admin";
  if (state == "loading" || loadingAuth) return <LoadingSpinner />;
  if (!isAuthor) return <Navigate to={"/"} />;
  return (
    <Container sx={{ py: 2 }}>
      <editForm.Form
        method="put"
        autoComplete="off"
        style={{ display: "flex", flexDirection: "column", rowGap: 10 }}
      >
        <TextField
          name="reviewTitle"
          placeholder={intl.formatMessage({
            id: "app.createReview.placeholder.title",
          })}
          fullWidth
          required
          label={intl.formatMessage({ id: "app.createReview.label.title" })}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          sx={{ mb: 1 }}
        />
        {isPreview ? (
          <Box
            sx={{
              p: 2,
              border: 1,
              mb: 1,
              borderRadius: 1,
              borderColor: "action.disabled",
              minHeight: "263px",
            }}
          >
            <MuiMarkdown>{body}</MuiMarkdown>
          </Box>
        ) : (
          <TextField
            multiline
            name="reviewText"
            placeholder={intl.formatMessage({
              id: "app.createReview.placeholder.text",
            })}
            fullWidth
            label={intl.formatMessage({ id: "app.createReview.label.text" })}
            required
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
          {intl.formatMessage({ id: "app.createReview.button.preview" })}
        </Button>
        <Box display={"flex"} mb={1}>
          <Typography display={"inline"}>
            {intl.formatMessage({ id: "app.createReview.label.rating" })}
          </Typography>
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
          {intl.formatMessage({ id: "app.editReview.button.finish" })}
        </Button>
      </editForm.Form>
    </Container>
  );
};

export const action: ActionFunction = async ({ params, request }) => {
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
        gallery: JSON.parse(formData.get("reviewGallery") as string),
      }),
    });
  }
  return redirect("../");
};
