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

export interface GlossaryTermRef {
    _id: string;
    term: string;
    definition: string;
}

export interface GlossaryTermDetail extends GlossaryTerm {
    related?: GlossaryTermRef[];
    prev?: { _id: string; term: string } | null;
    next?: { _id: string; term: string } | null;
}
