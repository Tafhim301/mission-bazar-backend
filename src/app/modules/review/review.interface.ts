import { Document, Types } from "mongoose";

export interface ISellerReply {
  comment: string;
  repliedAt: Date;
  repliedBy: Types.ObjectId; // ref: User (vendor/admin)
}

export interface IReview {
  user: Types.ObjectId;
  product: Types.ObjectId;
  rating: number;
  comment: string;
  images: string[];
  isVerifiedPurchase: boolean;
  sellerReply?: ISellerReply;
}

export interface IReviewDocument extends IReview, Document {
  createdAt: Date;
  updatedAt: Date;
}
