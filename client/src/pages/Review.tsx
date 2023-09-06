import { Delete, Edit } from "@mui/icons-material";
import { Box, Button, Container, Rating, Typography } from "@mui/material";
import MuiMarkdown from "mui-markdown";
import {
  Form,
  useNavigate,
  useNavigation,
  useOutletContext,
} from "react-router-dom";
import { useAuth } from "../components/AuthProvider";
import CommentsContainer from "../components/CommentsContainer";
import { Review } from "../types";
import LoadingSpinner from "../components/LoadingSpinner";
import ReviewGallery from "../components/ReviewGallery";

const ReviewPage = () => {
  const review = useOutletContext() as Review;

  const { state } = useNavigation();
  const navigate = useNavigate();

  const { user } = useAuth();

  const isAuthor = user?.id == review.UserId || user?.role == "admin";

  if (state === "loading") return <LoadingSpinner />;
  else
    return (
      <Container sx={{ py: 2 }}>
        <Typography variant="h3" gutterBottom>
          {review.title}
        </Typography>
        <Rating
          name="read-only"
          precision={0.5}
          value={review.rating / 2}
          readOnly
        />
        <Box>
          <MuiMarkdown>{review.text}</MuiMarkdown>
        </Box>

        {review.Review_Images && review.Review_Images?.length > 0 && (
          <ReviewGallery images={review.Review_Images} canEdit={false} />
        )}

        {isAuthor && (
          <Box display={"flex"} gap={2} my={2}>
            <Button
              onClick={() => navigate("edit")}
              variant="contained"
              startIcon={<Edit />}
            >
              Edit Review
            </Button>
            <Form action="delete" method="DELETE">
              <Button
                type="submit"
                variant="contained"
                color="error"
                startIcon={<Delete />}
              >
                Delete Review
              </Button>
            </Form>
          </Box>
        )}

        {review.Comments && review.Comments?.length > 0 && (
          <CommentsContainer />
        )}
      </Container>
    );
};

export default ReviewPage;
