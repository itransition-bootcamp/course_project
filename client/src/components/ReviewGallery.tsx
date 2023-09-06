import {
  Badge,
  Button,
  IconButton,
  ImageList,
  ImageListItem,
} from "@mui/material";
import { FC, useState } from "react";
import { Review } from "../types";
import { AddAPhoto, Close } from "@mui/icons-material";
import ImageUpload from "./ImageUpload";

type GalleryProps = {
  images: Review["Review_Images"];
  canEdit: boolean;
};

const ReviewGallery: FC<GalleryProps> = ({ images, canEdit }) => {
  const [openUploadWindow, setOpenUploadWindow] = useState(false);
  const [input, setInput] = useState(() => images);

  const badgeContent = (
    <IconButton size="medium">
      <Close fontSize="inherit" />
    </IconButton>
  );
  return (
    <ImageList sx={{ width: "fit-content" }} cols={4}>
      {input?.map((image) => (
        <ImageListItem key={image.id}>
          <Badge
            badgeContent={badgeContent}
            overlap="circular"
            // sx={{ "& .MuiBadge-badge": { p: 0 } }}
          >
            <img
              src={image.src}
              loading="lazy"
              style={{
                maxHeight: "100px",
                maxWidth: "fit-content",
              }}
            />
          </Badge>
        </ImageListItem>
      ))}
      {canEdit && (
        <ImageListItem>
          <Button
            variant="outlined"
            sx={{ height: "100%" }}
            onClick={() => setOpenUploadWindow(true)}
          >
            <AddAPhoto />
          </Button>
          <ImageUpload
            open={openUploadWindow}
            setOpen={setOpenUploadWindow}
            profileId={3}
            setInput={setInput}
          />
        </ImageListItem>
      )}
    </ImageList>
  );
};

export default ReviewGallery;
