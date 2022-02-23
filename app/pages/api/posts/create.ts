import type { NextApiRequest, NextApiResponse, NextApiHandler } from 'next';
import { Prisma, Post } from '@prisma/client';
import { prisma } from '../../../lib/Prisma';
import { authenticated } from '../../../handlers/BearerAuth';
import type { ErrorType } from '../../../types/MessageType';

type Props = {
  title: string;
  content: string;
  authorId: number;
};

const postHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<Post | ErrorType>
) => {
  const { title, content, authorId }: Props = req.body;
  if (!title || !content || !authorId) {
    return res.status(400).json({ error: 'Bad Request' });
  }

  let statusCode = 200;
  let postBody: Prisma.PostCreateInput;
  postBody = {
    title,
    content,
    author: { connect: { id: authorId } },
  };
  const resUser = await prisma.post
    .create({ data: postBody })
    .catch((err) => {
      statusCode = 500;
      console.log(err);
      return { error: 'Failed to create post' };
    })
    .finally(async () => {
      await prisma.$disconnect();
    });

  return res.status(statusCode).json(resUser);
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
