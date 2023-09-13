import { CloudUploadOutlined } from "@mui/icons-material";
import {
  Box,
  Card,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Modal,
  SxProps,
  Typography,
} from "@mui/material";
import { Dispatch, FC, SetStateAction, useState } from "react";
import { isMobile } from "react-device-detect";
import { useDropzone } from "react-dropzone";
import { FormattedMessage } from "react-intl";
import { Image } from "../types";

const rootStyle: SxProps = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  minWidth: 350,
  textAlign: "center",
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 1,
};

type ImageUploadSingle = {
  multiple?: false;
  appendInputValue?: boolean;
  uploadUrl: string;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  setInput:
    | Dispatch<SetStateAction<string>>
    | Dispatch<SetStateAction<string[]>>;
};

type ImageUploadMultiple = {
  multiple: true;
  appendInputValue?: boolean;
  uploadUrl: string;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  setInput: Dispatch<SetStateAction<Image[]>>;
};

const ImageUpload: FC<ImageUploadSingle | ImageUploadMultiple> = ({
  multiple = false,
  appendInputValue = false,
  uploadUrl,
  open,
  setOpen,
  setInput,
}) => {
  const [loading, setLoading] = useState(false);
  let onDrop;
  if (multiple)
    onDrop = (acceptedFiles: File[]) => {
      if (acceptedFiles.length < 1) return;
      setLoading(true);
      const formData = new FormData();
      acceptedFiles.map((image) => formData.append("gallery", image));
      fetch(uploadUrl, {
        method: "POST",
        body: formData,
      })
        .then((response) => {
          if (response.ok) return response.json();
        })
        .then((data) => {
          if (data.urls) {
            if (appendInputValue)
              //@ts-ignore
              setInput((prev: string[] | { src: string }[]) =>
                prev ? [...prev, ...data.urls] : [...data.urls]
              );
            else setInput(data.urls);
            setLoading(false);
            setOpen(false);
          }
        });
    };
  else
    onDrop = (acceptedFiles: File[]) => {
      if (acceptedFiles.length != 1) return;
      setLoading(true);
      const formData = new FormData();
      formData.append("avatar", acceptedFiles[0]);
      fetch(uploadUrl, {
        method: "POST",
        body: formData,
      })
        .then((response) => {
          if (response.ok) return response.json();
        })
        .then((data) => {
          if (data.url) {
            setInput(data.url);
            setLoading(false);
            setOpen(false);
          }
        });
    };

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragReject,
    fileRejections,
  } = useDropzone({
    onDrop,
    accept: { "image/png": [], "image/jpeg": [] },
    maxFiles: multiple ? undefined : 1,
    maxSize: 1024 * 1024 * 3,
  });

  const cloudColor = isDragActive
    ? isDragReject
      ? "error"
      : "primary"
    : "action";
  let message;

  if (isMobile) {
    if (multiple)
      message = <FormattedMessage id="app.imageUploader.mobile.multiple" />;
    else message = <FormattedMessage id="app.imageUploader.mobile.single" />;
  } else {
    if (multiple)
      message = <FormattedMessage id="app.imageUploader.default.multiple" />;
    else message = <FormattedMessage id="app.imageUploader.default.single" />;
  }

  return (
    <Modal open={open} onClose={() => setOpen(false)}>
      <Card
        {...getRootProps({
          sx: rootStyle,
        })}
      >
        <Box
          sx={{
            border: "dashed",
            borderColor: "grey.600",
            p: 4,
            pb: 2,
            bgcolor: isDragActive ? "action.hover" : "initial",
          }}
        >
          <input {...getInputProps()} />

          <Typography variant="h6" mb={4}>
            {message}
          </Typography>
          {loading && <CircularProgress />}
          {!loading && (
            <CloudUploadOutlined color={cloudColor} sx={{ fontSize: "75px" }} />
          )}
          {fileRejections.map(({ file, errors }) => {
            return (
              <List key={file.name}>
                {errors.map((e) => (
                  <ListItem key={e.code}>
                    <ListItemText
                      primaryTypographyProps={{ color: "error" }}
                      primary={e.message}
                    />
                  </ListItem>
                ))}
              </List>
            );
          })}
        </Box>
      </Card>
    </Modal>
  );
};

export default ImageUpload;
