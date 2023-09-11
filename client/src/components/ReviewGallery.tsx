import {
  Button,
  IconButton,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  Input,
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
  const [galleryInput, setGalleryInput] = useState(() => images || []);

  return (
    <>
      <ImageList
        gap={10}
        sx={{
          display: "flex",
          flexWrap: "wrap",
        }}
      >
        {galleryInput?.map((image, i) => (
          <ImageListItem key={i} sx={{ width: "fit-content" }}>
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
                  <IconButton
                    size="medium"
                    onClick={() =>
                      setGalleryInput((prev) =>
                        prev.filter((_, index) => index != i)
                      )
                    }
                  >
                    <Close fontSize="inherit" sx={{ color: "white" }} />
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
              multiple
              appendInputValue
              uploadUrl={`/api/reviews/gallery`}
              open={openUploadWindow}
              setOpen={setOpenUploadWindow}
              setInput={setGalleryInput}
            />
          </ImageListItem>
        )}
      </ImageList>
      <Input
        sx={{ display: "none" }}
        name="reviewGallery"
        value={JSON.stringify(galleryInput)}
      />
    </>
  );
};

export default ReviewGallery;
