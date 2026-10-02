import { nanoid } from "nanoid";
import jsonwebtoken from "jsonwebtoken";

export interface AuthTokenPayload {
  id: string;
  email: string;
}

export const generateNanoid = (length: number) => {
  return nanoid(length);
}

export const signToken = async (payload: any) => {
  return jsonwebtoken.sign(
    payload,
    process.env.JWT_SECRET as string,
    {
      expiresIn: "1d",
    }
  );
};

export const verifyToken = (token: string): AuthTokenPayload => {
  return jsonwebtoken.verify(
    token,
    process.env.JWT_SECRET as string
  ) as AuthTokenPayload;
};  
   