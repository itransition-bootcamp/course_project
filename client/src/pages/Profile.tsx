import {
  Avatar,
  Card,
  Container,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import { useLoaderData } from "react-router-dom";
import ReviewsContainer from "../components/ReviewsContainer";
import { useAuth } from "../components/AuthProvider";
import { Review } from "../types";

type Profile = {
  id: number;
  username: string;
  role: string;
  email: string;
  createdAt: string;
  avatar: string;
  Reviews: Review[];
};

const Profile = () => {
  const profile = useLoaderData() as Profile;
  const me = useAuth().user;
  if (!profile) return null;

  const { username, id, avatar, email, role, createdAt, Reviews } = profile;
  const canEdit = me?.id == id || me?.role == "admin";

  return (
    <Container sx={{ mt: 2 }}>
      <Grid
        container
        alignItems={"center"}
        p={1}
        component={Card}
        columns={8}
        rowSpacing={1}
        elevation={5}
      >
        <Grid item xs={10}>
          <Avatar src={avatar} alt={username}>
            {username.charAt(0)}
          </Avatar>
        </Grid>
        <Grid item xs={3} sm={2} md={1} component={Typography}>
          Username:
        </Grid>
        <Grid item xs={5} sm={6} md={7}>
          <TextField
            hiddenLabel
            sx={{ width: "100%", maxWidth: "30ch" }}
            size="small"
            disabled={!canEdit}
            defaultValue={username}
          />
        </Grid>
        <Grid item xs={3} sm={2} md={1} component={Typography}>
          Email:
        </Grid>
        <Grid item xs={5} sm={6} md={7}>
          <TextField
            hiddenLabel
            sx={{ width: "100%", maxWidth: "30ch" }}
            size="small"
            disabled={!canEdit}
            defaultValue={email}
          />
        </Grid>

        <Grid item xs={3} sm={2} md={1} component={Typography}>
          Registration Date:
        </Grid>
        <Grid item xs={5} sm={6} md={7} component={Typography}>
          {new Date(createdAt).toLocaleDateString()}
        </Grid>
        <Grid item xs={3} sm={2} md={1} component={Typography}>
          Role:
        </Grid>
        <Grid item xs={5} sm={6} md={7} component={Typography}>
          {role}
        </Grid>
      </Grid>

      {Reviews.length > 0 && (
        <ReviewsContainer reviewsLoader={Reviews} headline="Reviews:" />
      )}
    </Container>
  );
};

export default Profile;
