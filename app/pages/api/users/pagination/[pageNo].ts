import type { NextApiRequest, NextApiResponse, NextApiHandler } from 'next';
import { prisma } from '../../../../lib/Prisma';
import { authenticated } from '../../../../handlers/BearerAuth';
import type { UserType } from '../../../../types/UserType';
import type { ErrorType } from '../../../../types/MessageType';

type Props = {
  pageNo: number;
};

const getHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<UserType[] | ErrorType>
) => {
  const { pageNo } = Array.isArray(req.query) ? req.query[0] : req.query;

  let statusCode = 200;
  const resUser = await prisma.user
    .findMany({
      orderBy: { id: 'asc' },
      skip: Number(pageNo * 10),
      take: 10,
      include: {
        posts: {
          orderBy: [{ updatedAt: 'desc' }, { createdAt: 'desc' }],
          take: 3,
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
      return { error: 'Failed to read user' };
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
