import Container from "@mui/material/Container";
import {
  ActionFunction,
  LoaderFunction,
  Navigate,
  redirect,
  useLoaderData,
  useNavigate,
  useSubmit,
} from "react-router-dom";
import { useAuth } from "../components/AuthProvider";
import { Box, Button } from "@mui/material";
import { DataGrid, GridColDef, useGridApiRef } from "@mui/x-data-grid";
import LoadingSpinner from "../components/LoadingSpinner";
import { Block, Delete, Healing } from "@mui/icons-material";
import { useState } from "react";

type TableUser = {
  id: number;
  status: "active" | "blocked";
  username: string;
  createdAt: Date;
};

const columns: GridColDef[] = [
  { field: "id", headerName: "ID", type: "number" },
  { field: "username", headerName: "Username", minWidth: 150, flex: 2 },
  { field: "status", headerName: "Status" },
  {
    field: "createdAt",
    headerName: "Registration Date",
    type: "dateTime",
    width: 180,
  },
];

const AdminDashboard = () => {
  const { user, loading: authLoading, authenticated } = useAuth();
  const navigate = useNavigate();
  const submit = useSubmit();
  const users = useLoaderData() as TableUser[];
  const apiRef = useGridApiRef();

  const [selected, setSelected] = useState<number[]>([]);

  const handleSelectionChange = () => {
    const blockIDs: TableUser["id"][] = [];
    apiRef.current.getSelectedRows().forEach((user) => blockIDs.push(user.id));
    setSelected(blockIDs);
  };

  const handleBlock = () => {
    submit(
      { id: selected, action: "block" },
      {
        encType: "application/json",
        method: "PUT",
      }
    );
    apiRef.current.setRowSelectionModel([]);
  };
  const handleUnblock = () => {
    submit(
      { id: selected, action: "unblock" },
      {
        encType: "application/json",
        method: "PUT",
      }
    );
    apiRef.current.setRowSelectionModel([]);
  };

  const handleDelete = () => {
    submit(
      { id: selected },
      {
        encType: "application/json",
        method: "DELETE",
      }
    );
    apiRef.current.setRowSelectionModel([]);
  };

  if (authLoading) return <LoadingSpinner />;
  if (!authenticated || !user || user.role != "admin")
    return <Navigate to="/" />;
  else
    return (
      <Container sx={{ pt: 2 }}>
        <Box style={{ marginBottom: 16 }}>
          <Button
            onClick={handleBlock}
            disabled={selected.length == 0}
            startIcon={<Block />}
          >
            Block
          </Button>
          <Button
            onClick={handleUnblock}
            disabled={selected.length == 0}
            startIcon={<Healing />}
          >
            Unblock
          </Button>
          <Button
            onClick={handleDelete}
            disabled={selected.length == 0}
            startIcon={<Delete />}
          >
            Delete
          </Button>
        </Box>
        <DataGrid
          rows={users}
          columns={columns}
          apiRef={apiRef}
          onRowSelectionModelChange={handleSelectionChange}
          onRowDoubleClick={(props) => navigate("/profile/" + props.row.id)}
          initialState={{
            pagination: {
              paginationModel: {
                page: 0,
                pageSize: window.innerHeight < 750 ? 5 : 10,
              },
            },
          }}
          pageSizeOptions={[5, 10, 20]}
          checkboxSelection
        />
      </Container>
    );
};

export const adminPageAction: ActionFunction = async ({ request }) => {
  if (request.method == "PUT")
    return fetch("/api/users", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(await request.json()),
    });
  if (request.method == "DELETE")
    return fetch("/api/users", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(await request.json()),
    });
  else return null;
};

export const adminPageLoader: LoaderFunction = async ({ request }) => {
  const resp = await fetch(`/api/users/`, {
    signal: request.signal,
  });
  if (!resp.ok) return redirect("/");
  const users = await resp.json();
  users.forEach(
    (user: TableUser | { createdAt: string }) =>
      (user.createdAt = new Date(user.createdAt))
  );
  return users;
};

export default AdminDashboard;
