import { User } from '@prisma/client';

export type UserType = User & {
  posts: {
    id: number;
    title: string;
    createdAt: Date;
  }[];
  bookmarks: {
    postId: number | null;
  }[];
  _count: {
    posts: number;
    bookmarks: number;
  };
};
