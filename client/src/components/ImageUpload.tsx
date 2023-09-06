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
import { useDropzone } from "react-dropzone";
import { Dispatch, FC, SetStateAction, useCallback, useState } from "react";
import { CloudUploadOutlined } from "@mui/icons-material";
import { isMobile } from "react-device-detect";

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

const ImageUpload: FC<{
  profileId: number;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  setInput: Dispatch<SetStateAction<string>>;
}> = ({ profileId, open, setOpen, setInput }) => {
  const [loading, setLoading] = useState(false);
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length != 1) return;
      setLoading(true);
      const formData = new FormData();
      formData.append("avatar", acceptedFiles[0]);
      fetch(`/api/users/${profileId}/avatar`, {
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
    },
    [profileId]
  );

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragReject,
    fileRejections,
  } = useDropzone({
    onDrop,
    accept: { "image/png": [], "image/jpeg": [] },
    maxFiles: 1,
    maxSize: 1024 * 1024 * 3,
  });

  const cloudColor = isDragActive
    ? isDragReject
      ? "error"
      : "primary"
    : "action";

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
            {isMobile
              ? "Tap to select image from gallery"
              : "Drag and drop image file here, or click to select from device"}
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
