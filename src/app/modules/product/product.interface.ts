import { Document, Types } from "mongoose";

export enum ProductStatus {
  ACTIVE   = "ACTIVE",
  INACTIVE = "INACTIVE",
  DRAFT    = "DRAFT",
}

export enum DiscountType {
  PERCENTAGE = "PERCENTAGE",
  FLAT       = "FLAT",
}

export interface ISpecification { key: string; value: string; }

export interface IVariant {
  label: string;   // e.g. "Color"
  value: string;   // e.g. "White"
  image?: string;  // variant-specific image URL
}

export interface IProduct {
  name: string;
  slug: string;
  sku?: string;
  description?: string;
  singleItemPrice: number;   // qty 1–11
  wholesalePrice?: number;   // qty 12+
  discount?: number;
  discountType?: DiscountType;
  images: string[];
  imagePublicIds: string[];
  variants: IVariant[];
  category: Types.ObjectId;
  brand?: string;
  stock: number;
  sold: number;
  tags: string[];
  specifications: ISpecification[];
  avgRating: number;
  totalReviews: number;
  freeShipping: boolean;
  status: ProductStatus;
  isDeleted: boolean;
  vendor: Types.ObjectId;
  deleteImages?: string[];
}

export interface IProductDocument extends IProduct, Document {}
