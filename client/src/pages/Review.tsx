import { useLoaderData } from "react-router-dom";

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
  console.log(review);
  return (
    <div>
      <p>{review.title}</p>
      <p>{review.text}</p>
      <p>{review.likesCount}</p>
    </div>
  );
};

export default ReviewPage;
