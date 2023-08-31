import ReviewsContainer from "./../components/ReviewsContainer";
import { Container, styled } from "@mui/material";
import { useLoaderData } from "react-router-dom";
import { TagCloud } from "react-tagcloud";

export type Review = {
  id: number;
  title: string;
  text: string;
  likesCount: number;
  createdAt: string;
};
type Tag = { value: string; count: number };
type LoaderData = [Review[], Review[], Tag[]];

const StyledTagCloud = styled(TagCloud)(() => ({
  textAlign: "center",
  "& .tag-cloud-tag": { cursor: "pointer" },
}));

const Home: React.FC = () => {
  const [topReviews, lastReviews, tags] = useLoaderData() as LoaderData;

  return (
    <Container>
      <ReviewsContainer reviewsLoader={topReviews} headline="Top Reviews:" />
      <ReviewsContainer reviewsLoader={lastReviews} headline="Last Reviews:" />
      <StyledTagCloud
        minSize={15}
        maxSize={60}
        tags={tags}
        onClick={(tag: Tag) => alert(`'${tag.value}' was selected!`)}
      />
    </Container>
  );
};

export default Home;
