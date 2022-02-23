import type { NextApiRequest, NextApiResponse, NextApiHandler } from 'next';
import { Prisma, Post } from '@prisma/client';
import { prisma } from '../../../lib/Prisma';
import { authenticated } from '../../../handlers/BearerAuth';
import type { ErrorType } from '../../../types/MessageType';

type Props = {
  id: number;
  title: string;
  content: string;
  authorId: number;
};

const putHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<Post | ErrorType>
) => {
  const { id, title, content, authorId }: Props = req.body;
  if (!id) {
    return res.status(400).json({ error: 'Bad Request' });
  }

  let statusCode = 200;
  let postBody: Prisma.PostUpdateInput;
  postBody = {
    title,
    content,
    author: { connect: { id: Number(authorId) } },
  };
  const resPost = await prisma.post
    .update({
      where: { id: Number(id) },
      data: postBody,
    })
    .catch((err) => {
      statusCode = 500;
      console.log(err);
      return { error: 'Failed to update post' };
    })
    .finally(async () => {
      prisma.$disconnect();
    });

  res.status(statusCode).json(resPost);
};

const handler: NextApiHandler = (req, res) => {
  switch (req.method) {
    case 'PUT':
      putHandler(req, res);
      break;
    default:
      return res.status(405).json({ error: 'Method not allowed.' });
  }
};

export default authenticated(handler);
