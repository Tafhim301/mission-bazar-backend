import { Document, Types } from "mongoose";

export enum FeaturedType {
  FLASH_SALE = "FLASH_SALE",
  TRENDING   = "TRENDING",
}

export interface IFeatured {
  product:       Types.ObjectId;
  type:          FeaturedType;
  discountedPrice?: number;   // overrides product price for flash sale display
  endsAt?:       Date;        // flash sale expiry (optional)
  order:         number;      // display sort order
  isActive:      boolean;
}

export interface IFeaturedDocument extends IFeatured, Document {}
