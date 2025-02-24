import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Compounds table
export const compounds = pgTable("compounds", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  formula: text("formula").notNull(),
  description: text("description").notNull(),
  molecularWeight: text("molecular_weight").notNull(),
  isBookmarked: boolean("is_bookmarked").default(false)
});

// Reactions table with enhanced fields
export const reactions = pgTable("reactions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  functionalGroup: text("functional_group").notNull(),
  chapter: integer("chapter").notNull(),
  reactionNumber: integer("reaction_number").notNull(),
  reagents: text("reagents").notNull(),
  conditions: text("conditions").notNull(),
  mechanism: text("mechanism").notNull(),
  products: text("products").notNull(),
  realWorldApplications: text("real_world_applications").notNull(),
  molecularFormula: text("molecular_formula").notNull(),
  isBookmarked: boolean("is_bookmarked").default(false)
});

// Junction table for reaction-compound relationships
export const reactionCompounds = pgTable("reaction_compounds", {
  id: serial("id").primaryKey(),
  reactionId: integer("reaction_id").notNull().references(() => reactions.id),
  compoundId: integer("compound_id").notNull().references(() => compounds.id),
  role: text("role").notNull(), // 'reactant' or 'product'
  stoichiometry: text("stoichiometry").notNull()
});

// Relations
export const reactionsRelations = relations(reactions, ({ many }) => ({
  compounds: many(reactionCompounds)
}));

export const compoundsRelations = relations(compounds, ({ many }) => ({
  reactions: many(reactionCompounds)
}));

export const reactionCompoundsRelations = relations(reactionCompounds, ({ one }) => ({
  reaction: one(reactions, {
    fields: [reactionCompounds.reactionId],
    references: [reactions.id],
  }),
  compound: one(compounds, {
    fields: [reactionCompounds.compoundId],
    references: [compounds.id],
  }),
}));

// Schemas for data insertion
export const insertCompoundSchema = createInsertSchema(compounds).omit({
  id: true,
  isBookmarked: true
});

export const insertReactionSchema = createInsertSchema(reactions).omit({
  id: true,
  isBookmarked: true
});

export const insertReactionCompoundSchema = createInsertSchema(reactionCompounds).omit({
  id: true
});

// Types
export type InsertCompound = z.infer<typeof insertCompoundSchema>;
export type InsertReaction = z.infer<typeof insertReactionSchema>;
export type InsertReactionCompound = z.infer<typeof insertReactionCompoundSchema>;
export type Compound = typeof compounds.$inferSelect;
export type Reaction = typeof reactions.$inferSelect;
export type ReactionCompound = typeof reactionCompounds.$inferSelect;

// Constants
export const functionalGroups = [
  "Alkene",
  "Alkyne", 
  "Benzene",
  "Alkyl Halide",
  "Grignard",
  "Reduction",
  "Phenol"
] as const;

export const categories = [
  "Hydrogenation",
  "Halogenation",
  "Hydrohalogenation", 
  "Hydration",
  "Ozonolysis",
  "Polymerization",
  "Friedel-Crafts",
  "Grignard Reactions",
  "Reduction",
  "Oxidation",
  "Nitration",
  "Sulphonation"
] as const;