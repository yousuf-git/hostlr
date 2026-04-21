import { StatusCodes } from "http-status-codes";
import { generateApiResponse } from "./utilities.service.js";

export const ROLES = { ADMIN: "admin", OWNER: "owner", FINDER: "finder" };

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return generateApiResponse(res, StatusCodes.UNAUTHORIZED, false, "Authentication required.");
    if (!roles.includes(req.user.role)) return generateApiResponse(res, StatusCodes.FORBIDDEN, false, "Access denied.");
    next();
  };
}
