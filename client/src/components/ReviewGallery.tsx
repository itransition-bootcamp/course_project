import {
  Button,
  IconButton,
  ImageList,
  ImageListItem,
  ImageListItemBar,
} from "@mui/material";
import { FC, useState } from "react";
import { Review } from "../types";
import { AddAPhoto, Close } from "@mui/icons-material";
import ImageUpload from "./ImageUpload";

type GalleryProps = {
  images: Review["Review_Images"];
  canEdit: boolean;
};

export const GalleryImage: FC<{ src: string }> = ({ src }) => (
  <img
    src={src}
    loading="lazy"
    style={{
      maxHeight: "100px",
    }}
  />
);

const ReviewGallery: FC<GalleryProps> = ({ images, canEdit }) => {
  const [openUploadWindow, setOpenUploadWindow] = useState(false);
  const [input, setInput] = useState(() => images);

  return (
    <ImageList
      gap={10}
      sx={{
        display: "flex",
        flexWrap: "wrap",
      }}
    >
      {input?.map((image) => (
        <ImageListItem key={image.id} sx={{ width: "fit-content" }}>
          <GalleryImage src={image.src} />
          <ImageListItemBar
            position="top"
            sx={
              canEdit
                ? {
                    background:
                      "linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, " +
                      "rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)",
                  }
                : { background: "none" }
            }
            actionIcon={
              canEdit && (
                <IconButton size="medium" onClick={() => console.log("click")}>
                  <Close fontSize="inherit" />
                </IconButton>
              )
            }
          />
        </ImageListItem>
      ))}
      {canEdit && (
        <ImageListItem>
          <Button
            variant="outlined"
            sx={{ height: "100px", width: "135px" }}
            onClick={() => setOpenUploadWindow(true)}
          >
            <AddAPhoto />
          </Button>
          <ImageUpload
            open={openUploadWindow}
            setOpen={setOpenUploadWindow}
            profileId={3}
            //@ts-ignore
            setInput={setInput}
          />
        </ImageListItem>
      )}
    </ImageList>
  );
};

export default ReviewGallery;
