import type { NextApiRequest, NextApiResponse } from 'next';
import type { ErrorType } from '../../types/MessageType';
type Data = {
  name: string;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data | ErrorType>
) {
  const authHeader: string | undefined = req.headers.authorization;
  if (authHeader === undefined) {
    return res.status(406).json({ error: 'Authorization Required' });
  }

  res.status(200).json({ name: 'John Doe' });
}
