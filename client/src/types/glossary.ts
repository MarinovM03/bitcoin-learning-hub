export type GlossaryCategory =
    | 'Technology'
    | 'Economics'
    | 'Trading'
    | 'Culture'
    | 'Security';

export interface GlossaryTerm {
    _id: string;
    term: string;
    definition: string;
    extendedDefinition: string;
    examples: string[];
    category: GlossaryCategory;
    _ownerId?: string;
    createdAt: string;
}
