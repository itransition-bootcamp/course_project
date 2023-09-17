import { Delete, Edit } from "@mui/icons-material";
import {
  Box,
  Button,
  Chip,
  Container,
  Link,
  List,
  ListItem,
  Paper,
  Rating,
  Typography,
} from "@mui/material";
import MuiMarkdown from "mui-markdown";
import {
  Form,
  useNavigate,
  useNavigation,
  useOutletContext,
  Link as RouterLink,
} from "react-router-dom";
import { useAuth } from "../components/AuthProvider";
import CommentsContainer from "../components/CommentsContainer";
import { Review } from "../types";
import LoadingSpinner from "../components/LoadingSpinner";
import ReviewGallery from "../components/ReviewGallery";
import { FormattedMessage } from "react-intl";
import Like from "../components/Like";

export const Component = () => {
  const review = useOutletContext() as Review;
  const { user } = useAuth();
  const { state } = useNavigation();
  const navigate = useNavigate();

  const isAuthor = user?.id == review.UserId || user?.role == "admin";

  if (state === "loading") return <LoadingSpinner />;
  else
    return (
      <Container sx={{ py: 2 }}>
        <Paper elevation={3} sx={{ p: 2 }}>
          <Link
            component={RouterLink}
            variant="caption"
            to={"/profile/" + review.UserId}
          >
            <FormattedMessage
              id="app.review.author"
              values={{ username: review.User?.username }}
            />
          </Link>
          <Box display={"flex"} justifyContent={"space-between"} mb={1}>
            <Typography variant="h4" fontWeight={"bold"}>
              {review.title}
            </Typography>
            <Like reviewId={review.id} likesCount={review.likesCount!} />
          </Box>
          <Box>
            <MuiMarkdown>{review.text}</MuiMarkdown>
          </Box>
          <Rating
            name="read-only"
            precision={0.5}
            value={review.rating / 2}
            readOnly
            sx={{ pt: 1 }}
          />

          {review.Tags && review.Tags.length > 0 && (
            <List sx={{ display: "flex", flexWrap: "wrap", gap: 1, pt: 1 }}>
              {review.Tags.map((tag) => (
                <ListItem key={tag.id} sx={{ width: "unset", p: 0 }}>
                  <Chip label={tag.name} />
                </ListItem>
              ))}
            </List>
          )}

          {review.Review_Images && review.Review_Images.length > 0 && (
            <ReviewGallery images={review.Review_Images} canEdit={false} />
          )}

          {isAuthor && (
            <Box display={"flex"} gap={2} mt={2}>
              <Button
                onClick={() => navigate("edit")}
                variant="contained"
                startIcon={<Edit />}
              >
                <FormattedMessage id="app.review.button.edit" />
              </Button>
              <Form action="delete" method="DELETE">
                <Button
                  type="submit"
                  variant="contained"
                  color="error"
                  startIcon={<Delete />}
                >
                  <FormattedMessage id="app.review.button.delete" />
                </Button>
              </Form>
            </Box>
          )}
        </Paper>

        <CommentsContainer />
      </Container>
    );
};
