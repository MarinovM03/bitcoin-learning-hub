import { z } from 'zod';
import { REPORT_TARGETS, REPORT_REASONS } from '../models/Report.js';
import { objectId } from './shared.js';

export const createReportSchema = z.object({
    targetType: z.enum(REPORT_TARGETS),
    targetId: objectId,
    reason: z.enum(REPORT_REASONS),
    note: z.string().trim().max(300, 'Keep the note under 300 characters').optional(),
});

export const resolveReportSchema = z.object({
    status: z.enum(['resolved', 'dismissed']),
});
