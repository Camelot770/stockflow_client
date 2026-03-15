import React from 'react';
import { Phone, Mail, Calendar, FileText, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/shared/EmptyState';

const activityTypes = [
  { type: 'call', label: 'Звонки', icon: Phone, color: 'text-blue-400' },
  { type: 'meeting', label: 'Встречи', icon: Calendar, color: 'text-purple-400' },
  { type: 'email', label: 'Email', icon: Mail, color: 'text-green-400' },
  { type: 'note', label: 'Заметки', icon: FileText, color: 'text-yellow-400' },
  { type: 'task', label: 'Задачи', icon: CheckCircle2, color: 'text-orange-400' },
];

export default function ActivitiesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Активности</h1>
        <p className="text-muted-foreground">Звонки, встречи, email и прочие активности</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {activityTypes.map((t) => (
          <Card key={t.type}>
            <CardContent className="pt-6 text-center">
              <t.icon className={`h-6 w-6 mx-auto mb-2 ${t.color}`} />
              <p className="text-sm font-medium">{t.label}</p>
              <p className="text-2xl font-bold mt-1">0</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="pt-6">
          <EmptyState
            title="Нет активностей"
            description="Активности появятся при взаимодействии с клиентами и сделками"
          />
        </CardContent>
      </Card>
    </div>
  );
}
