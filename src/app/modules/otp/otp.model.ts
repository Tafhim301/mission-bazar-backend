import { model, Schema, Model } from "mongoose";
import bcrypt from "bcryptjs";

export enum OtpType {
  VERIFY_EMAIL    = "VERIFY_EMAIL",
  FORGOT_PASSWORD = "FORGOT_PASSWORD",
}

export interface IOtp {
  email: string;
  otp: string;
  type: OtpType;
  expiresAt: Date;
  isUsed: boolean;
}

export interface IOtpStatics {
  createOtp(email: string, type: OtpType): Promise<string>;
  verifyOtp(email: string, rawOtp: string, type: OtpType): Promise<boolean>;
}

type IOtpModel = Model<IOtp> & IOtpStatics;

const otpSchema = new Schema<IOtp, IOtpModel>(
  {
    email:     { type: String, required: true, lowercase: true, trim: true },
    otp:       { type: String, required: true },
    type:      { type: String, enum: Object.values(OtpType), required: true },
    expiresAt: { type: Date, required: true },
    isUsed:    { type: Boolean, default: false },
  },
  { timestamps: true, versionKey: false }
);

otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
otpSchema.index({ email: 1, type: 1 });

otpSchema.statics.createOtp = async function (email: string, type: OtpType): Promise<string> {
  const raw = Math.floor(100000 + Math.random() * 900000).toString();
  const hashed = await bcrypt.hash(raw, 10);
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
  await this.deleteMany({ email: email.toLowerCase(), type });
  await this.create({ email: email.toLowerCase(), otp: hashed, type, expiresAt });
  return raw;
};

otpSchema.statics.verifyOtp = async function (email: string, rawOtp: string, type: OtpType): Promise<boolean> {
  const record = await this.findOne({
    email: email.toLowerCase(),
    type,
    isUsed: false,
    expiresAt: { $gt: new Date() },
  });
  if (!record) return false;
  const match = await bcrypt.compare(rawOtp, record.otp);
  if (match) await this.findByIdAndUpdate(record._id, { isUsed: true });
  return match;
};

export const Otp = model<IOtp, IOtpModel>("Otp", otpSchema);
