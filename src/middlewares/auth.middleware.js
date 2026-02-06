import jwt from "jsonwebtoken";

export const auth = (req, res, next) => {
  try {
    const token = req.headers.token;

    if (!token) {
      return res.status(401).json({ message: "Token is required" });
    }

    const decoded = jwt.verify(token, "loginSecretKey");

    req.userId = decoded.userId;

    next();
  } catch (error) {
    return res
      .status(400)
      .json({ message: "Invalid token", error: error.message });
  }
};

