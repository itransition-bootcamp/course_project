import { ThumbUp } from "@mui/icons-material";
import {
  Box,
  Container,
  Divider,
  IconButton,
  Link,
  Paper,
  Typography,
} from "@mui/material";
import { FC, useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";

type Review = {
  id: number;
  title: string;
  text: string;
  likesCount: number;
  createdAt: string;
};

const Home: React.FC = () => {
  const [topReviews, setTopReviews] = useState<Review[]>([]);
  const [lastReviews, setLastReviews] = useState<Review[]>([]);

  useEffect(() => {
    const abortController = new AbortController();
    async function fetchReviews() {
      fetch("/api/reviews?top=true&limit=10", {
        signal: abortController.signal,
      })
        .then((res) => res.json())
        .then((json) => {
          console.log(json);
          setTopReviews(json);
        });
    }
    fetchReviews();
    return () => {
      abortController.abort();
    };
  }, []);

  useEffect(() => {
    const abortController = new AbortController();
    async function fetchReviews() {
      fetch("/api/reviews?limit=10", {
        signal: abortController.signal,
      })
        .then((res) => res.json())
        .then((json) => {
          console.log(json);
          setLastReviews(json);
        });
    }
    fetchReviews();
    return () => {
      abortController.abort();
    };
  }, []);

  return (
    <Container>
      <ReviewsContainer reviews={topReviews} headline="Top Reviews:" />
      <ReviewsContainer reviews={lastReviews} headline="Last Reviews:" />
    </Container>
  );
};

export default Home;

const ReviewsContainer: FC<{ reviews: Review[]; headline: string }> = ({
  reviews,
  headline,
}) => {
  return (
    <Paper elevation={5} sx={{ marginTop: "20px", p: "10px" }}>
      <Typography variant="h5">{headline}</Typography>
      <Divider sx={{ my: 1 }} />
      <Box sx={{ maxHeight: "300px", overflow: "scroll" }}>
        {reviews.map((review, ind) => (
          <Box key={ind}>
            <Box sx={{ display: "flex" }}>
              <Link
                key={ind}
                underline="none"
                component={RouterLink}
                to={"/review/" + review.id}
                flexGrow={1}
                display={"flex"}
                alignSelf={"center"}
              >
                <Typography color={"textPrimary"} variant="h6">
                  {review.title}
                </Typography>
                <Typography color={"textPrimary"} variant="caption">
                  {review.createdAt}
                </Typography>
              </Link>
              <IconButton>
                <ThumbUp /> {review.likesCount}
              </IconButton>
            </Box>

            <Link
              key={ind}
              underline="none"
              component={RouterLink}
              to={"/review/" + review.id}
            >
              <Typography color={"textSecondary"} variant="body1">
                {review.text.slice(0, 300)}...
              </Typography>
              <Divider sx={{ my: 1 }} />
            </Link>
          </Box>
        ))}
      </Box>
    </Paper>
  );
};
