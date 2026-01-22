import jwt from "jsonwebtoken";

const generateToken = (res, userId) => {
  // 1. Sign the token with the User ID and your Secret Key
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });

  // 2. Set it as an HTTP-Only Cookie
  res.cookie("jwt", token, {
    httpOnly: true, // Vital: JS cannot read this (Blocks XSS)
    secure: process.env.NODE_ENV !== "development", // Use HTTPS in production
    sameSite: "strict", // Blocks CSRF
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });
};

export default generateToken;