import type { NextApiRequest, NextApiResponse, NextApiHandler } from 'next';
import { Post } from '@prisma/client';
import { prisma } from '../../../lib/Prisma';
import { authenticated } from '../../../handlers/BearerAuth';
import type { ErrorType } from '../../../types/MessageType';

type Props = {
  id: number;
};

const deleteHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<Post | ErrorType>
) => {
  const { id }: Props = req.body;
  if (!id) return res.status(400).json({ error: 'Bad Request' });

  let statusCode = 200;
  const resPost = await prisma.post
    .delete({ where: { id } })
    .catch((err) => {
      statusCode = 500;
      console.log(err);
      return { error: 'Failed to delete post' };
    })
    .finally(async () => {
      await prisma.$disconnect();
    });

  return res.status(statusCode).json(resPost);
};

const handler: NextApiHandler = (req, res) => {
  switch (req.method) {
    case 'DELETE':
      deleteHandler(req, res);
      break;
    default:
      return res.status(405).json({ error: 'Method not allowed.' });
  }
};

export default authenticated(handler);
