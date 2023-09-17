import {
  ActionFunction,
  LoaderFunction,
  Outlet,
  redirect,
  useLoaderData,
} from "react-router-dom";

export const Component = () => {
  const review = useLoaderData();

  return <Outlet context={review} />;
};

export const action: ActionFunction = async ({ params, request }) => {
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

export const loader: LoaderFunction = async ({ params, request }) => {
  const resp = await fetch(`/api/reviews/${params.id}?user&comments&gallery`, {
    signal: request.signal,
  });
  if (!resp.ok) return redirect("/");
  else {
    const review = await resp.json();
    review.likesCount = review.Likes.length;
    return review;
  }
};
