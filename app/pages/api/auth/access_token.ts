import type { NextApiRequest, NextApiResponse, NextApiHandler } from 'next';
import { prisma } from '../../../lib/Prisma';
import { cors } from '../../../handlers/Cors';
import { sign } from 'jsonwebtoken';
import type { TokenType } from '../../../types/TokenType';
import type { ErrorType } from '../../../types/MessageType';

type Props = {
  secret: string;
  id: number;
};

const postHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<TokenType | ErrorType>
) => {
  const { secret, id }: Props = req.body;

  if (!process.env.TOKEN_SECRET || !process.env.JWT_SECRET) {
    return res.status(500).json({ error: 'Something went wrong' });
  }

  if (!secret || !id) return res.status(500).json({ error: 'Bad Request' });
  if (secret !== process.env.TOKEN_SECRET)
    return res.status(401).json({ error: 'TOKEN_SECRET is not correct' });

  const user = await prisma.user
    .findUnique({
      where: { id: Number(id) },
    })
    .finally(async () => await prisma.$disconnect());

  if (!user) return res.status(204).json({ error: 'User does not exist' });

  const token = sign(
    {
      userId: id,
      userName: user.userName,
    },
    process.env.JWT_SECRET,
    { expiresIn: '6h' }
  );

  return res
    .status(200)
    .json({ access_token: token, userId: id, userName: user.userName });
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

export default cors(handler);
