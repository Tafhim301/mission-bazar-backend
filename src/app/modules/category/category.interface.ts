import { Document, Types } from "mongoose";

export enum CategoryType {
  MAIN    = "MAIN",     // Level 1 — e.g. "Groceries & Essentials"
  SUB     = "SUB",      // Level 2 — e.g. "Baking, Cooking"
  SUB_SUB = "SUB_SUB",  // Level 3 — e.g. "Cooking Ingredients"  ← products attach here
}

export interface ICategory {
  name: string;
  slug: string;
  type: CategoryType;
  parent?: Types.ObjectId;   // null for MAIN; MAIN._id for SUB; SUB._id for SUB_SUB
  image?: string;
  isActive: boolean;
  order: number;             // sort order inside parent
}

export interface ICategoryDocument extends ICategory, Document {}
