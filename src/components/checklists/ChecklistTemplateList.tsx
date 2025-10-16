import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit, FileText, List } from "lucide-react";
import { format } from "date-fns";

interface ChecklistTemplateListProps {
  templates: any[];
  onEdit: (template: any) => void;
  onManageItems: (template: any) => void;
}

const ChecklistTemplateList = ({ templates, onEdit, onManageItems }: ChecklistTemplateListProps) => {
  const getFrequencyBadge = (frequency: string) => {
    const colors: Record<string, string> = {
      daily: "bg-blue-500",
      weekly: "bg-green-500",
      monthly: "bg-purple-500",
      on_demand: "bg-gray-500",
    };
    
    return (
      <Badge className={colors[frequency] || "bg-gray-500"}>
        {frequency.replace('_', ' ')}
      </Badge>
    );
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Template Name</TableHead>
          <TableHead>SOF Number</TableHead>
          <TableHead>Frequency</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Created</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {templates.map((template) => (
          <TableRow key={template.id}>
            <TableCell className="font-medium">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                {template.template_name}
              </div>
            </TableCell>
            <TableCell>
              <code className="text-sm bg-muted px-2 py-1 rounded">
                {template.sof_number}
              </code>
            </TableCell>
            <TableCell>{getFrequencyBadge(template.frequency)}</TableCell>
            <TableCell>
              <Badge variant={template.is_batch_specific ? "default" : "secondary"}>
                {template.is_batch_specific ? "Batch" : "General"}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge variant={template.is_active ? "default" : "destructive"}>
                {template.is_active ? "Active" : "Inactive"}
              </Badge>
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {format(new Date(template.created_at), 'MMM dd, yyyy')}
            </TableCell>
            <TableCell className="text-right">
              <div className="flex gap-2 justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onManageItems(template)}
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(template)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default ChecklistTemplateList;
