import { Star } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import { FC, useState } from "react";
import { Review } from "../types";
import { useAuth } from "./AuthProvider";

type LikeProps = {
  reviewId: Review["id"];
  likesCount: number;
};

const Like: FC<LikeProps> = ({ reviewId, likesCount }) => {
  const { user, setUser } = useAuth();
  const [likes, setLikes] = useState(() => likesCount);

  const handleLike = (id: number) => {
    if (!user) return;
    fetch(`/api/reviews/${id}/like`);
    setUser((prev) => {
      if (!prev) return null;
      return { ...prev, Likes: addOrRemove<number>(prev.Likes, id) };
    });

    setLikes((prev) => {
      if (prev === undefined) throw new Error("Missing likesCount field");
      else if (!user.Likes.includes(reviewId)) return prev + 1;
      else if (user.Likes.includes(reviewId)) return prev - 1;
      else return prev;
    });
  };

  return (
    <IconButton
      disabled={!user}
      onClick={() => handleLike(reviewId)}
      aria-label="like"
    >
      <Star color={user?.Likes.includes(reviewId) ? "success" : "action"} />{" "}
      {likes}
    </IconButton>
  );
};

function addOrRemove<T>(arr: T[], item: T): T[] {
  return arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item];
}

export default Like;
