import { useEffect, useState } from 'react';
import * as articleService from '../services/articleService';

const LOOKUP_DELAY_MS = 300;

export const useSeriesParts = (seriesName: string, excludeId?: string): number[] => {
    const [takenParts, setTakenParts] = useState<number[]>([]);

    useEffect(() => {
        const name = seriesName.trim();
        if (!name) {
            setTakenParts([]);
            return;
        }

        const timer = setTimeout(() => {
            articleService.getMySeriesParts(name, excludeId)
                .then(res => setTakenParts(res.parts || []))
                .catch(() => setTakenParts([]));
        }, LOOKUP_DELAY_MS);

        return () => clearTimeout(timer);
    }, [seriesName, excludeId]);

    return takenParts;
};
