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
    console.log('Starting daily SOF12 task creation...')

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

    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0]
    const todayStart = `${today}T00:00:00Z`
    const todayEnd = `${today}T23:59:59Z`

    // Calculate due date (5:00 PM SAST = 3:00 PM UTC)
    const dueDate = new Date()
    dueDate.setUTCHours(15, 0, 0, 0) // 3:00 PM UTC = 5:00 PM SAST
    const dueDateString = dueDate.toISOString().split('T')[0]

    console.log(`Processing batches for date: ${today}`)

    // Get all active batches with creators
    const { data: activeBatches, error: batchError } = await supabaseAdmin
      .from('batch_lifecycle_records')
      .select('id, batch_number, created_by, current_stage')
      .eq('status', 'active')
      .not('created_by', 'is', null)

    if (batchError) {
      console.error('Error fetching active batches:', batchError)
      throw batchError
    }

    console.log(`Found ${activeBatches?.length || 0} active batches`)

    let tasksCreated = 0
    let tasksSkipped = 0

    // Process each batch
    for (const batch of activeBatches || []) {
      console.log(`Processing batch ${batch.batch_number} (${batch.id})`)

      // Check if task already exists for this batch today
      const { data: existingTasks, error: taskCheckError } = await supabaseAdmin
        .from('tasks')
        .select('id, status')
        .eq('batch_id', batch.id)
        .like('name', 'SOF12:%')
        .gte('created_at', todayStart)
        .lte('created_at', todayEnd)

      if (taskCheckError) {
        console.error(`Error checking tasks for batch ${batch.batch_number}:`, taskCheckError)
        continue
      }

      // Skip if task already exists for today
      if (existingTasks && existingTasks.length > 0) {
        console.log(`Task already exists for batch ${batch.batch_number}, skipping`)
        tasksSkipped++
        continue
      }

      // Get the next task number
      const { count: taskCount } = await supabaseAdmin
        .from('tasks')
        .select('*', { count: 'exact', head: true })

      const taskNumber = `T-${String((taskCount || 0) + 1).padStart(4, '0')}`

      // Create the daily task
      const { error: createError } = await supabaseAdmin
        .from('tasks')
        .insert({
          task_number: taskNumber,
          name: `SOF12: Daily Check - ${batch.batch_number}`,
          description: `Mandatory daily checklist for batch ${batch.batch_number}. This is a recurring task that must be completed daily.`,
          status: 'pending',
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
      date: today,
      batchesProcessed: activeBatches?.length || 0,
      tasksCreated,
      tasksSkipped,
      message: `Successfully processed ${activeBatches?.length || 0} batches: ${tasksCreated} tasks created, ${tasksSkipped} tasks skipped (already exist)`
    }

    console.log('Daily task creation completed:', result)

    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('Error in create-daily-sof12-tasks:', error)
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