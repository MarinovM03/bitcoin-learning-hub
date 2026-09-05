import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as adminService from '../../services/adminService';
import { queryKeys } from '../../lib/queryKeys';

const useAdminRefresh = () => {
    const queryClient = useQueryClient();
    return () => queryClient.invalidateQueries({ queryKey: queryKeys.admin.all });
};

export const useUpdateUserRole = () => {
    const refresh = useAdminRefresh();
    return useMutation({
        mutationFn: ({ userId, role }: { userId: string; role: 'user' | 'admin' }) =>
            adminService.updateUserRole(userId, role),
        onSuccess: refresh,
    });
};

export const useUpdateUserTrust = () => {
    const refresh = useAdminRefresh();
    return useMutation({
        mutationFn: ({ userId, isTrusted }: { userId: string; isTrusted: boolean }) =>
            adminService.updateUserTrust(userId, isTrusted),
        onSuccess: refresh,
    });
};

export const useDeleteUser = () => {
    const refresh = useAdminRefresh();
    return useMutation({
        mutationFn: (userId: string) => adminService.deleteUser(userId),
        onSuccess: refresh,
    });
};

export const useToggleFeatured = () => {
    const refresh = useAdminRefresh();
    return useMutation({
        mutationFn: (articleId: string) => adminService.toggleFeatured(articleId),
        onSuccess: refresh,
    });
};

export const useAdminDeleteArticle = () => {
    const refresh = useAdminRefresh();
    return useMutation({
        mutationFn: (articleId: string) => adminService.deleteArticle(articleId),
        onSuccess: refresh,
    });
};

export const useAdminDeleteComment = () => {
    const refresh = useAdminRefresh();
    return useMutation({
        mutationFn: (commentId: string) => adminService.deleteComment(commentId),
        onSuccess: refresh,
    });
};

export const useApproveArticle = () => {
    const refresh = useAdminRefresh();
    return useMutation({
        mutationFn: (articleId: string) => adminService.approveArticle(articleId),
        onSuccess: refresh,
    });
};

export const useRejectArticle = () => {
    const refresh = useAdminRefresh();
    return useMutation({
        mutationFn: ({ articleId, note }: { articleId: string; note: string }) =>
            adminService.rejectArticle(articleId, note),
        onSuccess: refresh,
    });
};

export const useApproveGlossaryTerm = () => {
    const refresh = useAdminRefresh();
    return useMutation({
        mutationFn: (termId: string) => adminService.approveGlossaryTerm(termId),
        onSuccess: refresh,
    });
};

export const useAdminDeleteGlossaryTerm = () => {
    const refresh = useAdminRefresh();
    return useMutation({
        mutationFn: (termId: string) => adminService.deleteGlossaryTerm(termId),
        onSuccess: refresh,
    });
};

export const useResolveReport = () => {
    const refresh = useAdminRefresh();
    return useMutation({
        mutationFn: ({ reportId, status }: { reportId: string; status: 'resolved' | 'dismissed' }) =>
            adminService.resolveReport(reportId, status),
        onSuccess: refresh,
    });
};
