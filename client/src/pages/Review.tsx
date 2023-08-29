import { Container, Typography } from "@mui/material";
import MuiMarkdown from "mui-markdown";
import { useLoaderData } from "react-router-dom";
import CreateReview from "../components/CreateReview";

type Review = {
  id: number;
  UserId: number;
  title: string;
  text: string;
  poster: string;
  likesCount: number;
  createdAt: string;
};

const ReviewPage = () => {
  const review = useLoaderData() as Review;

  return (
    <Container>
      <CreateReview />
      <Typography variant="h3">{review.title}</Typography>
      <MuiMarkdown>{review.text}</MuiMarkdown>
    </Container>
  );
};

export default ReviewPage;
