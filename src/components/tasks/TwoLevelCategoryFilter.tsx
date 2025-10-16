import { useState } from "react";
import { CATEGORY_GROUPS, TASK_CATEGORIES, TaskCategory, CategoryGroup, getCategoryColor } from "@/lib/taskCategoryUtils";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

interface TwoLevelCategoryFilterProps {
  selectedCategory: TaskCategory | "all";
  onCategoryChange: (category: TaskCategory | "all") => void;
}

export const TwoLevelCategoryFilter = ({
  selectedCategory,
  onCategoryChange,
}: TwoLevelCategoryFilterProps) => {
  const [selectedGroup, setSelectedGroup] = useState<CategoryGroup | "all">("all");

  const handleGroupClick = (group: CategoryGroup | "all") => {
    setSelectedGroup(group);
    // Always reset category to "all" when switching groups
    onCategoryChange("all");
  };

  const handleCategoryClick = (category: TaskCategory) => {
    onCategoryChange(category);
  };

  // Sync selectedGroup with selectedCategory
  const activeGroup = (() => {
    if (selectedCategory === "all") return selectedGroup;
    
    // If a specific category is selected, highlight its parent group
    for (const [groupKey, groupData] of Object.entries(CATEGORY_GROUPS)) {
      if (groupData.categories.includes(selectedCategory)) {
        return groupKey as CategoryGroup;
      }
    }
    return selectedGroup;
  })();

  return (
    <Card className="p-4">
      <div className="space-y-4">
        {/* Level 1: Group Pills */}
        <div className="flex flex-wrap gap-2">
          <Badge
            variant={selectedGroup === "all" ? "default" : "outline"}
            className="cursor-pointer px-4 py-2 text-sm hover:bg-primary/90 transition-colors"
            onClick={() => handleGroupClick("all")}
          >
            All Categories
          </Badge>
          {Object.entries(CATEGORY_GROUPS).map(([key, group]) => (
            <Badge
              key={key}
              variant={activeGroup === key ? "default" : "outline"}
              className="cursor-pointer px-4 py-2 text-sm hover:bg-primary/90 transition-colors"
              onClick={() => handleGroupClick(key as CategoryGroup)}
            >
              <span className="mr-2">{group.icon}</span>
              {group.label}
              <span className="ml-2 text-xs opacity-70">({group.categories.length})</span>
            </Badge>
          ))}
        </div>

        {/* Level 2: Category Pills (shown when a group is selected) */}
        {selectedGroup !== "all" && (
          <div className="flex flex-wrap gap-2 pt-2 border-t">
            {CATEGORY_GROUPS[selectedGroup].categories.map((category) => (
              <Badge
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                className={`cursor-pointer px-3 py-1.5 text-xs transition-colors ${
                  selectedCategory === category ? "" : getCategoryColor(category)
                }`}
                onClick={() => handleCategoryClick(category)}
              >
                {TASK_CATEGORIES[category]}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};
