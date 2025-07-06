import { Schema, model, Document } from "mongoose";
import bcrypt from "bcryptjs";
import { IUser } from "./User.Types";

// User Schema
const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email address",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters long"],
      select: false,
    },
    role: {
      type: String,
      enum: ["admin", "teacher"],
      default: "teacher",
      required: true,
    },
    profileImage: {
      type: String,
      default: null,
    },
    teacherId: {
      type: String,
      sparse: true,
      unique: true,
      required: function (this: IUser) {
        return this.role === "teacher";
      },
    },
    adminId: {
      type: String,
      sparse: true,
      unique: true,
      required: function (this: IUser) {
        return this.role === "admin";
      },
    },
    department: {
      type: String,
      trim: true,
    },
    phoneNumber: {
      type: String,
      trim: true,
      default: null,
      match: [/^\+?[\d\s-()]+$/, "Please enter a valid phone number"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ teacherId: 1 });
userSchema.index({ role: 1 });
userSchema.index({ department: 1 });

// Pre-save middleware to hash password
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

const User = model<IUser>("User", userSchema);

export default User;
