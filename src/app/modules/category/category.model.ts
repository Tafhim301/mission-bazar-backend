import { model, Schema } from "mongoose";
import { ICategoryDocument } from "./category.interface";

const categorySchema = new Schema<ICategoryDocument>(
  {
    name: { type: String, required: true, trim: true, unique: true },
    slug: { type: String, unique: true, trim: true },
    description: { type: String, trim: true },
    image: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, versionKey: false }
);

// Auto-generate slug from name
categorySchema.pre("save", function (next) {
  if (this.isModified("name")) {
    this.slug = this.name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
  }
  next();
});

categorySchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate() as Partial<ICategoryDocument>;
  if (update.name) {
    update.slug = update.name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
    this.setUpdate(update);
  }
  next();
});

export const Category = model<ICategoryDocument>("Category", categorySchema);
