import { Close } from "@mui/icons-material";
import {
  Avatar,
  Box,
  Button,
  Divider,
  IconButton,
  Link,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  TextField,
} from "@mui/material";
import React, { FC, useCallback, useEffect, useState } from "react";
import { FormattedDate, FormattedMessage, FormattedTime } from "react-intl";
import { Form, Link as RouterLink, useOutletContext } from "react-router-dom";
import { useUpdateEffect } from "usehooks-ts";
import { Review } from "../types";
import { useAuth } from "./AuthProvider";

const CommentsContainer: FC = () => {
  const { id: reviewId, Comments } = useOutletContext() as Omit<
    Review,
    "Likes" | "Tags"
  >;
  const [comments, setComments] = useState<Review["Comments"]>(() => Comments);
  const [commentInput, setCommentInput] = useState("");
  const { user, authenticated } = useAuth();

  const canEdit = useCallback(
    (commentUserId: number) => {
      if (!authenticated) return null;
      else return user?.role == "admin" || user!.id == commentUserId;
    },
    [user]
  );

  const deleteComment = async (commentId: number) => {
    const resp = await fetch(`/api/reviews/${reviewId}/comments/${commentId}`, {
      method: "DELETE",
    });
    if (resp.ok)
      setComments((prev) => prev?.filter((comment) => commentId != comment.id));
  };

  useEffect(() => {
    const eventSource = new EventSource(`/api/reviews/${reviewId}/comments`);
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
    <Paper elevation={2} sx={{ mt: 2, pr: 2 }}>
      <List>
        {comments?.map((comm, index) => (
          <React.Fragment key={comm.id}>
            <ListItem
              secondaryAction={
                canEdit(comm.UserId) && (
                  <IconButton
                    edge="end"
                    size="small"
                    aria-label="delete comment"
                    onClick={() => deleteComment(comm.id)}
                    hidden
                    sx={{ display: "none" }}
                  >
                    <Close />
                  </IconButton>
                )
              }
              alignItems="flex-start"
              sx={{
                "&:hover .MuiButtonBase-root": {
                  display: "inline-flex",
                },
              }}
            >
              <ListItemAvatar>
                <Link component={RouterLink} to={`/profile/${comm.UserId}`}>
                  <Avatar alt={comm.User.username} src={comm.User.avatar} />
                </Link>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box mb={1}>
                    <Link
                      display={"block"}
                      underline="none"
                      component={RouterLink}
                      to={`/profile/${comm.UserId}`}
                      variant="h6"
                    >
                      {comm.User?.username}
                    </Link>
                    {comm.text}
                  </Box>
                }
                secondary={
                  <React.Fragment>
                    <FormattedDate value={comm.createdAt} />{" "}
                    <FormattedTime value={comm.createdAt} />
                  </React.Fragment>
                }
              />
            </ListItem>
            {index != comments.length - 1 && (
              <Divider component={"li"} variant="inset" />
            )}
          </React.Fragment>
        ))}
      </List>

      {authenticated && (
        <>
          <Divider light variant="fullWidth" sx={{ mb: 2 }} />
          <Form
            method="POST"
            onSubmit={() => {
              setCommentInput("");
            }}
            style={{
              display: "flex",
              gap: 10,
              marginLeft: "18px",
              paddingBottom: "18px",
            }}
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
