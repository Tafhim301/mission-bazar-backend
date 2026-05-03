import { model, Schema } from "mongoose";
import { DiscountType, IProduct, IProductDocument, IVariant, ProductStatus } from "./product.interface";

const specSchema = new Schema<{ key: string; value: string }>(
  { key: { type: String, required: true }, value: { type: String, required: true } },
  { _id: false }
);

const variantSchema = new Schema<IVariant>(
  { label: { type: String, required: true }, value: { type: String, required: true }, image: { type: String } },
  { _id: false }
);

const productSchema = new Schema<IProductDocument>(
  {
    name:               { type: String, required: true, trim: true },
    slug:               { type: String, unique: true, trim: true },
    sku:                { type: String, trim: true, sparse: true },
    description:        { type: String, trim: true },
    singleItemPrice:    { type: Number, required: true, min: 0 },
    midWholesalePrice:  { type: Number, min: 0 },
    midWholesaleMinQty: { type: Number, min: 2 },
    wholesalePrice:     { type: Number, min: 0 },
    wholesaleMinQty:    { type: Number, min: 2 },
    // Minimum order quantity (enforced at order creation)
    minOrderQty:        { type: Number, min: 1, default: 1 },
    // Human-readable MOQ description, e.g. "Sold in lots of 50–200 pieces"
    moqNote:            { type: String, trim: true, maxlength: 120 },
    discount:           { type: Number, min: 0 },
    discountType:       { type: String, enum: Object.values(DiscountType) },
    images:             { type: [String], default: [] },
    imagePublicIds:     { type: [String], default: [], select: false },
    variants:           { type: [variantSchema], default: [] },
    category:           { type: Schema.Types.ObjectId, ref: "Category", required: true },
    brand:              { type: String, trim: true },
    stock:              { type: Number, required: true, min: 0, default: 0 },
    sold:               { type: Number, default: 0, min: 0 },
    tags:               { type: [String], default: [] },
    specifications:     { type: [specSchema], default: [] },
    avgRating:          { type: Number, default: 0, min: 0, max: 5 },
    totalReviews:       { type: Number, default: 0, min: 0 },
    freeShipping:       { type: Boolean, default: false },
    status:             { type: String, enum: Object.values(ProductStatus), default: ProductStatus.DRAFT },
    isDeleted:          { type: Boolean, default: false },
    vendor:             { type: Schema.Types.ObjectId, ref: "User"  },
  },
  {
    timestamps: true, versionKey: false,
    toJSON: { transform: (_doc, ret) => { delete (ret as Record<string, unknown>).imagePublicIds; return ret; } },
  }
);

productSchema.index({ category: 1, status: 1 });
productSchema.index({ vendor: 1 });
productSchema.index({ status: 1 });
productSchema.index({ tags: 1 });
productSchema.index({ singleItemPrice: 1 });
productSchema.index({ avgRating: -1 });
productSchema.index({ createdAt: -1 });

const buildUniqueSlug = async (base: string, excludeId?: string): Promise<string> => {
  const baseSlug = base.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  let slug = baseSlug;
  let counter = 0;
  const filter: Record<string, unknown> = { slug };
  if (excludeId) filter._id = { $ne: excludeId };
  while (await Product.exists(filter)) { slug = `${baseSlug}-${++counter}`; filter.slug = slug; }
  return slug;
};

productSchema.pre("save", async function (next) {
  if (this.isModified("name")) this.slug = await buildUniqueSlug(this.name);
  next();
});

productSchema.pre("findOneAndUpdate", async function (next) {
  const update = this.getUpdate() as Partial<IProduct>;
  if (update.name) {
    const doc = await this.model.findOne(this.getQuery());
    update.slug = await buildUniqueSlug(update.name, String(doc?._id));
    this.setUpdate(update);
  }
  next();
});

productSchema.pre(/^find/, function (this: ReturnType<typeof productSchema.pre>, next) {
  (this as unknown as { find: (q: object) => void }).find({ isDeleted: { $ne: true } });
  next();
});

export const Product = model<IProductDocument>("Product", productSchema);
