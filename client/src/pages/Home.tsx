import ReviewsContainer from "./../components/ReviewsContainer";
import { Container, styled } from "@mui/material";
import { useLoaderData } from "react-router-dom";
import { TagCloud } from "react-tagcloud";
import { Review } from "../types";

type TagCount = { value: string; count: number };
type LoaderData = [Review[], Review[], TagCount[]];

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
        onClick={(tag: TagCount) => alert(`'${tag.value}' was selected!`)}
      />
    </Container>
  );
};

export default Home;
