import "next-auth";

declare module "next-auth" {
  interface Session {
    id_token?: string;
    user?: {
      id: string;
      email: string;
    };
  }
} 