import { resolveRequestSession } from "../utils/requestSession.js";

export default async function verifySession(req, res, next) {
  try {
    const session = await resolveRequestSession(req, { required: true });
    req.session = session;
    next();
  } catch (error) {
    res.status(error?.statusCode ?? 401).json({
      success: false,
      message: error?.message ?? "Unauthorized",
    });
  }
}
