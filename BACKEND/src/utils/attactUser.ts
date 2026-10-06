import { getCookie } from "hono/cookie";
import { findUserById } from "../dao/user.dao.js";
import { verifyToken } from "../utils/helper.js";

export const attachUser = async (c: any, next: any) => {
  const token = getCookie(c, "accessToken");

  if (!token) {
    return next();
  }
  try {
    const decoded = await verifyToken(token);
    const user = await findUserById(decoded.id);
    if (!user) {
      return next();
    }
    c.set("user", user);
    return next();
  } catch (err) {
    return next();
  }
};
