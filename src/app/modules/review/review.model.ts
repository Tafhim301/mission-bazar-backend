import { model, Schema } from "mongoose";
import { IReviewDocument, ISellerReply } from "./review.interface";
import { Product } from "../product/product.model";

const sellerReplySchema = new Schema<ISellerReply>(
  {
    comment:   { type: String, required: true, trim: true },
    repliedAt: { type: Date, default: Date.now },
    repliedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { _id: false }
);

const reviewSchema = new Schema<IReviewDocument>(
  {
    user:               { type: Schema.Types.ObjectId, ref: "User", required: true },
    product:            { type: Schema.Types.ObjectId, ref: "Product", required: true },
    rating:             { type: Number, required: true, min: 1, max: 5 },
    comment:            { type: String, required: true, trim: true, minlength: 3 },
    images:             { type: [String], default: [] },
    isVerifiedPurchase: { type: Boolean, default: false },
    sellerReply:        { type: sellerReplySchema, default: null },
  },
  { timestamps: true, versionKey: false }
);

reviewSchema.index({ user: 1, product: 1 }, { unique: true });
reviewSchema.index({ product: 1, createdAt: -1 });

const recalcRatings = async (productId: unknown) => {
  const stats = await Review.aggregate([
    { $match: { product: productId } },
    { $group: { _id: "$product", avgRating: { $avg: "$rating" }, totalReviews: { $sum: 1 } } },
  ]);
  if (stats.length) {
    await Product.findByIdAndUpdate(productId, {
      avgRating:    +stats[0].avgRating.toFixed(1),
      totalReviews: stats[0].totalReviews,
    });
  } else {
    await Product.findByIdAndUpdate(productId, { avgRating: 0, totalReviews: 0 });
  }
};

reviewSchema.post("save", async function () { await recalcRatings(this.product); });
reviewSchema.post("findOneAndDelete", async function (doc) { if (doc) await recalcRatings(doc.product); });
reviewSchema.post("findOneAndUpdate", async function (doc) { if (doc) await recalcRatings(doc.product); });

export const Review = model<IReviewDocument>("Review", reviewSchema);
