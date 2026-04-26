import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as glossaryService from '../../services/glossaryService';
import { queryKeys } from '../../lib/queryKeys';

export const useDeleteGlossaryTerm = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (termId) => glossaryService.remove(termId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.glossary.all });
        },
    });
};

export const useCreateGlossaryTerm = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => glossaryService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.glossary.all });
        },
    });
};
