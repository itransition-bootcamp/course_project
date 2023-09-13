import {
  Avatar,
  Box,
  Button,
  Divider,
  Grid,
  Link,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { FC, useEffect, useState } from "react";
import { FormattedDate, FormattedMessage, FormattedTime } from "react-intl";
import { Form, Link as RouterLink, useOutletContext } from "react-router-dom";
import { useUpdateEffect } from "usehooks-ts";
import { Review } from "../types";
import { useAuth } from "./AuthProvider";

const CommentsContainer: FC = () => {
  const { id, Comments } = useOutletContext() as Omit<Review, "Likes" | "Tags">;

  const [comments, setComments] = useState<Review["Comments"]>(() => Comments);
  const [commentInput, setCommentInput] = useState("");

  const { authenticated } = useAuth();

  useEffect(() => {
    const eventSource = new EventSource(`/api/reviews/${id}/comments`);
    eventSource.onmessage = (event) => {
      const comment = JSON.parse(event.data);
      setComments((prev) =>
        prev === undefined ? [comment] : [...prev, comment]
      );
    };
    return () => eventSource.close();
  }, []);

  useUpdateEffect(() => {
    if (
      document.body.scrollHeight - (window.scrollY + window.innerHeight) <
      500
    )
      window.scrollTo(0, document.body.scrollHeight);
  }, [comments]);

  return (
    <Paper elevation={2} sx={{ mt: 2, p: { xs: 2, sm: 3 } }}>
      {comments?.map((comment, index) => (
        <Box key={index}>
          <Grid container wrap="nowrap" spacing={2}>
            <Grid item component={RouterLink} to={`/profile/${comment.UserId}`}>
              <Avatar alt={comment.User?.username} src={comment.User?.avatar} />
            </Grid>
            <Grid item xs zeroMinWidth>
              <Link
                underline="none"
                component={RouterLink}
                to={`/profile/${comment.UserId}`}
                variant="h5"
              >
                {comment.User?.username}
              </Link>
              <Typography my={1}>{comment.text}</Typography>
              <Typography color={"GrayText"}>
                <FormattedDate value={comment.createdAt} />{" "}
                <FormattedTime value={comment.createdAt} />
              </Typography>
            </Grid>
          </Grid>
          {index != comments.length - 1 && (
            <Divider light variant="fullWidth" sx={{ my: 2 }} />
          )}
        </Box>
      ))}
      {authenticated && (
        <>
          <Divider light variant="fullWidth" sx={{ my: 2 }} />
          <Form
            method="POST"
            onSubmit={() => {
              setCommentInput("");
            }}
            style={{ display: "flex", gap: 10 }}
          >
            <TextField
              autoComplete="off"
              sx={{ flexGrow: 1 }}
              name="comment"
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
            />
            <Button type="submit" name="intent" value="add comment">
              <FormattedMessage id="app.review.comments.button.send" />
            </Button>
          </Form>
        </>
      )}
    </Paper>
  );
};

export default CommentsContainer;
