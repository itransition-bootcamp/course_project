import {
  ActionFunction,
  LoaderFunction,
  Outlet,
  redirect,
  useLoaderData,
} from "react-router-dom";

const ReviewRoot = () => {
  const review = useLoaderData();
  return <Outlet context={review} />;
};

export const reviewRootAction: ActionFunction = async ({ params, request }) => {
  console.log("root action");
  if (request.method == "POST") {
    const formData = await request.formData();
    const intent = formData.get("intent");
    const comment = formData.get("comment");
    if (!comment) return null;
    if (intent === "add comment") {
      return fetch(`/api/reviews/${params.id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          comment: comment,
        }),
      });
    }
  } else return null;
};

export const reviewRootLoader: LoaderFunction = async ({ params, request }) => {
  console.log("root loader");
  const resp = await fetch(`/api/reviews/${params.id}?user&comments`, {
    signal: request.signal,
  });
  if (!resp.ok) return redirect("/");
  else return resp;
};

export default ReviewRoot;
