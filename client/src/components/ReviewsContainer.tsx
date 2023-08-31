import { Paper, Typography, Divider, Box } from "@mui/material";
import { FC } from "react";
import { Review } from "../pages/Home";
import ReviewWrapper from "./ReviewWrapper";

const ReviewsContainer: FC<{
  reviewsLoader: Review[];
  headline: string;
}> = ({ reviewsLoader, headline }) => {
  if (!reviewsLoader) return null;
  return (
    <Paper
      elevation={5}
      sx={{
        marginTop: "20px",
        p: "10px",
      }}
    >
      <Typography variant="h5">{headline}</Typography>
      <Divider
        sx={{
          my: 1,
        }}
      />
      <Box
        sx={{
          maxHeight: "300px",
          overflow: "scroll",
        }}
      >
        {reviewsLoader.map((review, i) => (
          <ReviewWrapper reviewLoader={review} key={i} />
        ))}
      </Box>
    </Paper>
  );
};

export default ReviewsContainer;
