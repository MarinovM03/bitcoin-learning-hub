import { useQuery } from '@tanstack/react-query';
import * as pathCertificationService from '../../services/pathCertificationService';
import { queryKeys } from '../../lib/queryKeys';

export const useMyCertifications = (enabled = true) => useQuery({
    queryKey: queryKeys.certifications.mine,
    queryFn: pathCertificationService.getMyCertifications,
    enabled,
});

export const useCertification = (certId) => useQuery({
    queryKey: queryKeys.certifications.detail(certId),
    queryFn: () => pathCertificationService.getOne(certId),
    enabled: !!certId,
});
