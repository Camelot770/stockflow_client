import React, { useState } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/shared/DataTable';
import { useAuditLog } from '@/hooks/useSettings';
import { formatDateTime } from '@/lib/utils';
import type { AuditLog } from '@/types';

const columns: ColumnDef<AuditLog, unknown>[] = [
  { accessorKey: 'createdAt', header: 'Дата и время', cell: ({ row }) => formatDateTime(row.original.createdAt) },
  { accessorKey: 'user', header: 'Пользователь', cell: ({ row }) => row.original.user ? `${row.original.user.firstName} ${row.original.user.lastName}` : '-' },
  { accessorKey: 'action', header: 'Действие', cell: ({ row }) => <Badge variant="secondary">{row.original.action}</Badge> },
  { accessorKey: 'entity', header: 'Объект', cell: ({ row }) => row.original.entity },
  { accessorKey: 'entityId', header: 'ID объекта', cell: ({ row }) => <span className="text-xs font-mono">{row.original.entityId}</span> },
];

export default function AuditPage() {
  const [params] = useState({ page: 1, limit: 50 });
  const { data, isLoading } = useAuditLog(params);

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Журнал аудита</h1><p className="text-muted-foreground">История действий пользователей в системе</p></div>
      <DataTable columns={columns} data={data?.data || []} searchPlaceholder="Поиск по действию..." isLoading={isLoading} />
    </div>
  );
}
