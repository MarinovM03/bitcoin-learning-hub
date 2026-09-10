import { useQuery } from '@tanstack/react-query';
import * as transactionService from '../../services/transactionService';
import { queryKeys } from '../../lib/queryKeys';

export const useTransaction = (txid?: string) => useQuery({
    queryKey: queryKeys.transactions.detail(txid),
    queryFn: () => transactionService.getTransaction(txid!),
    enabled: !!txid,
    retry: false,
    staleTime: 5 * 60 * 1000,
});
