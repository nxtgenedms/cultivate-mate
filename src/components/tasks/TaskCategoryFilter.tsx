import { TASK_CATEGORIES, TaskCategory, getCategoryColor } from "@/lib/taskCategoryUtils";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface TaskCategoryFilterProps {
  selectedCategory: TaskCategory | "all";
  onCategoryChange: (category: TaskCategory | "all") => void;
}

export const TaskCategoryFilter = ({
  selectedCategory,
  onCategoryChange,
}: TaskCategoryFilterProps) => {
  return (
    <ScrollArea className="w-full whitespace-nowrap">
      <div className="flex gap-2 pb-2">
        <Badge
          variant={selectedCategory === "all" ? "default" : "outline"}
          className="cursor-pointer px-4 py-2"
          onClick={() => onCategoryChange("all")}
        >
          All Categories
        </Badge>
        {Object.entries(TASK_CATEGORIES).map(([key, label]) => (
          <Badge
            key={key}
            variant={selectedCategory === key ? "default" : "outline"}
            className={`cursor-pointer px-4 py-2 ${
              selectedCategory === key ? "" : getCategoryColor(key as TaskCategory)
            }`}
            onClick={() => onCategoryChange(key as TaskCategory)}
          >
            {label}
          </Badge>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
};
