import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import { DealTimeline } from '@/components/crm/DealTimeline';
import { useDeal, useDealComments, useAddComment } from '@/hooks/useDeals';
import { formatCurrency, formatDate } from '@/lib/utils';
import { toast } from 'sonner';

export default function DealDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: deal, isLoading } = useDeal(id!);
  const { data: comments = [] } = useDealComments(id!);
  const addComment = useAddComment();
  const [commentText, setCommentText] = useState('');

  if (isLoading) return <LoadingSkeleton type="form" rows={6} />;
  if (!deal) return <p className="text-center text-muted-foreground py-16">Сделка не найдена</p>;

  const handleAddComment = () => {
    if (!commentText.trim()) return;
    addComment.mutate({ dealId: deal.id, text: commentText }, {
      onSuccess: () => { setCommentText(''); toast.success('Комментарий добавлен'); },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/crm/deals')}><ArrowLeft className="h-4 w-4" /></Button>
        <div>
          <h1 className="text-2xl font-bold">{deal.title}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={deal.status === 'won' ? 'success' : deal.status === 'lost' ? 'destructive' : 'secondary'}>
              {deal.status === 'won' ? 'Выиграна' : deal.status === 'lost' ? 'Проиграна' : 'Открыта'}
            </Badge>
            {deal.stage && <Badge style={{ backgroundColor: deal.stage.color + '20', color: deal.stage.color }}>{deal.stage.name}</Badge>}
          </div>
        </div>
        <div className="ml-auto text-right">
          <p className="text-2xl font-bold text-primary">{formatCurrency(deal.amount)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader><CardTitle>Информация</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between"><span className="text-sm text-muted-foreground">Клиент</span><span className="text-sm font-medium">{deal.customer?.name || '-'}</span></div>
              <Separator />
              <div className="flex justify-between"><span className="text-sm text-muted-foreground">Ответственный</span><span className="text-sm font-medium">{deal.assignedUser ? `${deal.assignedUser.firstName} ${deal.assignedUser.lastName}` : '-'}</span></div>
              <Separator />
              <div className="flex justify-between"><span className="text-sm text-muted-foreground">Дата закрытия</span><span className="text-sm font-medium">{deal.expectedCloseDate ? formatDate(deal.expectedCloseDate) : '-'}</span></div>
              <Separator />
              <div className="flex justify-between"><span className="text-sm text-muted-foreground">Создана</span><span className="text-sm font-medium">{formatDate(deal.createdAt)}</span></div>
            </CardContent>
          </Card>

          {deal.notes && (
            <Card>
              <CardHeader><CardTitle>Заметки</CardTitle></CardHeader>
              <CardContent><p className="text-sm">{deal.notes}</p></CardContent>
            </Card>
          )}
        </div>

        <div className="lg:col-span-2">
          <Tabs defaultValue="timeline">
            <TabsList>
              <TabsTrigger value="timeline">Хронология</TabsTrigger>
              <TabsTrigger value="comments">Комментарии</TabsTrigger>
            </TabsList>
            <TabsContent value="timeline">
              <Card>
                <CardContent className="pt-6">
                  <DealTimeline activities={deal.activities || []} comments={comments} />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="comments">
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div className="flex gap-2">
                    <Input value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="Напишите комментарий..." onKeyDown={(e) => e.key === 'Enter' && handleAddComment()} />
                    <Button size="icon" onClick={handleAddComment} disabled={!commentText.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                  {comments.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Нет комментариев</p>}
                  {comments.map((c) => (
                    <div key={c.id} className="p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">{c.user?.firstName} {c.user?.lastName}</span>
                        <span className="text-xs text-muted-foreground">{formatDate(c.createdAt)}</span>
                      </div>
                      <p className="text-sm">{c.text}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
