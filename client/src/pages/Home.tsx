import ReviewsContainer from "./../components/ReviewsContainer";
import { Container, Grid, styled } from "@mui/material";
import {
  LoaderFunction,
  useLoaderData,
  useNavigation,
  useSearchParams,
} from "react-router-dom";
import { TagCloud } from "react-tagcloud";
import { Review } from "../types";
import LoadingSpinner from "../components/LoadingSpinner";

type TagCount = { value: string; count: number };
type LoaderData = [Review[], Review[], TagCount[]];

const StyledTagCloud = styled(TagCloud)(() => ({
  textAlign: "center",
  "& .tag-cloud-tag": { cursor: "pointer" },
}));

const Home: React.FC = () => {
  const [topReviews, lastReviews, tags] = useLoaderData() as LoaderData;
  const [, setSearchParams] = useSearchParams();
  const { state } = useNavigation();
  if (state === "loading") return <LoadingSpinner />;
  else
    return (
      <Container maxWidth="xl">
        <Grid container columnSpacing={2}>
          <Grid item md={6}>
            <ReviewsContainer
              reviewsLoader={topReviews}
              headline="app.home.topContainer.headline"
            />
          </Grid>
          <Grid item md={6}>
            <ReviewsContainer
              reviewsLoader={lastReviews}
              headline="app.home.lastContainer.headline"
            />
          </Grid>
        </Grid>
        <StyledTagCloud
          minSize={15}
          maxSize={60}
          tags={tags}
          onClick={(tag: TagCount) => setSearchParams({ tags: tag.value })}
        />
      </Container>
    );
};

export const homePageLoader: LoaderFunction = async ({ params, request }) => {
  let category = params.category;
  if (category == "books") category = "Book";
  else if (category == "movies") category = "Movie";
  else if (category == "games") category = "Videogame";
  else category = undefined;

  const tagsSearchParam = new URL(request.url).searchParams.getAll("tags");

  let fetchUrl = `/api/reviews?limit=10`;
  if (category) fetchUrl += "&cat=" + category;
  if (tagsSearchParam)
    fetchUrl += tagsSearchParam.map((tag) => "&tags=" + tag).join("");
  const topReviews = await fetch(fetchUrl + "&top", {
    signal: request.signal,
  }).then((res) => res.json());
  const lastReviews = await fetch(fetchUrl, {
    signal: request.signal,
  }).then((res) => res.json());
  const tags = await fetch("/api/tags?count", {
    signal: request.signal,
  }).then((res) => res.json());
  return [topReviews, lastReviews, tags];
};

export default Home;
