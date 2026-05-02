import bcrypt from "bcryptjs";
import { model, Schema } from "mongoose";
import { envVars } from "../../config/env";
import {
  AddressLabel, ApprovalStatus, IAddress, ICartItem,
  IUserDocument, UserRole, UserStatus,
} from "./user.interface";

const addressSchema = new Schema<IAddress>(
  {
    label:        { type: String, enum: Object.values(AddressLabel), default: AddressLabel.HOME },
    contactName:  { type: String, required: true, trim: true },
    contactPhone: { type: String, required: true, trim: true },
    street:       { type: String, required: true, trim: true },
    landmark:     { type: String, trim: true },
    district:     { type: String, required: true, trim: true },
    zone:         { type: String, required: true, trim: true },
    area:         { type: String, required: true, trim: true },
    isDefault:    { type: Boolean, default: false },
  },
  { _id: true }
);

const cartItemSchema = new Schema<ICartItem>(
  {
    product:  { type: Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, required: true, min: 1, default: 1 },
  },
  { _id: false }
);

const UserSchema = new Schema<IUserDocument>(
  {
    name:     { type: String, required: [true, "Name is required"], trim: true, minlength: 2, maxlength: 60 },
    email:    { type: String, required: [true, "Email is required"], unique: true, lowercase: true, trim: true },
    phone:    { type: String, unique: true, sparse: true, trim: true },
    password: { type: String, required: [true, "Password is required"], minlength: 6, select: false },
    role:             { type: String, enum: Object.values(UserRole), default: UserRole.USER },
    status:           { type: String, enum: Object.values(UserStatus), default: UserStatus.ACTIVE },
    approvalStatus:   { type: String, enum: Object.values(ApprovalStatus), default: ApprovalStatus.PENDING },
    profileImage:     { type: String, default: null },
    googleId:         { type: String, sparse: true },
    isVerified:       { type: Boolean, default: false },
    address:          { type: [addressSchema], default: [] },
    cart:             { type: [cartItemSchema], default: [] },
    purchasedProducts: [{ type: Schema.Types.ObjectId, ref: "Order" }],
    reviews:           [{ type: Schema.Types.ObjectId, ref: "Review" }],
    vendorAvgRating:   { type: Number, default: 0, min: 0, max: 5 },
    vendorTotalReviews:{ type: Number, default: 0, min: 0 },
    isDeleted:         { type: Boolean, default: false },
    passwordChangedAt: { type: Date, select: false },
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

UserSchema.index({ role: 1, status: 1 });

UserSchema.pre(/^find/, function (next) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (this as any).find({ isDeleted: { $ne: true } });
  next();
});

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, envVars.BCRYPT_SALT_ROUND);
  next();
});

UserSchema.methods.isPasswordMatch = async function (plain: string) {
  return bcrypt.compare(plain, this.password);
};

UserSchema.methods.isJWTIssuedBeforePasswordChange = function (iat: number) {
  if (this.passwordChangedAt) return iat < Math.floor(this.passwordChangedAt.getTime() / 1000);
  return false;
};

export const User = model<IUserDocument>("User", UserSchema);
