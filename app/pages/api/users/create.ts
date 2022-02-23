import type { NextApiRequest, NextApiResponse, NextApiHandler } from 'next';
import { Prisma, User } from '@prisma/client';
import { prisma } from '../../../lib/Prisma';
import { authenticated } from '../../../handlers/BearerAuth';
import type { ErrorType } from '../../../types/MessageType';

type Props = {
  userName: string;
  imageUrl: string | null;
};

const postHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<User | ErrorType>
) => {
  const { userName, imageUrl }: Props = req.body;
  if (!userName) return res.status(400).json({ error: 'Bad Request' });

  let statusCode = 200;
  let userBody: Prisma.UserCreateInput;
  userBody = {
    userName: userName,
    imageUrl: imageUrl ? imageUrl : '',
  };
  const resUser = await prisma.user
    .create({ data: userBody })
    .catch((err) => {
      statusCode = 500;
      console.log(err);
      return { error: 'Failed to create user' };
    })
    .finally(async () => {
      await prisma.$disconnect();
    });

  res.status(statusCode).json(resUser);
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
