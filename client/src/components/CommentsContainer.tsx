import {
  Paper,
  Grid,
  Avatar,
  Divider,
  Typography,
  Box,
  Link,
} from "@mui/material";
import { FC, useEffect, useState } from "react";
import { Review } from "../types";
import { Link as RouterLink, useLoaderData } from "react-router-dom";

const CommentsContainer: FC = () => {
  const { id, Comments } = useLoaderData() as Omit<Review, "Likes" | "Tags">;
  const [comments, setComments] = useState<Review["Comments"]>(() => Comments);

  useEffect(() => {
    // opening a connection to the server to begin receiving events from it
    const eventSource = new EventSource(`/api/reviews/${id}/comments`);
    eventSource.onopen = () => console.log("connection opened");
    // attaching a handler to receive message events
    eventSource.onmessage = (event) => {
      const comment = JSON.parse(event.data);
      console.log(comment);
      setComments((prev) =>
        prev === undefined ? [comment] : [...prev, comment]
      );
    };

    // terminating the connection on component unmount
    return () => eventSource.close();
  }, []);

  return (
    <Paper elevation={2} sx={{ mt: 6, p: { xs: 2, sm: 3 } }}>
      {/* <Typography variant="h5" color={"primary.dark"} mb={2}>
        Comments:
      </Typography> */}
      {/* <Divider sx={{ my: 2 }} /> */}
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
                {new Date(comment.createdAt).toLocaleString()}
              </Typography>
            </Grid>
          </Grid>
          {index != comments.length - 1 && (
            <Divider light variant="fullWidth" sx={{ my: 2 }} />
          )}
        </Box>
      ))}
    </Paper>
  );
};

export default CommentsContainer;
