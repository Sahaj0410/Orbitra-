import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { createHttpError } from "../utils/createHttpError.js";

export async function protect(req, _res, next) {
  try {
    const header = req.headers.authorization;

    if (!header?.startsWith("Bearer ")) {
      throw createHttpError(401, "Authentication token missing");
    }

    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      throw createHttpError(401, "User no longer exists");
    }

    req.user = user;
    next();
  } catch (error) {
    next(error.status ? error : createHttpError(401, "Invalid or expired token"));
  }
}
