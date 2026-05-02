import { model, Schema } from "mongoose";
import { FeaturedType, IFeaturedDocument } from "./featured.interface";

const featuredSchema = new Schema<IFeaturedDocument>(
  {
    product:          { type: Schema.Types.ObjectId, ref: "Product", required: true },
    type:             { type: String, enum: Object.values(FeaturedType), required: true },
    discountedPrice:  { type: Number, min: 0 },
    endsAt:           { type: Date },
    order:            { type: Number, default: 0 },
    isActive:         { type: Boolean, default: true },
  },
  { timestamps: true, versionKey: false }
);

featuredSchema.index({ type: 1, isActive: 1, order: 1 });
// one product can only be in each type once
featuredSchema.index({ product: 1, type: 1 }, { unique: true });

export const Featured = model<IFeaturedDocument>("Featured", featuredSchema);
