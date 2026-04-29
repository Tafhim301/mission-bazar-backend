import { model, Schema } from "mongoose";
import { ICarouselDocument } from "./carousel.interface";

const carouselSchema = new Schema<ICarouselDocument>(
  {
    image:     { type: String, required: true },
    title:     { type: String, required: true, trim: true },
    subtitle:  { type: String, trim: true },
    link:      { type: String, trim: true },
    isActive:  { type: Boolean, default: true },
    order:     { type: Number, default: 0 },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true, versionKey: false }
);

carouselSchema.index({ isActive: 1, order: 1 });

export const Carousel = model<ICarouselDocument>("Carousel", carouselSchema);
