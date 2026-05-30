import User from "../models/User.js";
import { createHttpError } from "../utils/createHttpError.js";
import { signToken } from "../utils/token.js";

function authResponse(user) {
  return {
    token: signToken(user._id),
    user: {
      id: user._id,
      name: user.name,
      email: user.email
    }
  };
}

export async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      throw createHttpError(400, "Name, email, and password are required");
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw createHttpError(409, "An account with this email already exists");
    }

    const user = await User.create({ name, email, password });
    res.status(201).json(authResponse(user));
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw createHttpError(400, "Email and password are required");
    }

    const user = await User.findOne({ email });
    const passwordMatches = user ? await user.comparePassword(password) : false;

    if (!passwordMatches) {
      throw createHttpError(401, "Invalid email or password");
    }

    res.json(authResponse(user));
  } catch (error) {
    next(error);
  }
}

export function me(req, res) {
  res.json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email
    }
  });
}
