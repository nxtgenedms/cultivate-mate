import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Shield, Lock, Info } from 'lucide-react';
import { PermissionDefinition, PermissionKey } from '@/hooks/useUserPermissions';

interface UserPermissionsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userName: string;
  userRole: string;
}

export function UserPermissionsModal({
  open,
  onOpenChange,
  userId,
  userName,
  userRole,
}: UserPermissionsModalProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [notes, setNotes] = useState('');
  const [changedPermissions, setChangedPermissions] = useState<Record<string, boolean>>({});

  // Fetch all permissions
  const { data: allPermissions = [] } = useQuery({
    queryKey: ['all-permissions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('permission_definitions')
        .select('*')
        .eq('is_active', true)
        .order('category, permission_name');

      if (error) throw error;
      return data as PermissionDefinition[];
    },
    enabled: open,
  });

  // Fetch user's overrides
  const { data: userOverrides = [] } = useQuery({
    queryKey: ['user-overrides', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_permission_overrides')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;
      return data;
    },
    enabled: open && !!userId,
  });

  // Fetch user's computed permissions (what they actually have)
  const { data: computedPermissions = {} } = useQuery({
    queryKey: ['computed-permissions', userId],
    queryFn: async () => {
      const permMap: Record<string, boolean> = {};
      
      for (const perm of allPermissions) {
        const { data, error } = await supabase.rpc('has_permission', {
          _user_id: userId,
          _permission_key: perm.permission_key,
        });

        if (!error && data !== null) {
          permMap[perm.permission_key] = data;
        }
      }

      return permMap;
    },
    enabled: open && !!userId && allPermissions.length > 0,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const updates = Object.entries(changedPermissions).map(([permKey, isGranted]) => ({
        user_id: userId,
        permission_key: permKey,
        is_granted: isGranted,
        granted_by: user?.id,
        notes: notes || null,
      }));

      // Upsert each permission override
      for (const update of updates) {
        const { error } = await supabase
          .from('user_permission_overrides')
          .upsert(update, {
            onConflict: 'user_id,permission_key',
          });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-overrides'] });
      queryClient.invalidateQueries({ queryKey: ['computed-permissions'] });
      queryClient.invalidateQueries({ queryKey: ['user-permissions'] });
      toast.success('Permissions updated successfully');
      setChangedPermissions({});
      setNotes('');
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast.error('Failed to update permissions: ' + error.message);
    },
  });

  // Group permissions by category
  const groupedPermissions = allPermissions.reduce((acc, perm) => {
    if (!acc[perm.category]) {
      acc[perm.category] = [];
    }
    acc[perm.category].push(perm);
    return acc;
  }, {} as Record<string, PermissionDefinition[]>);

  const hasOverride = (permKey: string) => {
    return userOverrides.some((o) => o.permission_key === permKey);
  };

  const getCurrentValue = (permKey: string) => {
    if (permKey in changedPermissions) {
      return changedPermissions[permKey];
    }
    return computedPermissions[permKey] || false;
  };

  const handleToggle = (permKey: string, currentValue: boolean) => {
    const defaultValue = computedPermissions[permKey] || false;
    const newValue = !currentValue;

    // If setting back to default, remove from changed permissions
    if (newValue === defaultValue && !hasOverride(permKey)) {
      const newChanged = { ...changedPermissions };
      delete newChanged[permKey];
      setChangedPermissions(newChanged);
    } else {
      setChangedPermissions({
        ...changedPermissions,
        [permKey]: newValue,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Manage Permissions: {userName}
          </DialogTitle>
          <DialogDescription>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline">{userRole}</Badge>
              <span className="text-xs text-muted-foreground">
                Toggle permissions to override role defaults
              </span>
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {Object.entries(groupedPermissions).map(([category, permissions]) => (
            <div key={category} className="space-y-3">
              <h3 className="text-sm font-semibold uppercase text-muted-foreground tracking-wide">
                {category}
              </h3>
              <div className="space-y-2">
                {permissions.map((perm) => {
                  const currentValue = getCurrentValue(perm.permission_key);
                  const isOverridden = hasOverride(perm.permission_key) || perm.permission_key in changedPermissions;
                  const defaultValue = computedPermissions[perm.permission_key];

                  return (
                    <div
                      key={perm.id}
                      className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <Label htmlFor={perm.permission_key} className="font-medium cursor-pointer">
                            {perm.permission_name}
                          </Label>
                          {isOverridden && (
                            <Badge variant="secondary" className="text-xs">
                              Override
                            </Badge>
                          )}
                        </div>
                        {perm.description && (
                          <p className="text-xs text-muted-foreground flex items-start gap-1">
                            <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
                            {perm.description}
                          </p>
                        )}
                        {!isOverridden && (
                          <p className="text-xs text-muted-foreground">
                            Default from role: {defaultValue ? 'Granted' : 'Not granted'}
                          </p>
                        )}
                      </div>
                      <Switch
                        id={perm.permission_key}
                        checked={currentValue}
                        onCheckedChange={() => handleToggle(perm.permission_key, currentValue)}
                      />
                    </div>
                  );
                })}
              </div>
              <Separator />
            </div>
          ))}

          {Object.keys(changedPermissions).length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add notes about why these permissions were changed..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => {
              setChangedPermissions({});
              setNotes('');
              onOpenChange(false);
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => saveMutation.mutate()}
            disabled={Object.keys(changedPermissions).length === 0 || saveMutation.isPending}
          >
            {saveMutation.isPending ? 'Saving...' : `Save ${Object.keys(changedPermissions).length} Changes`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
