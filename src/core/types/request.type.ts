import { Request } from 'express';

export type RequestAuth = Request & {
  user: {
    sub?: string;
    email?: string;
    name?: string;
    token?: string;
    id?: string;
  };
};
