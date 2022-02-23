import { Post, Bookmark } from '@prisma/client';

export type TransactionType = {
  post: Post;
  bookmark: Bookmark;
};
