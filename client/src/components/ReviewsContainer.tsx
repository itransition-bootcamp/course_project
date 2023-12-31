import { Box, Divider, Paper, Typography } from "@mui/material";
import { FC } from "react";
import { FormattedMessage } from "react-intl";
import { Review } from "../types";
import ReviewWrapper from "./ReviewWrapper";

const ReviewsContainer: FC<{
  reviewsLoader: Review[];
  headline: string;
}> = ({ reviewsLoader, headline }) => {
  if (!reviewsLoader) return null;
  return (
    <Paper
      elevation={2}
      sx={{
        marginTop: 2,
        p: 2,
      }}
    >
      <Typography color={"primary.dark"} variant="h5">
        <FormattedMessage id={headline} />
      </Typography>
      <Divider
        sx={{
          my: 1,
        }}
      />
      <Box
        sx={{
          maxHeight: { xs: "250px", md: "500px" },
          overflow: "scroll",
        }}
      >
        {reviewsLoader.map((review, i) => (
          <ReviewWrapper review={review} key={i} />
        ))}
      </Box>
    </Paper>
  );
};

export default ReviewsContainer;
