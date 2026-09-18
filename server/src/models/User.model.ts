import bcrypt from "bcryptjs";
import { Schema, model, type Document, type Model } from "mongoose";

export const USER_ROLES = ["admin", "editor"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export interface UserDoc extends Document {
  username: string;
  passwordHash: string;
  role: UserRole;
  lastLoginAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

const userSchema = new Schema<UserDoc>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 64,
      index: true,
    },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: USER_ROLES, default: "admin" },
    lastLoginAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      transform(_doc, ret: Record<string, unknown>) {
        ret.id = String(ret._id);
        delete ret._id;
        delete ret.passwordHash;
        return ret;
      },
    },
  },
);

userSchema.methods.comparePassword = function comparePassword(candidate: string) {
  return bcrypt.compare(candidate, this.passwordHash as string);
};

userSchema.statics.hashPassword = (plain: string) => bcrypt.hash(plain, 10);

export const User = model<UserDoc>("User", userSchema) as Model<UserDoc> & {
  hashPassword(plain: string): Promise<string>;
};

export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export function verifyPasswordHash(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}
