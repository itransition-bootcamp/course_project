import {
  Avatar,
  Button,
  Card,
  Container,
  Grid,
  Input,
  TextField,
  Typography,
} from "@mui/material";
import {
  ActionFunction,
  LoaderFunction,
  redirect,
  useFetcher,
  useLoaderData,
} from "react-router-dom";
import ReviewsContainer from "../components/ReviewsContainer";
import { useAuth } from "../components/AuthProvider";
import { Review } from "../types";
import {
  ChangeEventHandler,
  FormEventHandler,
  useEffect,
  useState,
} from "react";

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
  const { username, id, avatar, email, role, createdAt, Reviews } = profile;

  const [usernameInputValue, setUsernameInputValue] = useState("");
  const [emailInputValue, setEmailInputValue] = useState("");
  const [avatarInputValue, setAvatarInputValue] = useState("");
  const [submitEnabled, setSubmitEnabled] = useState(() => false);

  const { user: me, setUser } = useAuth();
  const fetcher = useFetcher();
  const isMyProfile = me?.id == id;
  const canEdit = isMyProfile || me?.role == "admin";

  useEffect(() => {
    setUsernameInputValue(username);
    setEmailInputValue(email);
    setAvatarInputValue(avatar);
  }, [profile]);

  useEffect(() => {
    if (
      usernameInputValue == username &&
      emailInputValue == email &&
      avatarInputValue == avatar
    )
      setSubmitEnabled(false);
    else setSubmitEnabled(true);
  }, [usernameInputValue, emailInputValue, avatarInputValue]);

  const mutateAuthUser: FormEventHandler<HTMLFormElement> = () => {
    if (!isMyProfile) return;
    setUser({
      ...me,
      username: usernameInputValue,
      avatar: avatarInputValue,
    });
  };

  const handleUsernameChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    setUsernameInputValue(e.target.value);
  };
  const handleEmailChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    setEmailInputValue(e.target.value);
  };
  const handleAvatarChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    setAvatarInputValue(e.target.value);
  };
  return (
    <Container sx={{ mt: 2 }}>
      <fetcher.Form method="PUT" onSubmit={mutateAuthUser}>
        <Grid
          container
          alignItems={"center"}
          p={2}
          component={Card}
          columns={8}
          rowSpacing={2}
          elevation={2}
        >
          <Grid item xs={10}>
            <Avatar src={avatar} alt={username}>
              {username.charAt(0)}
            </Avatar>
          </Grid>
          <Grid item xs={8}>
            <TextField
              label="Username"
              size="small"
              disabled={!canEdit}
              name="username"
              required
              value={usernameInputValue}
              onChange={handleUsernameChange}
              sx={{ width: "100%", maxWidth: "30ch" }}
            />
          </Grid>
          <Grid item xs={8}>
            <TextField
              type="email"
              label="Email"
              size="small"
              disabled={!canEdit}
              name="email"
              value={emailInputValue}
              onChange={handleEmailChange}
              sx={{ width: "100%", maxWidth: "30ch" }}
            />
          </Grid>
          <Grid sx={{ display: "none" }} item xs={8}>
            <Input
              name="avatar"
              value={avatarInputValue}
              onChange={handleAvatarChange}
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
          <Grid
            display={submitEnabled ? "block" : "none"}
            item
            xs={5}
            sm={3}
            md={2}
          >
            <Button
              disabled={!canEdit}
              variant="outlined"
              fullWidth
              type="submit"
            >
              save
            </Button>
          </Grid>
        </Grid>
      </fetcher.Form>
      {Reviews.length > 0 && (
        <ReviewsContainer reviewsLoader={Reviews} headline="Reviews:" />
      )}
    </Container>
  );
};

export const profilePageAction: ActionFunction = async ({
  params,
  request,
}) => {
  if (request.method == "DELETE")
    return fetch(`/api/users/${params.id}`, {
      method: "DELETE",
    });
  else if (request.method == "PUT") {
    const formData = await request.formData();
    return fetch(`/api/users/${params.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: formData.get("username"),
        email: formData.get("email"),
        avatar: formData.get("avatar"),
      }),
    });
  }
};

export const profilePageLoader: LoaderFunction = async ({
  params,
  request,
}) => {
  const resp = await fetch(`/api/users/${params.id}`, {
    signal: request.signal,
  });
  if (!resp.ok) return redirect("/");
  else return resp;
};

export default Profile;
