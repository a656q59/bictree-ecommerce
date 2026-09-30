// Shape attached by the auth middleware after a Bearer token is verified
// and the user still exists. Cart and order routes will read this later.
export type AuthUser = {
  id: string;
  name: string;
  email: string;
};

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
      // Express 5 exposes req.query as a getter, so parsed query/params
      // cannot be written back onto those fields. Later steps stash them here.
      validatedQuery?: unknown;
      validatedParams?: unknown;
    }
  }
}

export {};
