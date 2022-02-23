import { Post } from '@prisma/client';
export type PostType = Post & {
  author: {
    id: number;
    userName: string;
    imageUrl: string | null;
  };
  _count: {
    bookmarks: number;
  };
};
