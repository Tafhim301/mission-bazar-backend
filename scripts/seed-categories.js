#!/usr/bin/env node
/**
 * seed-categories.js
 * ------------------
 * Inserts a 3-layer category tree (MAIN → SUB → SUB_SUB) into MongoDB.
 * Safe to run multiple times — skips any category that already exists
 * (matched on { name, parent } compound unique index).
 *
 * Usage:
 *   node scripts/seed-categories.js
 *   node scripts/seed-categories.js --mongo-uri mongodb://localhost:27017/mission-bazar
 *   node scripts/seed-categories.js --dry-run
 *
 * After the run the script prints the full tree with ObjectIds so you can
 * copy leaf (SUB_SUB) IDs into the product seeder.
 */

"use strict";

const mongoose = require("mongoose");

// ── CLI args ──────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const uriArg  = (() => {
  const i = args.indexOf("--mongo-uri");
  return i !== -1 ? args[i + 1] : null;
})();
require("dotenv").config();
const MONGO_URI = uriArg || process.env.DB_URL || process.env.DATABASE_URL || "mongodb://localhost:27017/mission-bazar";
// ── Inline Category schema (mirrors category.model.ts) ───────────────────────
const toSlug = (name) =>
  name.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

const categorySchema = new mongoose.Schema(
  {
    name:     { type: String, required: true, trim: true },
    slug:     { type: String, unique: true, trim: true },
    type:     { type: String, enum: ["MAIN", "SUB", "SUB_SUB"], required: true },
    parent:   { type: mongoose.Schema.Types.ObjectId, ref: "Category", default: null },
    image:    { type: String },
    isActive: { type: Boolean, default: true },
    order:    { type: Number, default: 0 },
  },
  { timestamps: true, versionKey: false }
);
categorySchema.index({ name: 1, parent: 1 }, { unique: true });
categorySchema.pre("save", function (next) {
  if (this.isModified("name") || !this.slug) this.slug = toSlug(this.name);
  next();
});

const Category =
  mongoose.models.Category || mongoose.model("Category", categorySchema);

// ── Category tree definition ──────────────────────────────────────────────────
//
//  Structure:
//    { name, order, children: [
//        { name, order, children: [
//            { name, order }   ← SUB_SUB (leaf — products attach here)
//        ]}
//    ]}
//
const TREE = [
  {
    name: "Kitchen & Cookware",
    order: 1,
    children: [
      {
        name: "Pots, Pans & Cookware",
        order: 1,
        children: [
          { name: "Sauce Pots & Cooking Pots",   order: 1 },
          { name: "Pressure Cookers",             order: 2 },
          { name: "Non-Stick Pans & Woks",        order: 3 },
          { name: "Frying Pans & Egg Pans",       order: 4 },
        ],
      },
      {
        name: "Bakeware & Glass Ovenware",
        order: 2,
        children: [
          { name: "Glass Roasters & Mixing Bowls", order: 1 },
          { name: "Cake Pans & Moulds",            order: 2 },
          { name: "Flan & Loaf Dishes",            order: 3 },
        ],
      },
      {
        name: "Kitchen Tools & Utensils",
        order: 3,
        children: [
          { name: "Spoons, Ladles & Turners",       order: 1 },
          { name: "Tongs & Spatulas",               order: 2 },
          { name: "Knives & Knife Sets",            order: 3 },
          { name: "Chopping Boards & Cutting Tools", order: 4 },
          { name: "Peelers, Slicers & Graters",     order: 5 },
        ],
      },
    ],
  },
  {
    name: "Dining & Tableware",
    order: 2,
    children: [
      {
        name: "Glassware & Drinkware",
        order: 1,
        children: [
          { name: "Drinking Glasses & Tumblers", order: 1 },
          { name: "Glass Bowls & Dishes",        order: 2 },
          { name: "Mugs & Cups",                 order: 3 },
        ],
      },
      {
        name: "Serving & Dining Accessories",
        order: 2,
        children: [
          { name: "Serving Trays",               order: 1 },
          { name: "Serving Bowls & Plates",      order: 2 },
          { name: "Bar & Beverage Accessories",  order: 3 },
        ],
      },
      {
        name: "Cutlery Sets",
        order: 3,
        children: [
          { name: "Dinner & Tea Spoon Sets", order: 1 },
          { name: "Fork & Cutlery Sets",     order: 2 },
        ],
      },
    ],
  },
  {
    name: "Food Storage & Vacuum Products",
    order: 3,
    children: [
      {
        name: "Vacuum Flasks & Coffee Pots",
        order: 1,
        children: [
          { name: "Vacuum Flasks & Bottles", order: 1 },
          { name: "Vacuum Coffee Pots",      order: 2 },
          { name: "Flask & Mug Sets",        order: 3 },
        ],
      },
      {
        name: "Food Carriers & Containers",
        order: 2,
        children: [
          { name: "Stainless Steel Food Carriers", order: 1 },
          { name: "Lunch Boxes & Tiffins",         order: 2 },
          { name: "Plastic Storage Containers",    order: 3 },
        ],
      },
      {
        name: "Food Warmers & Hot Pots",
        order: 3,
        children: [
          { name: "Hot Pots & Food Warmers",    order: 1 },
          { name: "Chafing Dishes & Buffet Sets", order: 2 },
        ],
      },
    ],
  },

  {
    name: "Home & Kitchen Organization",
    order: 5,
    children: [
      {
        name: "Kitchen Storage & Organization",
        order: 1,
        children: [
          { name: "Dish Racks & Drainers",             order: 1 },
          { name: "Spoon Holders & Utensil Organizers", order: 2 },
          { name: "Tissue Holders & Dispensers",        order: 3 },
        ],
      },
      {
        name: "BBQ & Outdoor Cooking",
        order: 2,
        children: [
          { name: "BBQ Grills & Stands",       order: 1 },
          { name: "BBQ Skewers & Accessories", order: 2 },
        ],
      },
      {
        name: "Cleaning & Household Tools",
        order: 3,
        children: [
          { name: "Kitchen Gloves & Protection",   order: 1 },
          { name: "Cleaning Tools & Accessories",  order: 2 },
        ],
      },
    ],
  },
  {
    name: "Water Purification",
    order: 6,
    children: [
      {
        name: "Water Purifiers",
        order: 1,
        children: [
          { name: "Domestic Water Purifiers",   order: 1 },
          { name: "Commercial Water Purifiers", order: 2 },
        ],
      },
      {
        name: "Purifier Parts & Accessories",
        order: 2,
        children: [
          { name: "Filter Cartridges & Capsules", order: 1 },
          { name: "Membranes & Purifier Parts",   order: 2 },
        ],
      },
    ],
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Upsert a single category. Returns the saved/found document.
 * Uses findOneAndUpdate so re-runs don't duplicate on the compound unique index.
 */
async function upsertCategory({ name, type, parent, order }) {
  const slug = toSlug(name);
  const filter = { name, parent: parent || null };
  const update  = { $setOnInsert: { name, slug, type, parent: parent || null, order, isActive: true } };
  const doc = await Category.findOneAndUpdate(filter, update, {
    upsert: true,
    new: true,
    setDefaultsOnInsert: true,
  });
  return doc;
}

/** Pretty-print the final tree with IDs */
function printTree(results) {
  console.log("\n══════════════════════════════════════════════════════════════");
  console.log("  CATEGORY TREE — copy SUB_SUB ObjectIds for product seeder");
  console.log("══════════════════════════════════════════════════════════════\n");

  for (const main of results) {
    console.log(`[MAIN]  ${main.name}`);
    console.log(`        _id: ${main._id}`);
    for (const sub of main.children) {
      console.log(`  [SUB]  ${sub.name}`);
      console.log(`         _id: ${sub._id}`);
      for (const leaf of sub.children) {
        console.log(`    [SUB_SUB]  ${leaf.name}`);
        console.log(`               _id: ${leaf._id}   ← use this`);
      }
    }
    console.log();
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  if (DRY_RUN) {
    console.log("╔══════════════════════════════╗");
    console.log("║       DRY-RUN MODE           ║");
    console.log("╚══════════════════════════════╝\n");
    console.log("Would insert the following categories:\n");
    let mainCount = 0, subCount = 0, leafCount = 0;
    for (const m of TREE) {
      mainCount++;
      console.log(`[MAIN]  ${m.name}`);
      for (const s of m.children) {
        subCount++;
        console.log(`  [SUB]  ${s.name}`);
        for (const l of s.children) {
          leafCount++;
          console.log(`    [SUB_SUB]  ${l.name}`);
        }
      }
    }
    console.log(`\nTotal: ${mainCount} MAIN + ${subCount} SUB + ${leafCount} SUB_SUB = ${mainCount + subCount + leafCount} categories`);
    return;
  }

  console.log(`\nConnecting to: ${MONGO_URI}`);
  await mongoose.connect(MONGO_URI);
  console.log("Connected.\n");

  const results = [];
  let inserted = 0;
  let skipped  = 0;

  for (const mainDef of TREE) {
    // ── MAIN ──
    const mainDoc = await upsertCategory({ name: mainDef.name, type: "MAIN", parent: null, order: mainDef.order });
    const wasNew  = mainDoc.__v === undefined && !mainDoc.createdAt;
    console.log(`[MAIN]  ${mainDef.name}  →  ${mainDoc._id}`);

    const mainResult = { name: mainDef.name, _id: mainDoc._id, children: [] };

    for (const subDef of mainDef.children) {
      // ── SUB ──
      const subDoc = await upsertCategory({ name: subDef.name, type: "SUB", parent: mainDoc._id, order: subDef.order });
      console.log(`  [SUB]  ${subDef.name}  →  ${subDoc._id}`);

      const subResult = { name: subDef.name, _id: subDoc._id, children: [] };

      for (const leafDef of subDef.children) {
        // ── SUB_SUB ──
        const leafDoc = await upsertCategory({ name: leafDef.name, type: "SUB_SUB", parent: subDoc._id, order: leafDef.order });
        console.log(`    [SUB_SUB]  ${leafDef.name}  →  ${leafDoc._id}`);
        subResult.children.push({ name: leafDef.name, _id: leafDoc._id });
      }

      mainResult.children.push(subResult);
    }

    results.push(mainResult);
  }

  printTree(results);

  // ── JSON summary for copy-paste ───────────────────────────────────────────
  console.log("\n── JSON map (SUB_SUB name → ObjectId) ──────────────────────\n");
  const map = {};
  for (const m of results)
    for (const s of m.children)
      for (const l of s.children)
        map[l.name] = l._id.toString();

  console.log(JSON.stringify(map, null, 2));

  await mongoose.disconnect();
  console.log("\nDone. MongoDB disconnected.");
}

main().catch((err) => {
  console.error("Seeder failed:", err);
  mongoose.disconnect();
  process.exit(1);
});
