import { z } from 'zod';
import { FOLLOW_TARGETS } from '../models/Follow.js';
import { objectId } from './shared.js';

export const toggleFollowSchema = z.object({
    targetType: z.enum(FOLLOW_TARGETS, { message: 'You can only follow an account or a collection' }),
    targetId: objectId,
});

export const followTargetParam = z.object({
    targetType: z.enum(FOLLOW_TARGETS, { message: 'Unknown follow target' }),
    targetId: objectId,
});
