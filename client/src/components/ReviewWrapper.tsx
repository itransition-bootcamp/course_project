import { Star } from "@mui/icons-material";
import { Box, Typography, IconButton, Divider, Link } from "@mui/material";
import { FC, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { Review } from "../types";
import { useAuth } from "./AuthProvider";
import { FormattedDate, FormattedMessage } from "react-intl";

const ReviewWrapper: FC<{
  reviewLoader: Review;
}> = ({ reviewLoader }) => {
  const { user, setUser } = useAuth();
  const [review, setReview] = useState(reviewLoader);

  const handleLike = (id: number) => {
    if (!user) return;
    fetch(`/api/reviews/${id}/like`);
    setUser((old) => {
      if (!old) return null;
      const newUser = { ...old, Likes: addOrRemove<number>(old.Likes, id) };
      return newUser;
    });

    setReview((prev) => {
      if (prev.likesCount == undefined)
        throw new Error("Missing likesCount field");
      if (!user.Likes.includes(prev.id))
        return { ...prev, likesCount: prev.likesCount + 1 };
      else if (user.Likes.includes(prev.id))
        return { ...prev, likesCount: prev.likesCount - 1 };
      else return { ...prev };
    });
  };

  return (
    <Box>
      {review.Product && (
        <Typography color={"text.secondary"} variant="caption">
          <FormattedMessage
            id={`app.reviewWrapper.reviewSubject.category.${review.Product.category}`}
            values={{ name: review.Product.name }}
          />
        </Typography>
      )}
      <Box
        sx={{
          display: "flex",
        }}
      >
        <Link
          underline="none"
          component={RouterLink}
          to={"/reviews/" + review.id}
          flexGrow={1}
          display={"flex"}
          gap={2}
          alignSelf={"center"}
        >
          <Typography color={"primary.main"} variant="h6">
            {review.title}
          </Typography>

          <Typography color={"text.secondary"} variant="overline">
            <FormattedDate value={review.createdAt} />
          </Typography>
        </Link>
        <IconButton disabled={!user} onClick={() => handleLike(review.id)}>
          <Star
            color={user?.Likes.includes(review.id) ? "success" : "action"}
          />{" "}
          {review.likesCount}
        </IconButton>
      </Box>

      <Link
        underline="none"
        component={RouterLink}
        to={"/reviews/" + review.id}
      >
        <Typography color={"text.primary"} variant="body1">
          {review.text.slice(0, 300)}...
        </Typography>
        <Divider
          sx={{
            my: 1,
          }}
        />
      </Link>
    </Box>
  );
};

function addOrRemove<T>(arr: T[], item: T): T[] {
  return arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item];
}

export default ReviewWrapper;
