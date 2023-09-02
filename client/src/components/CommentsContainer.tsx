import {
  Paper,
  Grid,
  Avatar,
  Divider,
  Typography,
  Box,
  Link,
} from "@mui/material";
import { FC } from "react";
import { Review } from "../types";
import { Link as RouterLink } from "react-router-dom";

const CommentsContainer: FC<{ comments: Review["Comments"] }> = ({
  comments,
}) => {
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
              <Avatar alt="Remy Sharp" src={comment.User?.avatar} />
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
