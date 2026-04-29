import { Document, Types } from "mongoose";

export enum CategoryType {
  MAIN    = "MAIN",    // e.g. Groceries
  SUB     = "SUB",     // e.g. Baking & Cooking
  PRODUCT = "PRODUCT", // e.g. Cooking Ingredients
}

export interface ICategory {
  name: string;
  slug: string;
  type: CategoryType;
  parent?: Types.ObjectId; // null for MAIN, required for SUB/PRODUCT
  image?: string;
  isActive: boolean;
}

export interface ICategoryDocument extends ICategory, Document {}
