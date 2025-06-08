import jwt from "jsonwebtoken";

export const generateToken = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
  res.cookie("jwt", token, {
    httpOnly: true, // prevent cross-site scripting attacks (XSS)
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7d in ms
    sameSite: "strict", // prevent CRSF attacks 
    secure: process.env.NODE_ENV !== "development",
  });
  return token;
};
