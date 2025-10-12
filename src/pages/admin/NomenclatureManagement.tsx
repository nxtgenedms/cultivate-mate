import { useState } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, MoreVertical, ArrowLeft, RefreshCw, X as XIcon, ChevronUp, ChevronDown } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface NomenclatureTemplate {
  id: string;
  entity_type: string;
  format_pattern: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
}

interface TemplateSegment {
  id: string;
  type: 'literal' | 'date' | 'counter' | 'field';
  value: string;
  label: string;
}

const AVAILABLE_SEGMENTS = [
  { type: 'literal' as const, value: '', label: 'Literal', placeholder: 'Enter text' },
  { type: 'date' as const, value: 'YYYYMMDD', label: 'Created at (YYYYMMDD)' },
  { type: 'date' as const, value: 'YYYYMM', label: 'Created at (YYYYMM)' },
  { type: 'date' as const, value: 'DDMMYY', label: 'Created at (DDMMYY)' },
  { type: 'date' as const, value: 'DDMMYYYY', label: 'Created at (DDMMYYYY)' },
  { type: 'date' as const, value: 'Weekday', label: 'Created at (Weekday)' },
  { type: 'date' as const, value: 'Weeknumber', label: 'Created at (Weeknumber)' },
  { type: 'date' as const, value: 'YYYY', label: 'Created at (YYYY)' },
  { type: 'date' as const, value: 'YY', label: 'Created at (YY)' },
  { type: 'counter' as const, value: 'COUNT', label: 'ID' },
  { type: 'field' as const, value: 'strain_name_initials', label: 'strain_name_initials' },
];

export default function NomenclatureManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<NomenclatureTemplate | null>(null);
  const [entityType, setEntityType] = useState('');
  const [segments, setSegments] = useState<TemplateSegment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['nomenclature-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('nomenclature_templates')
        .select('*')
        .order('entity_type');
      
      if (error) throw error;
      return data as NomenclatureTemplate[];
    },
  });

  const generateFormatPattern = () => {
    return segments.map(seg => {
      if (seg.type === 'literal') return seg.value;
      if (seg.type === 'date') return `{${seg.value}}`;
      if (seg.type === 'counter') return '{id}';
      if (seg.type === 'field') return `{${seg.value}}`;
      return '';
    }).join('-');
  };

  const generatePreview = () => {
    return segments.map(seg => {
      if (seg.type === 'literal') return seg.value;
      if (seg.type === 'date' && seg.value === 'YYYYMMDD') return '20250821';
      if (seg.type === 'date' && seg.value === 'DDMMYY') return '210825';
      if (seg.type === 'date' && seg.value === 'YYYY') return '2025';
      if (seg.type === 'counter') return '1';
      if (seg.type === 'field' && seg.value === 'strain_name_initials') return 'S';
      return seg.value;
    }).join('-');
  };

  const createMutation = useMutation({
    mutationFn: async () => {
      const formatPattern = generateFormatPattern();
      const { error } = await supabase
        .from('nomenclature_templates')
        .insert([{
          entity_type: entityType,
          format_pattern: formatPattern,
          description: `Template for ${entityType}`
        }]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nomenclature-templates'] });
      toast({ title: 'Template created successfully' });
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to create template',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (id: string) => {
      const formatPattern = generateFormatPattern();
      const { error } = await supabase
        .from('nomenclature_templates')
        .update({
          format_pattern: formatPattern,
          description: `Template for ${entityType}`
        })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nomenclature-templates'] });
      toast({ title: 'Template updated successfully' });
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to update template',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('nomenclature_templates')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nomenclature-templates'] });
      toast({ title: 'Template deleted successfully' });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to delete template',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const resetForm = () => {
    setEntityType('');
    setSegments([]);
    setEditingTemplate(null);
    setIsSheetOpen(false);
  };

  const parseFormatPattern = (pattern: string): TemplateSegment[] => {
    const parts = pattern.split('-');
    return parts.map((part, idx) => {
      if (part.startsWith('{') && part.endsWith('}')) {
        const value = part.slice(1, -1);
        if (value === 'id') {
          return { id: `seg-${idx}`, type: 'counter', value: 'COUNT', label: 'ID' };
        }
        if (value === 'strain_name_initials') {
          return { id: `seg-${idx}`, type: 'field', value, label: 'strain_name_initials' };
        }
        return { id: `seg-${idx}`, type: 'date', value, label: `Created at (${value})` };
      }
      return { id: `seg-${idx}`, type: 'literal', value: part, label: 'Literal' };
    });
  };

  const handleEdit = (template: NomenclatureTemplate) => {
    setEditingTemplate(template);
    setEntityType(template.entity_type);
    setSegments(parseFormatPattern(template.format_pattern));
    setIsSheetOpen(true);
  };

  const handleSubmit = () => {
    if (!entityType || segments.length === 0) {
      toast({ title: 'Please provide entity type and at least one segment', variant: 'destructive' });
      return;
    }
    if (editingTemplate) {
      updateMutation.mutate(editingTemplate.id);
    } else {
      createMutation.mutate();
    }
  };

  const addSegment = (segment: typeof AVAILABLE_SEGMENTS[0]) => {
    const newSegment: TemplateSegment = {
      id: `seg-${Date.now()}`,
      type: segment.type,
      value: segment.value,
      label: segment.label,
    };
    setSegments([...segments, newSegment]);
  };

  const removeSegment = (id: string) => {
    setSegments(segments.filter(seg => seg.id !== id));
  };

  const updateSegmentValue = (id: string, value: string) => {
    setSegments(segments.map(seg => seg.id === id ? { ...seg, value } : seg));
  };

  const moveSegmentUp = (index: number) => {
    if (index === 0) return;
    const newSegments = [...segments];
    [newSegments[index - 1], newSegments[index]] = [newSegments[index], newSegments[index - 1]];
    setSegments(newSegments);
  };

  const moveSegmentDown = (index: number) => {
    if (index === segments.length - 1) return;
    const newSegments = [...segments];
    [newSegments[index], newSegments[index + 1]] = [newSegments[index + 1], newSegments[index]];
    setSegments(newSegments);
  };

  const filteredSegments = AVAILABLE_SEGMENTS.filter(seg =>
    seg.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Nomenclature templates</h1>
            <p className="text-muted-foreground mt-2">
              Define custom ID formats for various entities
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon">
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button onClick={() => { setEditingTemplate(null); setIsSheetOpen(true); }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Template
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-8">Loading templates...</div>
        ) : (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Template</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates.map((template, idx) => (
                  <TableRow key={template.id}>
                    <TableCell>{idx + 1}</TableCell>
                    <TableCell className="capitalize">{template.entity_type}</TableCell>
                    <TableCell>
                      <code className="px-2 py-1 bg-muted rounded text-sm">
                        {template.format_pattern}
                      </code>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(template)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => deleteMutation.mutate(template.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}

        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetContent className="w-full sm:max-w-3xl overflow-y-auto">
            <SheetHeader>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={resetForm}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <SheetTitle>
                  {editingTemplate ? `${entityType} Nomenclature template` : 'New Nomenclature template'}
                </SheetTitle>
              </div>
              <SheetDescription>
                Build your custom ID format by adding segments
              </SheetDescription>
            </SheetHeader>

            <div className="grid grid-cols-2 gap-6 mt-6">
              <div className="space-y-4">
                <Input
                  placeholder="Search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <ScrollArea className="h-[500px] border rounded-md p-4">
                  <div className="space-y-2">
                    {!editingTemplate && (
                      <div className="mb-4">
                        <label className="text-sm font-medium mb-2 block">Entity Type</label>
                        <Input
                          placeholder="e.g., batch, plant"
                          value={entityType}
                          onChange={(e) => setEntityType(e.target.value)}
                        />
                      </div>
                    )}
                    {filteredSegments.map((seg, idx) => (
                      <Button
                        key={idx}
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => addSegment(seg)}
                      >
                        {seg.label}
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-4">Template</h3>
                  <div className="space-y-2">
                    {segments.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Add segments from the left</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {segments.map((seg, idx) => (
                          <div key={seg.id} className="flex items-center gap-1">
                            {idx > 0 && <span className="text-muted-foreground">-</span>}
                            <div className="flex items-center gap-1 border rounded-md px-3 py-2 bg-background">
                              {seg.type === 'literal' ? (
                                <Input
                                  className="w-20 h-8 px-2"
                                  placeholder="Text"
                                  value={seg.value}
                                  onChange={(e) => updateSegmentValue(seg.id, e.target.value)}
                                />
                              ) : (
                                <span className="text-sm">{seg.label}</span>
                              )}
                              <div className="flex flex-col">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-4 w-4 p-0"
                                  onClick={() => moveSegmentUp(idx)}
                                  disabled={idx === 0}
                                >
                                  <ChevronUp className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-4 w-4 p-0"
                                  onClick={() => moveSegmentDown(idx)}
                                  disabled={idx === segments.length - 1}
                                >
                                  <ChevronDown className="h-3 w-3" />
                                </Button>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => removeSegment(seg.id)}
                              >
                                <XIcon className="h-3 w-3 text-destructive" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-4">Preview</h3>
                  <div className="border rounded-md p-4 bg-muted/50">
                    <p className="text-lg font-mono">
                      {segments.length > 0 ? generatePreview() : 'Add segments to see preview'}
                    </p>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button onClick={handleSubmit} disabled={segments.length === 0 || !entityType}>
                    Save
                  </Button>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </AdminLayout>
  );
}
