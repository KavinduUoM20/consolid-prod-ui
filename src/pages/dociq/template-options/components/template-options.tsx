import { Fragment, useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

// Simplified schema for template creation
const createTemplateSchema = z.object({
  title: z.string().min(2, { message: 'Template title is required' }),
  department: z.string().min(2, { message: 'Department is required' }),
  description: z.string().min(10, { message: 'Description must be at least 10 characters' }),
});

type CreateTemplateFormValues = z.infer<typeof createTemplateSchema>;
import { Alert, AlertIcon, AlertTitle } from '@/components/ui/alert';
import { RiCheckboxCircleFill, RiDeleteBin6Line, RiArrowLeftLine, RiSaveLine, RiAddLine, RiSettings3Line, RiEditLine, RiCloseLine } from '@remixicon/react';
import { toast } from 'sonner';
import { useTemplates, transformApiTemplateToItem } from '../../extractions/hooks/use-templates';
import { useTemplateCreation } from '../../extractions/hooks/use-template-creation';
import { useTemplateDeletion } from '../../extractions/hooks/use-template-deletion';
import { FileText, Plus, Settings, Grid3X3, List, Search, Filter, MoreVertical, Eye, EyeOff, Lock, Unlock, Edit3, X, Minus } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ITemplateItem {
  default: boolean;
  title: string;
  department: string;
  fields: number;
  description: string;
  lastUsed: string;
  status: string;
  badge?: boolean;
  id?: string;
}

interface FieldConfig {
  name: string;
  type: 'text' | 'number' | 'date' | 'email' | 'select';
  required: boolean;
  visible: boolean;
  editable: boolean;
  validation?: string;
  options?: string[];
}

interface FieldMapping {
  id: string;
  plmField: string;
  similarFieldNames: string[];
  sampleValues: string[];
  description: string;
}

export function TemplateOptions() {
  // Use the API hook to fetch templates
  const { data: apiTemplates } = useTemplates();
  const { createTemplate, isCreating } = useTemplateCreation();
  const { deleteTemplate, isDeleting } = useTemplateDeletion();
  
  // Transform API templates to component format
  const [items, setItems] = useState<ITemplateItem[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isCreatingTemplate, setIsCreatingTemplate] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ITemplateItem | null>(null);
  
  // Enterprise features
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [templateVisibility, setTemplateVisibility] = useState<'public' | 'private'>('public');
  const [autoSave, setAutoSave] = useState(true);
  const [enableValidation, setEnableValidation] = useState(true);
  const [fieldConfigs, setFieldConfigs] = useState<FieldConfig[]>([
    { name: 'title', type: 'text', required: true, visible: true, editable: true },
    { name: 'department', type: 'text', required: true, visible: true, editable: true },
    { name: 'fields', type: 'number', required: true, visible: true, editable: true },
    { name: 'description', type: 'text', required: true, visible: true, editable: true },
    { name: 'lastUsed', type: 'date', required: true, visible: true, editable: true },
    { name: 'status', type: 'select', required: true, visible: true, editable: true, options: ['Active', 'Inactive', 'Draft'] },
  ]);

  // Field mapping state
  const [fieldMappings, setFieldMappings] = useState<FieldMapping[]>([
    { id: '1', plmField: '', similarFieldNames: [], sampleValues: [], description: '' }
  ]);

  // Update items when API data changes
  useEffect(() => {
    if (apiTemplates && apiTemplates.length > 0) {
      const transformedTemplates = apiTemplates.map(transformApiTemplateToItem);
      setItems(transformedTemplates);
    }
  }, [apiTemplates]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateTemplateFormValues>({
    resolver: zodResolver(createTemplateSchema),
  });

  const handleCreateTemplate = async (data: CreateTemplateFormValues) => {
    try {
      await createTemplate({
        title: data.title,
        department: data.department,
        description: data.description,
      });
      
      toast.success('Template created successfully!');
      setIsCreatingTemplate(false);
      reset();
    } catch (error) {
      toast.error('Failed to create template');
    }
  };

  const handleDeleteTemplate = async (index: number) => {
    const template = items[index];
    if (template.id) {
      try {
        await deleteTemplate(template.id);
        toast.success('Template deleted successfully!');
      } catch (error) {
        toast.error('Failed to delete template');
      }
    }
  };

  const handleEditTemplate = (template: ITemplateItem) => {
    setSelectedTemplate(template);
    setIsCreatingTemplate(true);
  };

  const updateFieldConfig = (index: number, field: keyof FieldConfig, value: any) => {
    const newConfigs = [...fieldConfigs];
    newConfigs[index] = { ...newConfigs[index], [field]: value };
    setFieldConfigs(newConfigs);
  };

  const addFieldMapping = () => {
    setFieldMappings([...fieldMappings, { id: Date.now().toString(), plmField: '', similarFieldNames: [], sampleValues: [], description: '' }]);
  };

  const removeFieldMapping = (id: string) => {
    setFieldMappings(fieldMappings.filter(mapping => mapping.id !== id));
  };

  const updateFieldMapping = (id: string, field: keyof FieldMapping, value: any) => {
    setFieldMappings(fieldMappings.map(mapping => 
      mapping.id === id ? { ...mapping, [field]: value } : mapping
    ));
  };

  const addSimilarFieldName = (mappingId: string, value: string) => {
    if (value.trim()) {
      updateFieldMapping(mappingId, 'similarFieldNames', [
        ...fieldMappings.find(m => m.id === mappingId)?.similarFieldNames || [],
        value.trim()
      ]);
    }
  };

  const removeSimilarFieldName = (mappingId: string, fieldIndex: number) => {
    const mapping = fieldMappings.find(m => m.id === mappingId);
    if (mapping) {
      const newSimilarNames = mapping.similarFieldNames.filter((_, index) => index !== fieldIndex);
      updateFieldMapping(mappingId, 'similarFieldNames', newSimilarNames);
    }
  };

  const addSampleValue = (mappingId: string, value: string) => {
    if (value.trim()) {
      updateFieldMapping(mappingId, 'sampleValues', [
        ...fieldMappings.find(m => m.id === mappingId)?.sampleValues || [],
        value.trim()
      ]);
    }
  };

  const removeSampleValue = (mappingId: string, valueIndex: number) => {
    const mapping = fieldMappings.find(m => m.id === mappingId);
    if (mapping) {
      const newSampleValues = mapping.sampleValues.filter((_, index) => index !== valueIndex);
      updateFieldMapping(mappingId, 'sampleValues', newSampleValues);
    }
  };

  const renderTemplateCard = (item: ITemplateItem, index: number) => (
    <Card key={index} className="relative group hover:shadow-lg transition-all duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg font-semibold">{item.title}</CardTitle>
            {item.badge && (
              <Badge variant="secondary" className="text-xs">
                New
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="sm" onClick={() => handleEditTemplate(item)}>
              <Edit3 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => handleDeleteTemplate(index)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{item.department}</span>
          <span>•</span>
          <span>{item.fields} fields</span>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Last used: {item.lastUsed}</span>
          <Badge variant={item.status === 'Active' ? 'default' : 'secondary'}>
            {item.status}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );

  const renderTemplateList = (item: ITemplateItem, index: number) => (
    <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
      <div className="flex items-center gap-3">
        <FileText className="h-5 w-5 text-primary" />
        <div>
          <h3 className="font-medium">{item.title}</h3>
          <p className="text-sm text-muted-foreground">{item.department} • {item.fields} fields</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant={item.status === 'Active' ? 'default' : 'secondary'}>
          {item.status}
        </Badge>
        <Button variant="ghost" size="sm" onClick={() => handleEditTemplate(item)}>
          <Edit3 className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => handleDeleteTemplate(index)}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Template Options</h1>
          <p className="text-muted-foreground">Manage and create document templates</p>
        </div>
        <Button onClick={() => setIsCreatingTemplate(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Template
        </Button>
      </div>

      {/* Filters and View Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
              <SelectItem value="Draft">Draft</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Templates Grid/List */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No templates found</h3>
          <p className="text-muted-foreground mb-4">Create your first template to get started</p>
          <Button onClick={() => setIsCreatingTemplate(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Template
          </Button>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-2'}>
          {filteredItems.map((item, index) => 
            viewMode === 'grid' ? renderTemplateCard(item, index) : renderTemplateList(item, index)
          )}
        </div>
      )}

      {/* Create Template Modal */}
      {isCreatingTemplate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Create New Template</h2>
              <Button variant="ghost" size="sm" onClick={() => setIsCreatingTemplate(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="fields">Field Configuration</TabsTrigger>
                <TabsTrigger value="advanced">Advanced Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <form onSubmit={handleSubmit(handleCreateTemplate)} className="space-y-4">
                  <div>
                    <Label htmlFor="title">Template Title</Label>
                    <Input
                      id="title"
                      {...register('title')}
                      placeholder="Enter template title"
                    />
                    {errors.title && (
                      <p className="text-sm text-destructive mt-1">{errors.title.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="department">Department</Label>
                    <Input
                      id="department"
                      {...register('department')}
                      placeholder="Enter department"
                    />
                    {errors.department && (
                      <p className="text-sm text-destructive mt-1">{errors.department.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      {...register('description')}
                      placeholder="Enter template description"
                      rows={3}
                    />
                    {errors.description && (
                      <p className="text-sm text-destructive mt-1">{errors.description.message}</p>
                    )}
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsCreatingTemplate(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isCreating}>
                      {isCreating ? 'Creating...' : 'Create Template'}
                    </Button>
                  </div>
                </form>
              </TabsContent>

              <TabsContent value="fields" className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Field Configuration</h3>
                    <Button variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Field
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {fieldConfigs.map((field, index) => (
                      <Card key={index}>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <Input
                              value={field.name}
                              onChange={(e) => updateFieldConfig(index, 'name', e.target.value)}
                              placeholder="Field name"
                              className="w-48"
                            />
                            <div className="flex items-center gap-2">
                              <Select
                                value={field.type}
                                onValueChange={(value) => updateFieldConfig(index, 'type', value)}
                              >
                                <SelectTrigger className="w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="text">Text</SelectItem>
                                  <SelectItem value="number">Number</SelectItem>
                                  <SelectItem value="date">Date</SelectItem>
                                  <SelectItem value="email">Email</SelectItem>
                                  <SelectItem value="select">Select</SelectItem>
                                </SelectContent>
                              </Select>
                              <Switch
                                checked={field.required}
                                onCheckedChange={(checked) => updateFieldConfig(index, 'required', checked)}
                              />
                              <Switch
                                checked={field.visible}
                                onCheckedChange={(checked) => updateFieldConfig(index, 'visible', checked)}
                              />
                              <Switch
                                checked={field.editable}
                                onCheckedChange={(checked) => updateFieldConfig(index, 'editable', checked)}
                              />
                            </div>
                          </div>
                        </CardHeader>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="advanced" className="space-y-4">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Advanced Settings</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Template Visibility</Label>
                        <p className="text-sm text-muted-foreground">Control who can access this template</p>
                      </div>
                      <RadioGroup value={templateVisibility} onValueChange={(value) => setTemplateVisibility(value as 'public' | 'private')}>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="public" id="public" />
                          <Label htmlFor="public">Public</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="private" id="private" />
                          <Label htmlFor="private">Private</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Auto Save</Label>
                        <p className="text-sm text-muted-foreground">Automatically save changes</p>
                      </div>
                      <Switch checked={autoSave} onCheckedChange={setAutoSave} />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Enable Validation</Label>
                        <p className="text-sm text-muted-foreground">Validate field inputs</p>
                      </div>
                      <Switch checked={enableValidation} onCheckedChange={setEnableValidation} />
                    </div>

                    <Separator />

                    <div>
                      <Label>Field Mapping</Label>
                      <p className="text-sm text-muted-foreground mb-4">Map template fields to PLM system</p>
                      
                      <div className="space-y-4">
                        {fieldMappings.map((mapping) => (
                          <Card key={mapping.id}>
                            <CardHeader>
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium">Field Mapping</h4>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeFieldMapping(mapping.id)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div>
                                <Label>PLM Field</Label>
                                <Input
                                  value={mapping.plmField}
                                  onChange={(e) => updateFieldMapping(mapping.id, 'plmField', e.target.value)}
                                  placeholder="Enter PLM field name"
                                />
                              </div>
                              
                              <div>
                                <Label>Similar Field Names</Label>
                                <div className="space-y-2">
                                  {mapping.similarFieldNames.map((name, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                      <Input
                                        value={name}
                                        onChange={(e) => {
                                          const newNames = [...mapping.similarFieldNames];
                                          newNames[index] = e.target.value;
                                          updateFieldMapping(mapping.id, 'similarFieldNames', newNames);
                                        }}
                                        placeholder="Similar field name"
                                      />
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeSimilarFieldName(mapping.id, index)}
                                      >
                                        <X className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  ))}
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => addSimilarFieldName(mapping.id, '')}
                                  >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Similar Field
                                  </Button>
                                </div>
                              </div>

                              <div>
                                <Label>Sample Values</Label>
                                <div className="space-y-2">
                                  {mapping.sampleValues.map((value, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                      <Input
                                        value={value}
                                        onChange={(e) => {
                                          const newValues = [...mapping.sampleValues];
                                          newValues[index] = e.target.value;
                                          updateFieldMapping(mapping.id, 'sampleValues', newValues);
                                        }}
                                        placeholder="Sample value"
                                      />
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeSampleValue(mapping.id, index)}
                                      >
                                        <X className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  ))}
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => addSampleValue(mapping.id, '')}
                                  >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Sample Value
                                  </Button>
                                </div>
                              </div>

                              <div>
                                <Label>Description</Label>
                                <Textarea
                                  value={mapping.description}
                                  onChange={(e) => updateFieldMapping(mapping.id, 'description', e.target.value)}
                                  placeholder="Field mapping description"
                                  rows={2}
                                />
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                        
                        <Button variant="outline" onClick={addFieldMapping}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Field Mapping
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      )}
    </div>
  );
}
