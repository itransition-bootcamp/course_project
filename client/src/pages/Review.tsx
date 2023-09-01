import { Box, Button, Container, Rating, Typography } from "@mui/material";
import MuiMarkdown from "mui-markdown";
import {
  ActionFunction,
  Form,
  LoaderFunction,
  redirect,
  useLoaderData,
} from "react-router-dom";
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

  const toggleEdit = () => setEditing((prev) => !prev);
  return (
    <Container>
      {!editing && (
        <>
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
        </>
      )}

      <EditReview
        review={review}
        hidden={!editing}
        hide={() => setEditing(false)}
      />
      {isAuthor && (
        <Box display={"flex"} gap={2} my={2}>
          <Button onClick={toggleEdit} variant="contained" startIcon={<Edit />}>
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
    </Container>
  );
};

export const reviewPageAction: ActionFunction = async ({ params, request }) => {
  if (request.method == "DELETE")
    return fetch(`/api/reviews/${params.id}`, {
      method: "DELETE",
    });
  else {
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
  }
};

export const reviewPageLoader: LoaderFunction = async ({ params, request }) => {
  const resp = await fetch(`/api/reviews/${params.id}?user&comments`, {
    signal: request.signal,
  });
  if (!resp.ok) return redirect("/");
  else return resp;
};

export default ReviewPage;
