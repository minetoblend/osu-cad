import { useAxios } from '@/composables/useAxios.ts';
import { AuditEventInfo } from '@osucad/common';

export interface GetAuditEventsOptions {
  after?: number;
}

export async function getAuditEvents({
  after,
}: GetAuditEventsOptions = {}): Promise<AuditEventInfo[]> {
  const response = await useAxios().get<AuditEventInfo[]>(
    '/api/admin/audit-events',
    {
      params: { after },
      withCredentials: true,
    },
  );

  return response.data;
}
