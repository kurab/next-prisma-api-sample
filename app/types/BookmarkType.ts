import { Bookmark } from '@prisma/client';

export type UserBookmarkType = Bookmark & {
  post: {
    id: number;
    title: string;
    createdAt: Date;
  } | null;
};

export type PostBookmarkType = Bookmark & {
  user: {
    id: number;
    userName: string;
    imageUrl: string | null;
  };
};
