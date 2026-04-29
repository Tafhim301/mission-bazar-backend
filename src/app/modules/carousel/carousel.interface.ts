import { Document, Types } from "mongoose";

export interface ICarousel {
  image: string;          // Cloudinary URL
  title: string;
  subtitle?: string;
  link?: string;          // URL or internal route
  isActive: boolean;
  order: number;          // display order (lower = first)
  createdBy: Types.ObjectId;
}

export interface ICarouselDocument extends ICarousel, Document {}
