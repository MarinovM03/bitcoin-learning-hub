import { z } from 'zod';

const GLOSSARY_CATEGORIES = ['Technology', 'Economics', 'Trading', 'Culture', 'Security'];

export const createGlossarySchema = z.object({
    term: z.string().trim().min(1, 'Term is required').max(60, 'Term must be at most 60 characters'),
    definition: z.string().trim().min(10, 'Definition must be at least 10 characters long').max(600, 'Definition must be at most 600 characters'),
    category: z.enum(GLOSSARY_CATEGORIES),
    extendedDefinition: z.string().trim().max(2000, 'Extended definition must be at most 2000 characters').optional(),
    examples: z.array(z.string().max(200, 'Each example must be at most 200 characters')).max(10, 'At most 10 examples allowed').optional(),
});
