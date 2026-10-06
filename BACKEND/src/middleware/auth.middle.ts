import { findUserById } from "../dao/user.dao.js";
import { verifyToken } from "../utils/helper.js";


export const authMiddleware = async (c: any, next: any) => {
  const token = c.req.cookies.get("accessToken");

  if (!token) {
    return c.json({ message: "Unauthorized" }, 401);
  }

  try {
    const decoded = verifyToken(token);
    const user = await findUserById(decoded.id);

    if (!user) {
      return c.json({ message: "Unauthorized" }, 401);
    }

    c.set("user", user);
  } catch (error) {
    return c.json({ message: "Unauthorized" }, 401);
  } 
    await next();
  }