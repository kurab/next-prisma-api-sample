import type { NextApiRequest, NextApiResponse, NextApiHandler } from 'next';
import { prisma } from '../../../../lib/Prisma';
import { authenticated } from '../../../../handlers/BearerAuth';
import type { PostType } from '../../../../types/PostType';
import type { ErrorType } from '../../../../types/MessageType';

const getHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<PostType[] | ErrorType>
) => {
  const { pageNo } = Array.isArray(req.query) ? req.query[0] : req.query;

  let statusCode = 200;
  const resPost = await prisma.post
    .findMany({
      orderBy: { createdAt: 'desc' },
      skip: Number(pageNo * 10),
      take: 10,
      include: {
        author: {
          select: {
            id: true,
            userName: true,
            imageUrl: true,
          },
        },
        _count: {
          select: {
            bookmarks: true,
          },
        },
      },
    })
    .catch((err) => {
      statusCode = 500;
      console.log(err);
      return { error: 'Failed to read posts' };
    })
    .finally(async () => {
      await prisma.$disconnect();
    });

  return res.status(200).json(resPost);
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
