import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { History, User, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface SOFAuditHistoryProps {
  sofId: string;
}

export function SOFAuditHistory({ sofId }: SOFAuditHistoryProps) {
  const { data: auditLogs, isLoading } = useQuery({
    queryKey: ['sof-audit-history', sofId],
    queryFn: async () => {
      const { data: auditData, error } = await supabase
        .from('sof_audit_history')
        .select('*')
        .eq('sof_id', sofId)
        .order('changed_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      
      // Fetch user profiles separately
      const userIds = [...new Set(auditData?.map(log => log.changed_by).filter(Boolean))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', userIds);
      
      // Map profiles to audit logs
      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
      const enrichedData = auditData?.map(log => ({
        ...log,
        profile: log.changed_by ? profileMap.get(log.changed_by) : null
      }));
      
      return enrichedData;
    },
  });

  const getActionBadge = (action: string) => {
    const variants: Record<string, { color: string; label: string }> = {
      created: { color: 'bg-green-500/10 text-green-700 dark:text-green-400', label: 'Created' },
      updated: { color: 'bg-blue-500/10 text-blue-700 dark:text-blue-400', label: 'Updated' },
      deleted: { color: 'bg-red-500/10 text-red-700 dark:text-red-400', label: 'Deleted' },
      activated: { color: 'bg-green-500/10 text-green-700 dark:text-green-400', label: 'Activated' },
      deactivated: { color: 'bg-orange-500/10 text-orange-700 dark:text-orange-400', label: 'Deactivated' },
    };
    const variant = variants[action] || variants.updated;
    return <Badge className={variant.color}>{variant.label}</Badge>;
  };

  const getChangedFields = (oldValues: any, newValues: any) => {
    if (!oldValues || !newValues) return [];
    
    const changes: Array<{ field: string; old: any; new: any }> = [];
    const allKeys = new Set([...Object.keys(oldValues), ...Object.keys(newValues)]);
    
    allKeys.forEach(key => {
      // Skip internal fields
      if (['id', 'created_at', 'updated_at', 'created_by'].includes(key)) return;
      
      if (JSON.stringify(oldValues[key]) !== JSON.stringify(newValues[key])) {
        changes.push({
          field: key,
          old: oldValues[key],
          new: newValues[key],
        });
      }
    });
    
    return changes;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <History className="h-5 w-5" />
          <div>
            <CardTitle>Audit History</CardTitle>
            <CardDescription>
              Track all changes made to this SOF and its fields
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        ) : !auditLogs || auditLogs.length === 0 ? (
          <div className="text-center py-8">
            <History className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">No audit history available</p>
          </div>
        ) : (
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-4">
              {auditLogs.map((log) => {
                const changes = getChangedFields(log.old_values, log.new_values);
                
                return (
                  <Card key={log.id} className="border-l-4 border-l-primary/20">
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {getActionBadge(log.action)}
                          <Badge variant="outline">{log.table_name}</Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(log.changed_at), 'PPp')}
                        </div>
                      </div>
                      
                      {log.change_description && (
                        <p className="text-sm mb-2">{log.change_description}</p>
                      )}
                      
                      {log.profile && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                          <User className="h-3 w-3" />
                          <span>{log.profile.full_name || log.profile.email}</span>
                        </div>
                      )}
                      
                      {changes.length > 0 && (
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-xs font-medium mb-2">Changed Fields:</p>
                          <div className="space-y-2">
                            {changes.map((change, idx) => (
                              <div key={idx} className="text-xs bg-muted/30 rounded p-2">
                                <span className="font-medium">{change.field}:</span>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-muted-foreground line-through">
                                    {JSON.stringify(change.old) || 'null'}
                                  </span>
                                  <span>→</span>
                                  <span className="text-primary">
                                    {JSON.stringify(change.new) || 'null'}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
