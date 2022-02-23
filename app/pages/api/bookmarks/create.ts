import type { NextApiRequest, NextApiResponse, NextApiHandler } from 'next';
import { Prisma, Bookmark } from '@prisma/client';
import { prisma } from '../../../lib/Prisma';
import { authenticated } from '../../../handlers/BearerAuth';
import type { ErrorType } from '../../../types/MessageType';

type Props = {
  postId: number;
  userId: number;
};

const postHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<Bookmark | ErrorType>
) => {
  const { postId, userId }: Props = req.body;
  if (!postId || !userId) {
    return res.status(400).json({ error: 'Bad Request' });
  }

  let statusCode = 200;
  let bookmarkBody: Prisma.BookmarkCreateInput;
  bookmarkBody = {
    post: { connect: { id: postId } },
    user: { connect: { id: userId } },
  };
  const resBookmark = await prisma.bookmark
    .create({ data: bookmarkBody })
    .catch((err) => {
      statusCode = 500;
      console.log(err);
      return { error: 'Failed to create bookmark' };
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
  return res.status(statusCode).json(resBookmark);
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
