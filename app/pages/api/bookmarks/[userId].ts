import type { NextApiRequest, NextApiResponse, NextApiHandler } from 'next';
import { prisma } from '../../../lib/Prisma';
import { authenticated } from '../../../handlers/BearerAuth';
import type { UserBookmarkType } from '../../../types/BookmarkType';
import type { ErrorType } from '../../../types/MessageType';

type Props = {
  userId: number;
};

const getHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<UserBookmarkType[] | ErrorType>
) => {
  const { userId }: Props = Array.isArray(req.query) ? req.query[0] : req.query;
  if (!userId) {
    return res.status(400).json({ error: 'Bad Request' });
  }

  let statusCode = 200;
  const resBookmark = await prisma.bookmark
    .findMany({
      where: { userId: Number(userId) },
      include: {
        post: {
          select: {
            id: true,
            title: true,
            createdAt: true,
          },
        },
      },
    })
    .catch((err) => {
      statusCode = 500;
      console.log(err);
      return { error: 'Failed to find user' };
    })
    .finally(async () => {
      await prisma.$disconnect();
    });

  return res.status(statusCode).json(resBookmark);
};

const handler: NextApiHandler = (req, res) => {
  switch (req.method) {
    case 'GET':
      getHandler(req, res);
      break;
    default:
      return res.status(405).json({ error: 'Method not allowed.' });
  }
};

export default authenticated(handler);
