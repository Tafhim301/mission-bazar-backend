import bcrypt from "bcryptjs";
import { model, Schema } from "mongoose";
import { envVars } from "../../config/env";
import { ApprovalStatus, IUserDocument, UserRole, UserStatus } from "./user.interface";

// === Schema ==================================================================

const UserSchema = new Schema<IUserDocument>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [60, "Name must not exceed 60 characters"],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.USER,
    },
    status: {
      type: String,
      enum: Object.values(UserStatus),
      default: UserStatus.ACTIVE,
    },
    approvalStatus: {
      type: String,
      enum: Object.values(ApprovalStatus),
      default: ApprovalStatus.PENDING,
    },
    profileImage: {
      type: String,
      default: null,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    passwordChangedAt: {
      type: Date,
      select: false,
    },
    wallet: {
      type: Schema.Types.ObjectId,
      ref: "Wallet",
      default: null,
    },
    transactions: [
      {
        type: Schema.Types.ObjectId,
        ref: "Transaction",
      },
    ],
  },
  {
    timestamps: true,
    toJSON: {
      versionKey: false,
      transform: (_doc, ret: Record<string, unknown>) => {
        delete ret.password;
        delete ret.passwordChangedAt;
        return ret;
      },
    },
  }
);

// === Indexes =================================================================
// phone and email already have indexes via unique:true / sparse:true on the
// field definition — adding schema.index() for them would create duplicates.

UserSchema.index({ role: 1, status: 1 });

// === Query Middleware: auto-exclude soft-deleted docs ========================

UserSchema.pre(/^find/, function (next) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (this as any).find({ isDeleted: { $ne: true } });
  next();
});

// === Pre-save Hook: hash password ============================================

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, envVars.BCRYPT_SALT_ROUND);
  next();
});

// === Instance Methods ========================================================

UserSchema.methods.isPasswordMatch = async function (
  plainPassword: string
): Promise<boolean> {
  return bcrypt.compare(plainPassword, this.password);
};

UserSchema.methods.isJWTIssuedBeforePasswordChange = function (
  jwtIssuedAt: number
): boolean {
  if (this.passwordChangedAt) {
    const passwordChangedTimestamp = Math.floor(
      this.passwordChangedAt.getTime() / 1000
    );
    return jwtIssuedAt < passwordChangedTimestamp;
  }
  return false;
};

// === Export ==================================================================

export const User = model<IUserDocument>("User", UserSchema);
