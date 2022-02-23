import type { NextApiRequest, NextApiResponse, NextApiHandler } from 'next';
import { prisma } from '../../../lib/Prisma';
import { authenticated } from '../../../handlers/BearerAuth';
import type { UserType } from '../../../types/UserType';
import type { ErrorType } from '../../../types/MessageType';

type Props = {
  userId: number;
};

const getHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<UserType | null | ErrorType>
) => {
  const { userId }: Props = Array.isArray(req.query) ? req.query[0] : req.query;
  if (!userId) return res.status(400).json({ error: 'Bad Request' });

  let statusCode = 200;
  const resUser = await prisma.user
    .findUnique({
      //where: { id: userId }, this fails
      where: { id: Number(userId) },
      include: {
        posts: {
          orderBy: [{ updatedAt: 'desc' }, { createdAt: 'desc' }],
          select: {
            id: true,
            title: true,
            createdAt: true,
          },
        },
        bookmarks: {
          select: { postId: true },
        },
        _count: {
          select: {
            posts: true,
            bookmarks: true,
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

  res.status(statusCode).json(resUser);
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
