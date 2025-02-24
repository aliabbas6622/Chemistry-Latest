import { type Reaction, type Compound, type ReactionCompound, type InsertReaction } from "@shared/schema";
import { initialReactions } from "../client/src/lib/reactions";

export interface IStorage {
  // Reaction methods
  getAllReactions(): Promise<Reaction[]>;
  getReaction(id: number): Promise<Reaction | undefined>;
  getReactionsByFunctionalGroup(group: string): Promise<Reaction[]>;
  getReactionsByChapter(chapter: number): Promise<Reaction[]>;
  searchReactions(query: string): Promise<Reaction[]>;
  toggleBookmark(id: number): Promise<Reaction>;
  getBookmarkedReactions(): Promise<Reaction[]>;

  // Compound methods
  getCompound(id: number): Promise<Compound | undefined>;
  getCompoundsByReaction(reactionId: number): Promise<{ reactants: Compound[], products: Compound[] }>;
  getReactionsByCompound(compoundId: number): Promise<{ asReactant: Reaction[], asProduct: Reaction[] }>;
  searchCompounds(query: string): Promise<Compound[]>;
}

export class MemStorage implements IStorage {
  private reactions: Map<number, Reaction>;
  private compounds: Map<number, Compound>;
  private reactionCompounds: ReactionCompound[];
  private currentReactionId: number;
  private currentCompoundId: number;

  constructor() {
    this.reactions = new Map();
    this.compounds = new Map();
    this.reactionCompounds = [];
    this.currentReactionId = 1;
    this.currentCompoundId = 1;

    // Initialize with sample data
    initialReactions.forEach(reaction => {
      const reactionWithId: Reaction = {
        ...reaction,
        id: this.currentReactionId++,
        isBookmarked: false
      };
      this.reactions.set(reactionWithId.id, reactionWithId);

      // Parse molecular formula to create compounds
      const [reactants, products] = reaction.molecularFormula.split('->').map(s => s.trim());

      // Add reactants
      reactants.split('+').forEach(formula => {
        const compound: Compound = {
          id: this.currentCompoundId++,
          name: formula.trim(),
          formula: formula.trim(),
          description: `Compound involved in ${reaction.name}`,
          molecularWeight: "Calculate based on formula", // This would need a proper calculator
          isBookmarked: false
        };
        this.compounds.set(compound.id, compound);

        this.reactionCompounds.push({
          id: this.reactionCompounds.length + 1,
          reactionId: reactionWithId.id,
          compoundId: compound.id,
          role: 'reactant',
          stoichiometry: '1' // Default stoichiometry
        });
      });

      // Add products
      products.split('+').forEach(formula => {
        const compound: Compound = {
          id: this.currentCompoundId++,
          name: formula.trim(),
          formula: formula.trim(),
          description: `Product of ${reaction.name}`,
          molecularWeight: "Calculate based on formula", // This would need a proper calculator
          isBookmarked: false
        };
        this.compounds.set(compound.id, compound);

        this.reactionCompounds.push({
          id: this.reactionCompounds.length + 1,
          reactionId: reactionWithId.id,
          compoundId: compound.id,
          role: 'product',
          stoichiometry: '1' // Default stoichiometry
        });
      });
    });
  }

  async getAllReactions(): Promise<Reaction[]> {
    return Array.from(this.reactions.values());
  }

  async getReaction(id: number): Promise<Reaction | undefined> {
    return this.reactions.get(id);
  }

  async getReactionsByFunctionalGroup(group: string): Promise<Reaction[]> {
    return Array.from(this.reactions.values()).filter(
      r => r.functionalGroup.toLowerCase() === group.toLowerCase()
    );
  }

  async getReactionsByChapter(chapter: number): Promise<Reaction[]> {
    return Array.from(this.reactions.values()).filter(
      r => r.chapter === chapter
    );
  }

  async searchReactions(query: string): Promise<Reaction[]> {
    const lowercaseQuery = query.toLowerCase();
    return Array.from(this.reactions.values()).filter(r =>
      r.name.toLowerCase().includes(lowercaseQuery) ||
      r.category.toLowerCase().includes(lowercaseQuery) ||
      r.functionalGroup.toLowerCase().includes(lowercaseQuery) ||
      r.mechanism.toLowerCase().includes(lowercaseQuery)
    );
  }

  async toggleBookmark(id: number): Promise<Reaction> {
    const reaction = this.reactions.get(id);
    if (!reaction) {
      throw new Error("Reaction not found");
    }
    const updated = { ...reaction, isBookmarked: !reaction.isBookmarked };
    this.reactions.set(id, updated);
    return updated;
  }

  async getBookmarkedReactions(): Promise<Reaction[]> {
    return Array.from(this.reactions.values()).filter(r => r.isBookmarked);
  }

  async getCompound(id: number): Promise<Compound | undefined> {
    return this.compounds.get(id);
  }

  async getCompoundsByReaction(reactionId: number): Promise<{ reactants: Compound[], products: Compound[] }> {
    const relationships = this.reactionCompounds.filter(rc => rc.reactionId === reactionId);

    return {
      reactants: relationships
        .filter(r => r.role === 'reactant')
        .map(r => this.compounds.get(r.compoundId)!)
        .filter(Boolean),
      products: relationships
        .filter(r => r.role === 'product')
        .map(r => this.compounds.get(r.compoundId)!)
        .filter(Boolean)
    };
  }

  async getReactionsByCompound(compoundId: number): Promise<{ asReactant: Reaction[], asProduct: Reaction[] }> {
    const relationships = this.reactionCompounds.filter(rc => rc.compoundId === compoundId);

    return {
      asReactant: relationships
        .filter(r => r.role === 'reactant')
        .map(r => this.reactions.get(r.reactionId)!)
        .filter(Boolean),
      asProduct: relationships
        .filter(r => r.role === 'product')
        .map(r => this.reactions.get(r.reactionId)!)
        .filter(Boolean)
    };
  }

  async searchCompounds(query: string): Promise<Compound[]> {
    const lowercaseQuery = query.toLowerCase();
    return Array.from(this.compounds.values()).filter(c =>
      c.name.toLowerCase().includes(lowercaseQuery) ||
      c.formula.toLowerCase().includes(lowercaseQuery)
    );
  }
}

export const storage = new MemStorage();