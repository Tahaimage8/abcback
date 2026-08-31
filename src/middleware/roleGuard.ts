import { Request, Response, NextFunction } from "express";

export function requireRoles(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const userRole = (req.user?.role || "MEMBER").toUpperCase();
    const uppercaseAllowedRoles = allowedRoles.map((r) => r.toUpperCase());

    if (!uppercaseAllowedRoles.includes(userRole)) {
      res.status(403).json({
        error: `Forbidden: Insufficient permissions. Required role: ${allowedRoles.join(" or ")}`,
      });
      return;
    }

    next();
  };
}
