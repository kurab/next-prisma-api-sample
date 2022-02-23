import type { NextApiRequest, NextApiResponse, NextApiHandler } from 'next';
import { Prisma, Post } from '@prisma/client';
import { prisma } from '../../../lib/Prisma';
import { authenticated } from '../../../handlers/BearerAuth';
import type { TransactionType } from '../../../types/TransactionType';
import type { ErrorType } from '../../../types/MessageType';

type Props = {
  title: string;
  content: string;
  userId: number;
};

// create post and bookmark
// any good transaction sample? haha
// Long Run Transaction is preview Feature. add it on schema.prisma
const postHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<TransactionType | ErrorType>
) => {
  const { title, content, userId }: Props = req.body;
  if (!title || !content || !userId) {
    return res.status(400).json({ error: 'Bad Request' });
  }

  let statusCode = 200;
  const transaction = await prisma
    .$transaction(
      async (tx) => {
        let postBody: Prisma.PostCreateInput;
        postBody = {
          title,
          content,
          author: { connect: { id: userId } },
        };
        const post = await tx.post.create({ data: postBody });

        let bookmarkBody: Prisma.BookmarkCreateInput;
        const fakeId = 0;
        bookmarkBody = {
          //post: { connect: { id: post.id } },
          post: { connect: { id: fakeId } },
          user: { connect: { id: userId } },
        };
        const bookmark = await tx.bookmark.create({ data: bookmarkBody });

        return {
          post: post,
          bookmark: bookmark,
        };
      },
      {
        maxWait: 2000,
        timeout: 5000,
      }
    )
    .catch((err) => {
      statusCode = 500;
      console.log(err);
      return { error: 'Failed transaction' };
    })
    .finally(async () => {
      await prisma.$disconnect();
    });

  return res.status(statusCode).json(transaction);
};

const handler: NextApiHandler = (req, res) => {
  switch (req.method) {
    case 'POST':
      postHandler(req, res);
      break;
    default:
      return res.status(405).json({ error: 'Method not allowed.' });
  }
};

export default authenticated(handler);
