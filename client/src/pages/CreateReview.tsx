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
import { FormattedMessage, useIntl } from "react-intl";

export const Component: FC = () => {
  const { state } = useNavigation();
  const { authenticated, loading: loadingAuth } = useAuth();
  const createForm = useFetcher();
  const products = useLoaderData() as Product[];
  const intl = useIntl();

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
      return [
        <ListSubheader>
          <FormattedMessage id={`app.createReview.subject.cat.${cat}`} />
        </ListSubheader>,
        items,
      ];
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
          <InputLabel id="productId-label">
            {intl.formatMessage({ id: "app.createReview.label.subject" })}
          </InputLabel>
          <Select
            labelId="productId-label"
            id="productId"
            name="productId"
            value={productId}
            label={intl.formatMessage({ id: "app.createReview.label.subject" })}
            onChange={handleChange}
            required
          >
            {categories.map((cat) => renderSelectGroup(cat))}
          </Select>
        </FormControl>

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

        <TagsAutocomplete />
        <ReviewGallery images={undefined} canEdit={true} />
        <Button fullWidth type="submit" variant="contained">
          {intl.formatMessage({ id: "app.createReview.button.finish" })}
        </Button>
      </createForm.Form>
    </Container>
  );
};

export const action: ActionFunction = async ({ request }) => {
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

export const loader: LoaderFunction = async () => {
  return fetch("/api/products");
};
