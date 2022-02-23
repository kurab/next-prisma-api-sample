import type { NextApiRequest, NextApiResponse, NextApiHandler } from 'next';
import { prisma } from '../../../../lib/Prisma';
import { authenticated } from '../../../../handlers/BearerAuth';
import type { PostBookmarkType } from '../../../../types/BookmarkType';
import type { ErrorType } from '../../../../types/MessageType';

type Props = {
  postId: number;
};

const getHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<PostBookmarkType[] | ErrorType>
) => {
  const { postId }: Props = Array.isArray(req.query) ? req.query[0] : req.query;
  if (!postId) {
    return res.status(400).json({ error: 'Bad Request' });
  }

  let statusCode = 200;
  const resUser = await prisma.bookmark
    .findMany({
      where: { postId: Number(postId) },
      include: {
        user: {
          select: {
            id: true,
            userName: true,
            imageUrl: true,
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

  return res.status(statusCode).json(resUser);
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
