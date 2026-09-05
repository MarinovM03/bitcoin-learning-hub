export interface SeriesFields {
    seriesName?: string;
    seriesPart?: string | number | null;
}

export const isSeriesPartTaken = (
    seriesName: string,
    seriesPart: unknown,
    takenParts: number[],
): boolean => {
    const part = Number(seriesPart);
    return Boolean(
        seriesName.trim()
        && Number.isInteger(part)
        && part >= 1
        && takenParts.includes(part),
    );
};

export const validateSeries = (values: SeriesFields, takenParts: number[]): string | null => {
    const name = (values.seriesName || '').trim();
    const rawPart = String(values.seriesPart ?? '').trim();

    if (Boolean(name) !== Boolean(rawPart)) {
        return 'Series name and part number must be filled together (or leave both empty).';
    }
    if (!name) return null;

    const part = Number(rawPart);
    if (!Number.isInteger(part) || part < 1 || part > 99) {
        return 'Series part must be a whole number between 1 and 99.';
    }
    if (takenParts.includes(part)) {
        return `Part ${part} is already used in "${name}". Pick another part number.`;
    }

    return null;
};
