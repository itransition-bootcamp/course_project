import {
  Box,
  Button,
  Container,
  FormControl,
  InputLabel,
  ListSubheader,
  MenuItem,
  Rating,
  Select,
  SelectChangeEvent,
  TextField,
  Typography,
} from "@mui/material";
import MuiMarkdown from "mui-markdown";
import { FC, useCallback, useState } from "react";
import {
  ActionFunction,
  LoaderFunction,
  Navigate,
  redirect,
  useFetcher,
  useLoaderData,
  useNavigation,
} from "react-router-dom";
import { useAuth } from "../components/AuthProvider";
import LoadingSpinner from "../components/LoadingSpinner";
import TagsAutocomplete from "../components/TagsAutocomplete";
import ReviewGallery from "../components/ReviewGallery";
import { Product } from "../types";

const CreateReview: FC = () => {
  const { state } = useNavigation();
  const { authenticated, loading: loadingAuth } = useAuth();
  const createForm = useFetcher();
  const products = useLoaderData() as Product[];

  const categories = Array.from(
    new Set(products.map((product) => product.category))
  );

  const [title, setTitle] = useState("");
  const [body, setbody] = useState("");
  const [rating, setRating] = useState(0);
  const [isPreview, setIsPreview] = useState(false);

  const [productId, setProductId] = useState("");
  const handleChange = (event: SelectChangeEvent) => {
    setProductId(event.target.value as string);
  };

  const renderSelectGroup = useCallback(
    (cat: string) => {
      const items = products
        .filter((p) => p.category == cat)
        .map((p) => {
          return (
            <MenuItem key={p.id} value={p.id}>
              {p.name}
            </MenuItem>
          );
        });
      return [<ListSubheader>{cat}</ListSubheader>, items];
    },
    [products]
  );

  if (state == "loading" || loadingAuth) return <LoadingSpinner />;
  if (!authenticated) return <Navigate to={"/"} />;
  return (
    <Container sx={{ py: 2 }}>
      <createForm.Form
        method="POST"
        autoComplete="off"
        style={{ display: "flex", flexDirection: "column", rowGap: 10 }}
      >
        <FormControl fullWidth>
          <InputLabel id="productId-label">Review Subject</InputLabel>
          <Select
            labelId="productId-label"
            id="productId"
            name="productId"
            value={productId}
            label="Review Subject"
            onChange={handleChange}
            required
          >
            {categories.map((cat) => renderSelectGroup(cat))}
          </Select>
        </FormControl>

        <TextField
          name="reviewTitle"
          placeholder="Title"
          fullWidth
          required
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

        <TagsAutocomplete />
        <ReviewGallery images={undefined} canEdit={true} />
        <Button fullWidth type="submit" variant="contained">
          Finish Editing
        </Button>
      </createForm.Form>
    </Container>
  );
};

export const CreateReviewAction: ActionFunction = async ({ request }) => {
  if (request.method == "POST") {
    const formData = await request.formData();
    if (!formData.has("reviewTitle") || formData.get("reviewTitle") == "")
      return null;
    if (!formData.has("reviewText") || formData.get("reviewText") == "")
      return null;
    if (!formData.has("reviewRating")) return null;
    if (!formData.has("productId") || formData.get("productId") == "")
      return null;
    const response = await fetch(`/api/reviews/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: formData.get("reviewTitle"),
        text: formData.get("reviewText"),
        rating: parseFloat(formData.get("reviewRating") as string) * 2,
        ProductId: formData.get("productId"),
        tags: JSON.parse(formData.get("reviewTags") as string),
        gallery: JSON.parse(formData.get("reviewGallery") as string),
      }),
    });
    if (!response.ok) throw response;

    const reviewId = await response.text();
    return redirect(`/reviews/${reviewId}`);
  }
  return null;
};

export const CreateReviewLoader: LoaderFunction = async () => {
  return fetch("/api/products");
};

export default CreateReview;
