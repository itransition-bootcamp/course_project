import {
  Avatar,
  Box,
  Button,
  Card,
  Container,
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
  useNavigation,
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
import ImageUpload from "../components/ImageUpload";
import LoadingSpinner from "../components/LoadingSpinner";

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
  const [submitEnabled, setSubmitEnabled] = useState(false);
  const [openUploadWindow, setOpenUploadWindow] = useState(false);

  const { user: me, setUser } = useAuth();
  const fetcher = useFetcher();
  const isMyProfile = me?.id == id;
  const canEdit = isMyProfile || me?.role == "admin";

  useEffect(() => {
    setUsernameInputValue(username || "");
    setEmailInputValue(email || "");
    setAvatarInputValue(avatar || "");
  }, [profile]);

  useEffect(() => {
    if (
      usernameInputValue == (username || "") &&
      emailInputValue == (email || "") &&
      avatarInputValue == (avatar || "")
    )
      setSubmitEnabled(false);
    else setSubmitEnabled(true);
  }, [usernameInputValue, emailInputValue, avatarInputValue]);

  const mutateAuthUser: FormEventHandler<HTMLFormElement> = () => {
    if (!isMyProfile) return;
    setSubmitEnabled(false);
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
  const { state } = useNavigation();
  if (state === "loading") return <LoadingSpinner />;
  else
    return (
      <Container sx={{ mt: 2 }}>
        <fetcher.Form method="PUT" onSubmit={mutateAuthUser}>
          <Card
            elevation={2}
            sx={{
              maxWidth: "sm",
              m: "auto",
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: { xs: 1, md: 2 },
                my: 2,
                mx: 2,
              }}
            >
              <Button
                disabled={!canEdit}
                onClick={() => setOpenUploadWindow(true)}
              >
                <Avatar
                  src={avatarInputValue}
                  alt={username}
                  sx={{
                    width: { xs: 125, sm: 250 },
                    height: { xs: 125, sm: 250 },
                  }}
                >
                  <Typography variant="h3">{username.charAt(0)}</Typography>
                </Avatar>
              </Button>
              <TextField
                label="Username"
                size="small"
                disabled={!canEdit}
                name="username"
                required
                value={usernameInputValue}
                onChange={handleUsernameChange}
                fullWidth
              />

              <TextField
                type="email"
                label="Email"
                size="small"
                disabled={!canEdit}
                name="email"
                value={emailInputValue}
                onChange={handleEmailChange}
                fullWidth
              />

              <Input
                sx={{ display: "none" }}
                name="avatar"
                value={avatarInputValue}
                onChange={handleAvatarChange}
              />

              <Typography alignSelf={"flex-start"}>
                Registration Date: {new Date(createdAt).toLocaleDateString()}
              </Typography>

              <Typography alignSelf={"flex-start"}>Role: {role}</Typography>

              <Box display={submitEnabled ? "block" : "none"}>
                <Button
                  disabled={!canEdit}
                  variant="outlined"
                  fullWidth
                  type="submit"
                >
                  save
                </Button>
              </Box>
            </Box>
          </Card>
        </fetcher.Form>
        {Reviews.length > 0 && (
          <ReviewsContainer reviewsLoader={Reviews} headline="Reviews:" />
        )}
        <ImageUpload
          open={openUploadWindow}
          setOpen={setOpenUploadWindow}
          profileId={id}
          setInput={setAvatarInputValue}
        />
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
