import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { UserModel } from "../models/User";
import { AppError } from "../utils/AppError";
import type { LoginInput, RegisterInput } from "../validators/auth.schemas";

const BCRYPT_ROUNDS = 10;
const TOKEN_EXPIRES_IN = "7d";

// Compared when the email does not exist, so login timing does not reveal
// which emails are registered.
const DUMMY_PASSWORD_HASH = bcrypt.hashSync("not-a-user-password", BCRYPT_ROUNDS);

type PublicUser = {
  id: string;
  name: string;
  email: string;
};

type AuthResult = {
  user: PublicUser;
  token: string;
};

function toPublicUser(user: { id: string; name: string; email: string }): PublicUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
}

function signToken(userId: string): string {
  return jwt.sign({ sub: userId }, env.JWT_SECRET, { expiresIn: TOKEN_EXPIRES_IN });
}

function isDuplicateKeyError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: unknown }).code === 11000
  );
}

// The create-account form has no name field. The user document still stores one,
// taken from the part of the email before @.
function nameFromEmail(email: string): string {
  const localPart = email.split("@")[0]?.trim() || "Customer";
  return localPart.slice(0, 100);
}

export async function register(input: RegisterInput): Promise<AuthResult> {
  const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);

  try {
    const user = await UserModel.create({
      name: nameFromEmail(input.email),
      email: input.email,
      passwordHash,
    });

    return {
      user: toPublicUser(user),
      token: signToken(user.id),
    };
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      throw new AppError(409, "EMAIL_ALREADY_EXISTS", "An account with this email already exists");
    }
    throw error;
  }
}

export async function login(input: LoginInput): Promise<AuthResult> {
  const user = await UserModel.findOne({ email: input.email }).select("+passwordHash");

  if (!user) {
    await bcrypt.compare(input.password, DUMMY_PASSWORD_HASH);
    throw new AppError(401, "INVALID_CREDENTIALS", "Email or password is incorrect");
  }

  const passwordHash = user.passwordHash;
  if (!passwordHash) {
    throw new AppError(401, "INVALID_CREDENTIALS", "Email or password is incorrect");
  }

  const matches = await bcrypt.compare(input.password, passwordHash);
  if (!matches) {
    throw new AppError(401, "INVALID_CREDENTIALS", "Email or password is incorrect");
  }

  return {
    user: toPublicUser(user),
    token: signToken(user.id),
  };
}
