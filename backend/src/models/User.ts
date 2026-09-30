import mongoose, { type InferSchemaType } from "mongoose";

// Account document. The password itself is never stored; auth hashing
// writes only passwordHash. Email is the login identifier.
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    // Hidden by default so product, cart, and order queries cannot leak hashes.
    // Login selects it explicitly when it needs to compare a password.
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
  },
  { timestamps: true },
);

export type User = InferSchemaType<typeof userSchema>;
export type UserDocument = mongoose.HydratedDocument<User>;

export const UserModel = mongoose.model("User", userSchema);
