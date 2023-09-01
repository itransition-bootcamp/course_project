import { Box, Button, Container, Rating, Typography } from "@mui/material";
import MuiMarkdown from "mui-markdown";
import { Form, useLoaderData } from "react-router-dom";
import EditReview from "../components/EditReview";
import { Delete, Edit } from "@mui/icons-material";
import { useState } from "react";
import { useAuth } from "../components/AuthProvider";
import { Review } from "../types";

const ReviewPage = () => {
  const review = useLoaderData() as Omit<Review, "Likes" | "Tags" | "Comments">;
  const [editing, setEditing] = useState(false);
  const { user } = useAuth();
  const isAuthor = user?.id == review.UserId || user?.role == "admin";
  return (
    <Container>
      <Typography variant="h3">{review.title}</Typography>
      <Rating
        name="read-only"
        precision={0.5}
        value={review.rating / 2}
        readOnly
      />
      <Box>
        <MuiMarkdown>{review.text}</MuiMarkdown>
      </Box>

      {isAuthor && (
        <Box display={"flex"} gap={2} my={2}>
          <Button
            onClick={() => setEditing((prev) => !prev)}
            variant="contained"
            startIcon={<Edit />}
          >
            Edit Review
          </Button>
          <Form method="DELETE">
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
      {editing && <EditReview review={review} />}
    </Container>
  );
};

export default ReviewPage;
