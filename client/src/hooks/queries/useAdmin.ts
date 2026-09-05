import { useQuery, keepPreviousData } from '@tanstack/react-query';
import * as adminService from '../../services/adminService';
import type { ReportStatus } from '../../services/adminService';
import { queryKeys } from '../../lib/queryKeys';

interface PagedParams {
    search?: string;
    page?: number;
    limit?: number;
}

export const useAdminStats = () => useQuery({
    queryKey: queryKeys.admin.stats,
    queryFn: adminService.getStats,
});

export const useAdminUsers = (params: PagedParams) => useQuery({
    queryKey: queryKeys.admin.users(params),
    queryFn: () => adminService.getUsers(params),
    placeholderData: keepPreviousData,
});

export const useAdminArticles = (params: PagedParams) => useQuery({
    queryKey: queryKeys.admin.articles(params),
    queryFn: () => adminService.getArticles(params),
    placeholderData: keepPreviousData,
});

export const useAdminComments = (params: PagedParams) => useQuery({
    queryKey: queryKeys.admin.comments(params),
    queryFn: () => adminService.getComments(params),
    placeholderData: keepPreviousData,
});

export const useModerationQueue = (params: PagedParams) => useQuery({
    queryKey: queryKeys.admin.moderation(params),
    queryFn: () => adminService.getModerationQueue(params),
    placeholderData: keepPreviousData,
});

export const useArticlePreview = (articleId?: string) => useQuery({
    queryKey: queryKeys.admin.preview(articleId),
    queryFn: () => adminService.getArticlePreview(articleId!),
    enabled: !!articleId,
});

export const useAdminReports = (params: PagedParams & { status?: ReportStatus }) => useQuery({
    queryKey: queryKeys.admin.reports(params),
    queryFn: () => adminService.getReports(params),
    placeholderData: keepPreviousData,
});
