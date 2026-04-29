import { Document, Types } from "mongoose";

export enum ProductStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  DRAFT = "DRAFT",
}

export interface ISpecification {
  key: string;
  value: string;
}

export interface IProduct {
  name: string;
  slug: string;
  description?: string;
  price: number;
  discountPrice?: number;
  images: string[];
  imagePublicIds: string[];
  category: Types.ObjectId;       // ref: Category
  brand?: string;
  stock: number;
  sold: number;
  tags: string[];
  specifications: ISpecification[];
  status: ProductStatus;
  isDeleted: boolean;
  vendor: Types.ObjectId;         // ref: User
  deleteImages?: string[];        // transient — not persisted
}

export interface IProductDocument extends IProduct, Document {}
