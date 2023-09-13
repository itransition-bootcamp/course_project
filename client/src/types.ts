export type Review = {
  id: number;
  title: string;
  text: string;
  poster: string | null;
  rating: number;
  createdAt: string;
  updatedAt?: string;
  UserId: number;
  likesCount?: number;
  Likes?: Like[];
  Tags?: Tag[];
  User?: { avatar: string; username: string };
  Comments?: Opinion[];
  Review_Images?: Image[];
  Product?: Product;
};

export type Product = { id?: number; category: string; name: string };

export type Image = {
  id?: number;
  src: string;
};

type Like = {
  ReviewId: number;
  UserId: number;
};

type Tag = {
  id: number;
  name: string;
  Review_Tags: {
    ReviewId: Review["id"];
    TagId: Tag["id"];
  };
};

type Opinion = {
  id: number;
  text: string;
  createdAt: string;
  updatedAt: string;
  UserId: number;
  ReviewId: Review["id"];
  User: { avatar?: string; username: string };
};
