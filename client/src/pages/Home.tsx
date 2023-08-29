import { Star } from "@mui/icons-material";
import {
  Box,
  Container,
  Divider,
  IconButton,
  Link,
  Paper,
  Typography,
} from "@mui/material";
import { FC, useState } from "react";
import { Link as RouterLink, useLoaderData } from "react-router-dom";
import { useAuth } from "../components/AuthProvider";

type Review = {
  id: number;
  title: string;
  text: string;
  likesCount: number;
  createdAt: string;
};

const Home: React.FC = () => {
  const [topReviews, lastReviews] = useLoaderData() as Review[][];

  return (
    <Container>
      <ReviewsContainer reviewsLoader={topReviews} headline="Top Reviews:" />
      <ReviewsContainer reviewsLoader={lastReviews} headline="Last Reviews:" />
    </Container>
  );
};

export default Home;

function addOrRemove<T>(arr: T[], item: T): T[] {
  return arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item];
}

const ReviewsContainer: FC<{ reviewsLoader: Review[]; headline: string }> = ({
  reviewsLoader,
  headline,
}) => {
  const [reviews, setReviews] = useState<Review[]>(reviewsLoader);
  const { user, setUser } = useAuth();

  const handleLike = (id: number, index: number) => {
    if (!user) return;
    fetch(`api/reviews/${id}/like`);

    setUser((prev) => {
      if (!prev) return null;
      const newUser = {
        ...prev,
        Likes: addOrRemove<number>(prev.Likes, id),
      };
      return newUser;
    });

    setReviews((prev) =>
      prev.map((rev, i) => {
        if (i == index && !user.Likes.includes(rev.id))
          return { ...rev, likesCount: rev.likesCount + 1 };
        else if (i == index && user.Likes.includes(rev.id))
          return { ...rev, likesCount: rev.likesCount - 1 };
        return { ...rev };
      })
    );
  };
  if (!reviews) return null;
  return (
    <Paper elevation={5} sx={{ marginTop: "20px", p: "10px" }}>
      <Typography variant="h5">{headline}</Typography>
      <Divider sx={{ my: 1 }} />
      <Box sx={{ maxHeight: "300px", overflow: "scroll" }}>
        {reviews.map((review, i) => (
          <Box key={i}>
            <Box sx={{ display: "flex" }}>
              <Link
                underline="none"
                component={RouterLink}
                to={"/reviews/" + review.id}
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
              <IconButton
                disabled={!user}
                onClick={() => handleLike(review.id, i)}
              >
                <Star
                  color={user?.Likes.includes(review.id) ? "success" : "action"}
                />{" "}
                {review.likesCount}
              </IconButton>
            </Box>

            <Link
              key={i}
              underline="none"
              component={RouterLink}
              to={"/reviews/" + review.id}
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
