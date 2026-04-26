import { useQuery } from '@tanstack/react-query';
import * as glossaryService from '../../services/glossaryService';
import { queryKeys } from '../../lib/queryKeys';

export const useGlossaryTerms = () => useQuery({
    queryKey: queryKeys.glossary.list,
    queryFn: glossaryService.getAll,
});

export const useGlossaryTerm = (termId) => useQuery({
    queryKey: queryKeys.glossary.detail(termId),
    queryFn: () => glossaryService.getOne(termId),
    enabled: !!termId,
});
