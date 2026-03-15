import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Handshake, ListTodo, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const sections = [
  { title: 'Контакты', desc: 'Клиенты и контактные лица', icon: Users, href: '/crm/contacts', color: 'text-blue-400' },
  { title: 'Сделки', desc: 'Воронка продаж и сделки', icon: Handshake, href: '/crm/deals', color: 'text-purple-400' },
  { title: 'Задачи', desc: 'Управление задачами', icon: ListTodo, href: '/crm/tasks', color: 'text-orange-400' },
  { title: 'Активности', desc: 'Звонки, встречи, email', icon: Activity, href: '/crm/activities', color: 'text-emerald-400' },
];

export default function CrmDashboardPage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">CRM</h1>
        <p className="text-muted-foreground">Управление взаимоотношениями с клиентами</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {sections.map((s) => (
          <Card key={s.href} className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => navigate(s.href)}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-lg bg-muted ${s.color}`}>
                  <s.icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold">{s.title}</h3>
                  <p className="text-xs text-muted-foreground">{s.desc}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
