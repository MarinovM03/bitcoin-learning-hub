import { z } from 'zod';

const GLOSSARY_CATEGORIES = ['Technology', 'Economics', 'Trading', 'Culture', 'Security'];

export const createGlossarySchema = z.object({
    term: z.string().trim().min(1, 'Term is required'),
    definition: z.string().trim().min(10, 'Definition must be at least 10 characters long'),
    category: z.enum(GLOSSARY_CATEGORIES),
    extendedDefinition: z.string().trim().optional(),
    examples: z.array(z.string()).optional(),
});
