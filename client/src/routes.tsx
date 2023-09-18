import { Paper } from "@mui/material";
import {
  Outlet,
  createRoutesFromElements,
  Route,
  redirect,
} from "react-router-dom";
import Header from "./components/Header";

function WithHeader() {
  return (
    <>
      <Header />
      <Outlet />
    </>
  );
}

function Root() {
  return (
    <Paper sx={{ minHeight: "100dvh" }}>
      <Outlet />
    </Paper>
  );
}

const routes = createRoutesFromElements(
  <Route element={<Root />}>
    <Route element={<WithHeader />}>
      <Route path="/" lazy={() => import("./pages/Home")} />
      <Route path="/:category" lazy={() => import("./pages/Home")} />
      <Route path="/admin" lazy={() => import("./pages/AdminDashboard")} />
      <Route path="/profile/:id" lazy={() => import("./pages/Profile")} />
      <Route
        path="/reviews/create"
        lazy={() => import("./pages/CreateReview")}
      />
      <Route
        path="/reviews/:id"
        lazy={() => import("./pages/ReviewRoot")}
        shouldRevalidate={({ formData, defaultShouldRevalidate }) => {
          if (formData?.get("intent") === "add comment") return false;
          else return defaultShouldRevalidate;
        }}
      >
        <Route path="" lazy={() => import("./pages/Review")} />
        <Route path="edit" lazy={() => import("./pages/EditReview")}></Route>
        <Route
          path="delete"
          action={async ({ params, request }) => {
            if (request.method == "DELETE") {
              await fetch(`/api/reviews/${params.id}`, {
                method: "DELETE",
              });
              return redirect("/");
            }
          }}
        ></Route>
      </Route>
    </Route>
    <Route>
      <Route path="/login" lazy={() => import("./pages/Login")} />
      <Route path="/register" lazy={() => import("./pages/Register")} />
    </Route>
  </Route>
);

export default routes;
