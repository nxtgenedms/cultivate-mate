import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock } from "lucide-react";
import { getApprovalWorkflow, TaskCategory } from "@/lib/taskCategoryUtils";

interface ApprovalProgressBadgeProps {
  category: TaskCategory;
  currentStage: number;
  status: string;
}

export const ApprovalProgressBadge = ({
  category,
  currentStage,
  status,
}: ApprovalProgressBadgeProps) => {
  const workflow = getApprovalWorkflow(category);
  const currentStageName = workflow.stages[currentStage] || "Unknown";

  if (status === "completed") {
    return (
      <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
        <CheckCircle2 className="mr-1 h-3 w-3" />
        Completed
      </Badge>
    );
  }

  if (status === "rejected") {
    return (
      <Badge variant="destructive">
        Rejected at Stage {currentStage + 1}
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
      <Clock className="mr-1 h-3 w-3" />
      Awaiting: {currentStageName} ({currentStage + 1}/{workflow.totalStages})
    </Badge>
  );
};
