import { Document } from "mongoose";

export interface ICategory {
  name: string;
  slug: string;
  description?: string;
  image?: string;
  isActive: boolean;
}

export interface ICategoryDocument extends ICategory, Document {}
