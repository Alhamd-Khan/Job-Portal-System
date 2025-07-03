import { User } from "../models/userSchema.js";
import { Admin } from "../models/adminSchema.js";
import { catchAsyncErrors } from "./catchAsyncError.js";
import ErrorHandler from "./error.js";
import jwt from "jsonwebtoken";

export const isAuthenticated = catchAsyncErrors(async (req, res, next) => {
  const { token } = req.cookies;
  if (!token) {
    return next(new ErrorHandler("User Not Authorized", 401));
  }
  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

  let user = await User.findById(decoded.id);
  if (!user) {
    user = await Admin.findById(decoded.id);
  }
  if (!user) {
    return next(new ErrorHandler("User Not Authorized", 401));
  }
  req.user = user;
  next();
});

export const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return next(new ErrorHandler("Admin access only", 403));
  }
  next();
};