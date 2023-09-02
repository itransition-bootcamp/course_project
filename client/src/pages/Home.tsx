import ReviewsContainer from "./../components/ReviewsContainer";
import { Container, Grid, styled } from "@mui/material";
import { LoaderFunction, useLoaderData } from "react-router-dom";
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
    <Container maxWidth="xl">
      <Grid container columnSpacing={2}>
        <Grid item md={6}>
          <ReviewsContainer
            reviewsLoader={topReviews}
            headline="Top Reviews:"
          />
        </Grid>
        <Grid item md={6}>
          <ReviewsContainer
            reviewsLoader={lastReviews}
            headline="Last Reviews:"
          />
        </Grid>
      </Grid>
      <StyledTagCloud
        minSize={15}
        maxSize={60}
        tags={tags}
        onClick={(tag: TagCount) => alert(`'${tag.value}' was selected!`)}
      />
    </Container>
  );
};

export const homePageLoader: LoaderFunction = async ({ request }) => {
  const topReviews = await fetch("/api/reviews?top&limit=10", {
    signal: request.signal,
  }).then((res) => res.json());
  const lastReviews = await fetch("/api/reviews?limit=10", {
    signal: request.signal,
  }).then((res) => res.json());
  const tags = await fetch("/api/tags", {
    signal: request.signal,
  }).then((res) => res.json());
  return [topReviews, lastReviews, tags];
};

export default Home;
