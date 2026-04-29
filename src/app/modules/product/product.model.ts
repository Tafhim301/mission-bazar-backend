import { model, Schema } from "mongoose";
import { IProduct, IProductDocument, ProductStatus } from "./product.interface";

const specificationSchema = new Schema<{ key: string; value: string }>(
  { key: { type: String, required: true }, value: { type: String, required: true } },
  { _id: false }
);

const productSchema = new Schema<IProductDocument>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, trim: true },
    description: { type: String, trim: true },
    price: { type: Number, required: true, min: 0 },
    discountPrice: {
      type: Number, min: 0,
      validate: {
        validator: function (this: IProduct, v: number) { return v < this.price; },
        message: "Discount price must be less than the regular price",
      },
    },
    images: { type: [String], default: [] },
    imagePublicIds: { type: [String], default: [], select: false },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    brand: { type: String, trim: true },
    stock: { type: Number, required: true, min: 0, default: 0 },
    sold: { type: Number, default: 0, min: 0 },
    tags: { type: [String], default: [] },
    specifications: { type: [specificationSchema], default: [] },
    status: { type: String, enum: Object.values(ProductStatus), default: ProductStatus.DRAFT },
    isDeleted: { type: Boolean, default: false },
    vendor: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      transform: (_doc, ret: Record<string, unknown>) => {
        delete ret.imagePublicIds;
        return ret;
      },
    },
  }
);

// === Auto-generate unique slug ===============================================

const buildUniqueSlug = async (base: string, excludeId?: string): Promise<string> => {
  const baseSlug = base.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  let slug = baseSlug;
  let counter = 0;
  const filter: Record<string, unknown> = { slug };
  if (excludeId) filter._id = { $ne: excludeId };

  while (await Product.exists(filter)) {
    slug = `${baseSlug}-${++counter}`;
    filter.slug = slug;
  }
  return slug;
};

productSchema.pre("save", async function (next) {
  if (this.isModified("name")) {
    this.slug = await buildUniqueSlug(this.name);
  }
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

// === Auto-exclude soft-deleted docs ==========================================

productSchema.pre(/^find/, function (this: ReturnType<typeof productSchema.pre>, next) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (this as any).find({ isDeleted: { $ne: true } });
  next();
});

export const Product = model<IProductDocument>("Product", productSchema);
