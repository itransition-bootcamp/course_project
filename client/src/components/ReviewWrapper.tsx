import { Box, Typography, Divider, Link } from "@mui/material";
import { FC } from "react";
import { Link as RouterLink } from "react-router-dom";
import { Review } from "../types";
import { FormattedDate, FormattedMessage } from "react-intl";
import Like from "./Like";

const ReviewWrapper: FC<{
  review: Review;
}> = ({ review }) => {
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
        <Like reviewId={review.id} likesCount={review.likesCount!} />
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

export default ReviewWrapper;
