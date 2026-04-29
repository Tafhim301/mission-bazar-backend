import { model, Schema } from "mongoose";
import { CategoryType, ICategoryDocument } from "./category.interface";

const categorySchema = new Schema<ICategoryDocument>(
  {
    name:   { type: String, required: true, trim: true },
    slug:   { type: String, unique: true, trim: true },
    type:   { type: String, enum: Object.values(CategoryType), required: true },
    parent: { type: Schema.Types.ObjectId, ref: "Category", default: null },
    image:  { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, versionKey: false }
);

// Compound unique: same name allowed under different parents, not same parent
categorySchema.index({ name: 1, parent: 1 }, { unique: true });
categorySchema.index({ type: 1, isActive: 1 });
categorySchema.index({ parent: 1 });

// === Auto-generate slug ======================================================
const toSlug = (name: string) =>
  name.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

categorySchema.pre("save", function (next) {
  if (this.isModified("name")) this.slug = toSlug(this.name);
  next();
});

categorySchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate() as Partial<ICategoryDocument>;
  if (update.name) { update.slug = toSlug(update.name); this.setUpdate(update); }
  next();
});

export const Category = model<ICategoryDocument>("Category", categorySchema);
