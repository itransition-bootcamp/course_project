import {
  Box,
  Button,
  IconButton,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  Input,
  Modal,
} from "@mui/material";
import { FC, MouseEventHandler, useState } from "react";
import { Review } from "../types";
import { AddAPhoto, Close } from "@mui/icons-material";
import ImageUpload from "./ImageUpload";
import ImageGallery from "react-image-gallery";
import "react-image-gallery/styles/css/image-gallery.css";

export const GalleryImage: FC<{ src: string; onClick: MouseEventHandler }> = (
  props
) => (
  <img
    {...props}
    loading="lazy"
    style={{
      maxHeight: "100px",
    }}
  />
);

type GalleryProps = {
  images: Review["Review_Images"];
  canEdit: boolean;
};

const ReviewGallery: FC<GalleryProps> = ({ images, canEdit }) => {
  const [openUploadWindow, setOpenUploadWindow] = useState(false);
  const [galleryInput, setGalleryInput] = useState(() => images || []);
  const [startIndex, setStartIndex] = useState(0);

  const [open, setOpen] = useState(false);
  const openCarousel = () => setOpen(true);
  const closeCarousel = () => setOpen(false);

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
            <GalleryImage
              src={image.src}
              onClick={() => {
                openCarousel();
                setStartIndex(i);
              }}
            />
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
      {galleryInput && galleryInput.length > 0 && (
        <Modal open={open} onClose={closeCarousel}>
          <Box
            position={"absolute"}
            top={"50%"}
            left={"50%"}
            sx={{ transform: "translate(-50%, -50%)", outline: "none" }}
          >
            <ImageGallery
              lazyLoad
              showPlayButton={false}
              slideDuration={150}
              startIndex={startIndex}
              items={galleryInput.map((img) => {
                return {
                  original: img.src,
                  thumbnail: img.src,
                };
              })}
            />
          </Box>
        </Modal>
      )}
    </>
  );
};

export default ReviewGallery;
