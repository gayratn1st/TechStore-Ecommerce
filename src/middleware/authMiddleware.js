const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.requireAuth = async (req, res, next) => {
  try {
    const authorization = req.headers.authorization;

    if (!authorization || !authorization.startsWith("Bearer ")) {
      return res.status(401).json({
        error: "Authentication required",
      });
    }

    const token = authorization.slice(7).trim();

    if (!token || !process.env.JWT_SECRET) {
      return res.status(401).json({
        error: "Invalid authentication token",
      });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ["HS256"],
    });

    const user = await User.findById(payload.sub);

    if (!user) {
      return res.status(401).json({
        error: "User not found",
      });
    }

    req.user = {
      id: user._id.toString(),
      role: user.role || "CUSTOMER",
    };

    next();
  } catch (error) {
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError" ||
      error.name === "CastError"
    ) {
      return res.status(401).json({
        error: "Invalid or expired token",
      });
    }

    next(error);
  }
};

exports.requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: "Authentication required",
    });
  }

  if (req.user.role !== "ADMIN") {
    return res.status(403).json({
      error: "Admin access required",
    });
  }

  next();
};
