import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || "User";

export function getAuthUser(req) {
  try {
    const authHeader = req.headers.get("authorization") || req.headers.get("Authorization");
    if (!authHeader) return null;
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;
    const decoded = jwt.decode(token);
    if (decoded && decoded.data) {
      return decoded.data;
    }
    return null;
  } catch (err) {
    return null;
  }
}

export function signToken(data) {
  return jwt.sign({ data }, JWT_SECRET);
}
