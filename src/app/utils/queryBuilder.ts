import { Query } from "mongoose";
import { excludedField } from "../globalConstants";

export class QueryBuilder<T> {
  public modelQuery: Query<T[], T>;
  public readonly query: Record<string, string>;

  constructor(modelQuery: Query<T[], T>, query: Record<string, string>) {
    this.modelQuery = modelQuery;
    this.query = query;
  }

  search(searchableFields: string[]): this {
    const searchTerm = this.query.search || this.query.searchTerm || "";

    if (searchTerm) {
      const searchArray = searchableFields.map((field) => ({
        [field]: { $regex: searchTerm, $options: "i" },
      }));
      this.modelQuery = this.modelQuery.find({ $or: searchArray });
    }

    return this;
  }

  filter(): this {
    const rawFilter = { ...this.query };

    // Remove excluded fields
    for (const field of excludedField) {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete rawFilter[field];
    }

    // Parse bracket notation: field[gte] => { field: { $gte: value } }
    const mongoFilter: Record<string, unknown> = {};

    for (const key of Object.keys(rawFilter)) {
      const match = key.match(/^(.+)\[(gte|lte|gt|lt|ne|in)\]$/);
      if (match) {
        const [, fieldName, operator] = match;
        const rawValue = rawFilter[key];
        const numericValue = Number(rawValue);
        const value = isNaN(numericValue) ? rawValue : numericValue;

        mongoFilter[fieldName] = {
          ...((mongoFilter[fieldName] as object) || {}),
          [`$${operator}`]: value,
        };
      } else {
        mongoFilter[key] = rawFilter[key];
      }
    }

    this.modelQuery = this.modelQuery.find(mongoFilter);
    return this;
  }

  sort(): this {
    const sort = this.query.sort || "-createdAt";
    this.modelQuery = this.modelQuery.sort(sort);
    return this;
  }

  fields(): this {
    const fields = this.query.fields
      ? this.query.fields.split(",").join(" ")
      : "";
    this.modelQuery = this.modelQuery.select(fields);
    return this;
  }

  paginate(): this {
    const limit = Number(this.query.limit) || 10;
    const page = Number(this.query.page) || 1;
    const skip = (page - 1) * limit;
    this.modelQuery = this.modelQuery.skip(skip).limit(limit);
    return this;
  }

  build() {
    return this.modelQuery;
  }

  async getMeta() {
    const filterQuery = this.modelQuery.getQuery();
    const total = await this.modelQuery.model.countDocuments(filterQuery);
    const limit = Number(this.query.limit) || 10;
    const page = Number(this.query.page) || 1;
    const totalPages = Math.ceil(total / limit);
    return { page, limit, total, totalPages };
  }
}
