import { CircularProgress } from "@mui/material";
import { FC } from "react";

const LoadingSpinner: FC = () => {
  return (
    <CircularProgress
      size={100}
      sx={{
        position: "absolute",
        left: "calc(50% - 50px)",
        top: "calc(50% - 50px)",
      }}
    />
  );
};

export default LoadingSpinner;
