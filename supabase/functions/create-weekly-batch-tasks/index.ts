import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Batch {
  id: string;
  batch_number: string;
  created_by: string;
  current_stage: string;
}

interface Task {
  id: string;
  name: string;
  batch_id: string;
  created_at: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting weekly batch task creation...');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get current week info (ISO week format for consistency)
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentWeek = getISOWeek(now);
    const weekTag = `WEEK-${currentYear}-${String(currentWeek).padStart(2, '0')}`;

    console.log(`Current week tag: ${weekTag}`);

    // Get all batches that are NOT in harvest stage
    const { data: batches, error: batchError } = await supabase
      .from('batch_lifecycle_records')
      .select('id, batch_number, created_by, current_stage')
      .neq('current_stage', 'harvest')
      .eq('status', 'in_progress') as { data: Batch[] | null; error: any };

    if (batchError) {
      console.error('Error fetching batches:', batchError);
      throw batchError;
    }

    console.log(`Found ${batches?.length || 0} active batches (not in harvest stage)`);

    if (!batches || batches.length === 0) {
      return new Response(
        JSON.stringify({ 
          message: 'No active batches found',
          tasksCreated: 0 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // Calculate due date (Friday of current week at 5:00 PM SAST = 3:00 PM UTC)
    const dueDate = getNextFriday(now);
    dueDate.setHours(15, 0, 0, 0); // 3:00 PM UTC = 5:00 PM SAST
    const dueDateString = dueDate.toISOString().split('T')[0];

    console.log(`Due date for tasks: ${dueDateString} 15:00 UTC (17:00 SAST)`);

    let totalTasksCreated = 0;
    const results = [];

    // Process each batch
    for (const batch of batches) {
      console.log(`Processing batch: ${batch.batch_number}`);

      // Check if tasks for this week already exist for this batch (anti-duplication)
      const { data: existingTasks, error: taskCheckError } = await supabase
        .from('tasks')
        .select('id, name')
        .eq('batch_id', batch.id)
        .or(`name.ilike.%SOF40:%,name.ilike.%SOF03:%`)
        .gte('created_at', getStartOfWeek(now).toISOString()) as { data: Task[] | null; error: any };

      if (taskCheckError) {
        console.error(`Error checking existing tasks for batch ${batch.batch_number}:`, taskCheckError);
        continue;
      }

      const hasSof40 = existingTasks?.some(t => t.name.includes('SOF40:'));
      const hasSof03 = existingTasks?.some(t => t.name.includes('SOF03:'));

      console.log(`Batch ${batch.batch_number}: SOF40 exists: ${hasSof40}, SOF03 exists: ${hasSof03}`);

      // Get current task count for generating task numbers
      const { count: taskCount } = await supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true });

      const tasksToCreate = [];

      // Create SOF40 task if it doesn't exist
      if (!hasSof40) {
        const sof40TaskNumber = `T-${String((taskCount || 0) + tasksToCreate.length + 1).padStart(4, '0')}`;
        tasksToCreate.push({
          task_number: sof40TaskNumber,
          name: `SOF40: Weekly Inspection - ${batch.batch_number}`,
          description: `Weekly inspection and monitoring for batch ${batch.batch_number}. Complete all required checks and document findings.`,
          status: 'pending',
          due_date: dueDateString,
          assignee: batch.created_by,
          created_by: batch.created_by,
          batch_id: batch.id
        });
      }

      // Create SOF03 task if it doesn't exist
      if (!hasSof03) {
        const sof03TaskNumber = `T-${String((taskCount || 0) + tasksToCreate.length + 1).padStart(4, '0')}`;
        tasksToCreate.push({
          task_number: sof03TaskNumber,
          name: `SOF03: Phase Gate Review - ${batch.batch_number}`,
          description: `Phase gate review and compliance check for batch ${batch.batch_number}. Verify all requirements before phase transition.`,
          status: 'pending',
          due_date: dueDateString,
          assignee: batch.created_by,
          created_by: batch.created_by,
          batch_id: batch.id
        });
      }

      // Insert tasks
      if (tasksToCreate.length > 0) {
        const { data: createdTasks, error: insertError } = await supabase
          .from('tasks')
          .insert(tasksToCreate)
          .select();

        if (insertError) {
          console.error(`Error creating tasks for batch ${batch.batch_number}:`, insertError);
          results.push({
            batch_number: batch.batch_number,
            success: false,
            error: insertError.message
          });
        } else {
          console.log(`Created ${createdTasks?.length || 0} tasks for batch ${batch.batch_number}`);
          totalTasksCreated += createdTasks?.length || 0;
          results.push({
            batch_number: batch.batch_number,
            success: true,
            tasksCreated: createdTasks?.length || 0
          });
        }
      } else {
        console.log(`No new tasks needed for batch ${batch.batch_number} - tasks already exist for this week`);
        results.push({
          batch_number: batch.batch_number,
          success: true,
          tasksCreated: 0,
          message: 'Tasks already exist for current week'
        });
      }
    }

    console.log(`Task creation completed. Total tasks created: ${totalTasksCreated}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Weekly batch tasks created successfully`,
        weekTag,
        dueDate: dueDateString,
        batchesProcessed: batches.length,
        totalTasksCreated,
        results
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error('Error in create-weekly-batch-tasks:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.toString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

// Helper function to get ISO week number
function getISOWeek(date: Date): number {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return weekNo;
}

// Helper function to get start of current week (Monday)
function getStartOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
  return new Date(d.setDate(diff));
}

// Helper function to get next Friday
function getNextFriday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const daysUntilFriday = day <= 5 ? 5 - day : 7 - day + 5;
  d.setDate(d.getDate() + daysUntilFriday);
  return d;
}
