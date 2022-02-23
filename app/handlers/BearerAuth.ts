import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';
import { verify } from 'jsonwebtoken';

export const authenticated = (handler: NextApiHandler) => {
  return (req: NextApiRequest, res: NextApiResponse) => {
    const authHeader: string | undefined = req.headers.authorization;
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );
    if (req.method === 'OPTIONS') {
      return res.status(204).end();
    }

    // click jacking attack
    res.setHeader('X-FRAME-OPTIONS', 'DENY');

    if (authHeader === undefined || authHeader.split(' ')[0] !== 'Bearer') {
      return res.status(406).json({ error: 'Authorization Required.' });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ error: 'Something went wrong.' });
    }

    verify(
      authHeader.split(' ')[1],
      process.env.JWT_SECRET,
      async (err, decoded) => {
        if (!err && decoded) {
          /* if you want to set something from JWT, set here
          ex
            req['userId'] = decoded.userId;
            -- in each API, update request object
            type NextApiRequestWithUserId = NextApiRequest & { userId: number; };
            export default ...handler(
              req: NextApiRequestWithUserId,
              res: NextApiResponse
            );
            then, you can access by req.userId
          */
          return await handler(req, res);
        } else {
          return res.status(401).json({ error: 'Authorization failed' });
        }
      }
    );
  };
};
