import { Container } from "@mui/material";
import { useLoaderData } from "react-router-dom";

const Profile = () => {
  const user = useLoaderData();
  console.log(user);
  return <Container></Container>;
};

export default Profile;
