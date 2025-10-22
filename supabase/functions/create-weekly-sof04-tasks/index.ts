import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Starting weekly SOF04 task creation...')

    // Create Supabase client with service role key for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Get current date and week boundaries
    const now = new Date()
    const currentDay = now.getUTCDay()
    const daysToMonday = currentDay === 0 ? 6 : currentDay - 1
    
    // Start of week (Monday 00:00:00 UTC)
    const weekStart = new Date(now)
    weekStart.setUTCDate(now.getUTCDate() - daysToMonday)
    weekStart.setUTCHours(0, 0, 0, 0)
    
    // End of week (Sunday 23:59:59 UTC)
    const weekEnd = new Date(weekStart)
    weekEnd.setUTCDate(weekStart.getUTCDate() + 6)
    weekEnd.setUTCHours(23, 59, 59, 999)

    // Due date: Friday 5:00 PM SAST = 3:00 PM UTC
    const dueDate = new Date(weekStart)
    dueDate.setUTCDate(weekStart.getUTCDate() + 4) // Friday
    dueDate.setUTCHours(15, 0, 0, 0) // 3:00 PM UTC = 5:00 PM SAST
    const dueDateString = dueDate.toISOString().split('T')[0]

    console.log(`Processing batches for week: ${weekStart.toISOString()} to ${weekEnd.toISOString()}`)

    // Get all batches in Cloning stage only that are in progress
    const { data: activeBatches, error: batchError } = await supabaseAdmin
      .from('batch_lifecycle_records')
      .select('id, batch_number, created_by, current_stage')
      .eq('status', 'in_progress')
      .eq('current_stage', 'cloning')
      .not('created_by', 'is', null)

    if (batchError) {
      console.error('Error fetching active batches:', batchError)
      throw batchError
    }

    console.log(`Found ${activeBatches?.length || 0} batches in Cloning phase`)

    let tasksCreated = 0
    let tasksSkipped = 0

    // Process each batch
    for (const batch of activeBatches || []) {
      console.log(`Processing batch ${batch.batch_number} (${batch.id}) - Stage: ${batch.current_stage}`)

      // Check if SOF04 task already exists for this batch this week
      const { data: existingTasks, error: taskCheckError } = await supabaseAdmin
        .from('tasks')
        .select('id, status')
        .eq('batch_id', batch.id)
        .eq('name', `SOF04: Weekly Maintenance - ${batch.batch_number}`)
        .gte('created_at', weekStart.toISOString())
        .lte('created_at', weekEnd.toISOString())

      if (taskCheckError) {
        console.error(`Error checking tasks for batch ${batch.batch_number}:`, taskCheckError)
        continue
      }

      // Skip if task already exists for this week
      if (existingTasks && existingTasks.length > 0) {
        console.log(`SOF04 task already exists for batch ${batch.batch_number} this week, skipping`)
        tasksSkipped++
        continue
      }

      // Get the next task number
      const { count: taskCount } = await supabaseAdmin
        .from('tasks')
        .select('*', { count: 'exact', head: true })

      const taskNumber = `T-${String((taskCount || 0) + 1).padStart(4, '0')}`

      // Create the weekly task
      const { error: createError } = await supabaseAdmin
        .from('tasks')
        .insert({
          task_number: taskNumber,
          name: `SOF04: Weekly Maintenance - ${batch.batch_number}`,
          description: `Mandatory weekly maintenance checklist for batch ${batch.batch_number} in ${batch.current_stage} phase. Must be completed by Friday 5:00 PM SAST.`,
          status: 'in_progress',
          due_date: dueDateString,
          assignee: batch.created_by,
          created_by: batch.created_by,
          batch_id: batch.id
        })

      if (createError) {
        console.error(`Error creating task for batch ${batch.batch_number}:`, createError)
        continue
      }

      console.log(`Created task ${taskNumber} for batch ${batch.batch_number}`)
      tasksCreated++
    }

    const result = {
      success: true,
      weekStart: weekStart.toISOString(),
      weekEnd: weekEnd.toISOString(),
      batchesProcessed: activeBatches?.length || 0,
      tasksCreated,
      tasksSkipped,
      message: `Successfully processed ${activeBatches?.length || 0} batches in Cloning phase: ${tasksCreated} tasks created, ${tasksSkipped} tasks skipped (already exist)`
    }

    console.log('Weekly task creation completed:', result)

    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('Error in create-weekly-sof04-tasks:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
