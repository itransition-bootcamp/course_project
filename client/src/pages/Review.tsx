import { Delete, Edit } from "@mui/icons-material";
import { Box, Button, Container, Rating, Typography } from "@mui/material";
import MuiMarkdown from "mui-markdown";
import { useState } from "react";
import {
  ActionFunction,
  Form,
  LoaderFunction,
  redirect,
  useLoaderData,
  useNavigation,
} from "react-router-dom";
import { useAuth } from "../components/AuthProvider";
import CommentsContainer from "../components/CommentsContainer";
import EditReview from "../components/EditReview";
import { Review } from "../types";
import LoadingSpinner from "../components/LoadingSpinner";

const ReviewPage = () => {
  const review = useLoaderData() as Omit<Review, "Likes" | "Tags">;
  const [editing, setEditing] = useState(false);
  const { state } = useNavigation();
  const { user } = useAuth();
  const isAuthor = user?.id == review.UserId || user?.role == "admin";
  const toggleEdit = () => setEditing((prev) => !prev);

  if (state === "loading") return <LoadingSpinner />;
  else
    return (
      <Container sx={{ py: 2 }}>
        {!editing && (
          <>
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
          </>
        )}

        <EditReview
          review={review}
          hidden={!editing}
          hide={() => setEditing(false)}
        />
        {isAuthor && (
          <Box display={"flex"} gap={2} my={2}>
            <Button
              onClick={toggleEdit}
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

        <CommentsContainer />
      </Container>
    );
};

export const reviewPageAction: ActionFunction = async ({ params, request }) => {
  if (request.method == "POST") {
    const formData = await request.formData();
    const intent = formData.get("intent");
    const comment = formData.get("comment");
    if (!comment) return null;
    if (intent === "add comment") {
      return fetch(`/api/reviews/${params.id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          comment: comment,
        }),
      });
    }
  }
  if (request.method == "DELETE")
    return fetch(`/api/reviews/${params.id}`, {
      method: "DELETE",
    });
  else if (request.method == "PUT") {
    const formData = await request.formData();
    if (!formData.get("reviewText")) return null;
    return fetch(`/api/reviews/${params.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: formData.get("reviewTitle"),
        text: formData.get("reviewText"),
      }),
    });
  } else return null;
};

export const reviewPageLoader: LoaderFunction = async ({ params, request }) => {
  const resp = await fetch(`/api/reviews/${params.id}?user&comments`, {
    signal: request.signal,
  });
  if (!resp.ok) return redirect("/");
  else return resp;
};

export default ReviewPage;
