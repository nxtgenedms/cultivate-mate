import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ApprovalWorkflow {
  id: string;
  task_category: string;
  category_display_name: string;
  stages: string[];
  total_stages: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useApprovalWorkflows = () => {
  return useQuery({
    queryKey: ['approval-workflows'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('approval_workflows')
        .select('*')
        .eq('is_active', true)
        .order('category_display_name');

      if (error) throw error;
      
      return data.map(row => ({
        ...row,
        stages: Array.isArray(row.stages) ? row.stages : JSON.parse(row.stages as string)
      })) as ApprovalWorkflow[];
    },
  });
};

export const useUpdateApprovalWorkflow = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, stages }: { id: string; stages: string[] }) => {
      const { error } = await supabase
        .from('approval_workflows')
        .update({
          stages: stages,
          total_stages: stages.length,
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approval-workflows'] });
      toast.success('Approval workflow updated successfully');
    },
    onError: (error) => {
      console.error('Error updating workflow:', error);
      toast.error('Failed to update approval workflow');
    },
  });
};
