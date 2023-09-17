import { DataGrid, GridColDef, useGridApiRef } from "@mui/x-data-grid";
import { useLoaderData, useNavigate } from "react-router-dom";
import { Profile } from "../pages/Profile";

const columns: GridColDef[] = [
  { field: "id", headerName: "ID", type: "number" },
  { field: "title", headerName: "Title", minWidth: 150, flex: 2 },
  { field: "text", headerName: "Text", flex: 4 },
  {
    field: "Product.name",
    headerName: "Review Subject",
    valueGetter: (params) => params.row?.Product?.name,
  },
  {
    field: "Product.category",
    headerName: "Category",
    valueGetter: (params) => params.row?.Product?.category,
  },
  {
    field: "rating",
    headerName: "Rating",
    type: "number",
  },
  { field: "likesCount", headerName: "Likes", type: "number" },
];

const ReviewsTable = () => {
  const navigate = useNavigate();
  const { Reviews } = useLoaderData() as Profile;
  const apiRef = useGridApiRef();
  return (
    <DataGrid
      rows={Reviews}
      columns={columns}
      apiRef={apiRef}
      rowSelection={false}
      onRowDoubleClick={(props) => navigate("/reviews/" + props.row.id)}
      initialState={{
        pagination: {
          paginationModel: {
            page: 0,
            pageSize: window.innerHeight < 750 ? 5 : 10,
          },
        },
      }}
      pageSizeOptions={[5, 10, 20]}
    />
  );
};

export default ReviewsTable;
