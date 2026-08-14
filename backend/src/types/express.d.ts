declare namespace Express {
  export interface Request {
    auth?: {
      uid: string;
      email?: string;
      providerIds?: string[];
    };
  }
}
