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
import { templateSchema, TemplateFormValues } from '../../extractions/select-template/components/forms';
import { Alert, AlertIcon, AlertTitle } from '@/components/ui/alert';
import { RiCheckboxCircleFill, RiDeleteBin6Line, RiArrowLeftLine, RiSaveLine, RiAddLine, RiSettings3Line } from '@remixicon/react';
import { toast } from 'sonner';
import { useTemplates, transformApiTemplateToItem } from '../../extractions/hooks/use-templates';
import { useTemplateCreation } from '../../extractions/hooks/use-template-creation';
import { useTemplateDeletion } from '../../extractions/hooks/use-template-deletion';
import { FileText, Plus, Settings, Grid3X3, List, Search, Filter, MoreVertical, Eye, EyeOff, Lock, Unlock } from 'lucide-react';
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

export function MyOrders() {
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

  // Update items when API data changes
  useEffect(() => {
    if (apiTemplates && apiTemplates.length > 0) {
      const transformedTemplates = apiTemplates.map((template, index) => {
        const transformed = transformApiTemplateToItem(template, index === 0);
        return {
          default: transformed.default,
          title: transformed.title,
          department: transformed.department,
          fields: transformed.fields,
          description: transformed.description,
          lastUsed: transformed.lastUsed,
          status: transformed.status,
          badge: transformed.badge,
          id: transformed.id,
        };
      });
      setItems(transformedTemplates);
    }
  }, [apiTemplates]);

  // react-hook-form for creating new template
  const form = useForm<TemplateFormValues>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      title: '',
      department: '',
      fields: 0,
      description: '',
      lastUsed: '',
      status: 'Active',
    },
    mode: 'onChange',
  });

  const handleCreateTemplate = async (data: TemplateFormValues) => {
    try {
      const result = await createTemplate({
        title: data.title,
        department: data.department,
        fields: data.fields,
        description: data.description,
        lastUsed: data.lastUsed,
        status: data.status,
      });

      if (result.success) {
        // Add the new template to the local state
        const newTemplate: ITemplateItem = {
          default: false,
          title: data.title,
          department: data.department,
          fields: data.fields,
          description: data.description,
          lastUsed: data.lastUsed,
          status: data.status,
          id: result.data?.id || `template-${Date.now()}`,
        };

        setItems(prev => [...prev, newTemplate]);
        setIsCreatingTemplate(false);
        form.reset();

        toast.custom(
          (t) => (
            <Alert
              variant="mono"
              icon="success"
              onClose={() => toast.dismiss(t)}
            >
              <AlertIcon>
                <RiCheckboxCircleFill />
              </AlertIcon>
              <AlertTitle>Template created successfully!</AlertTitle>
            </Alert>
          ),
          {
            duration: 5000,
          }
        );
      } else {
        toast.error(result.error || 'Failed to create template');
      }
    } catch (error) {
      toast.error('Failed to create template');
    }
  };

  const handleDeleteTemplate = async (index: number) => {
    const templateToDelete = items[index];
    
    if (!templateToDelete.id) {
      toast.error('Template ID is missing');
      return;
    }

    try {
      const result = await deleteTemplate(templateToDelete.id);

      if (result.success) {
        setItems(prev => prev.filter((_, i) => i !== index));
        
        toast.custom(
          (t) => (
            <Alert
              variant="mono"
              icon="success"
              onClose={() => toast.dismiss(t)}
            >
              <AlertIcon>
                <RiCheckboxCircleFill />
              </AlertIcon>
              <AlertTitle>Template deleted successfully!</AlertTitle>
            </Alert>
          ),
          {
            duration: 5000,
          }
        );
      } else {
        toast.error(result.error || 'Failed to delete template');
      }
    } catch (error) {
      toast.error('Failed to delete template');
    }
  };

  const updateFieldConfig = (index: number, field: keyof FieldConfig, value: any) => {
    setFieldConfigs(prev => prev.map((config, i) => 
      i === index ? { ...config, [field]: value } : config
    ));
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const renderTemplateCard = (item: ITemplateItem, index: number) => (
    <Card key={index} className="hover:shadow-lg transition-all duration-200 group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-lg font-semibold">{item.title}</CardTitle>
              <p className="text-sm text-muted-foreground">{item.department}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge 
              variant={item.status === 'Active' ? 'success' : item.status === 'Draft' ? 'warning' : 'secondary'}
              className="text-xs"
            >
              {item.status}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDeleteTemplate(index)}
              disabled={isDeleting}
              className="text-destructive hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <RiDeleteBin6Line className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{item.description}</p>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-muted-foreground">
              <Settings className="h-3 w-3" />
              {item.fields} fields
            </span>
            <span className="text-muted-foreground">
              Last used: {item.lastUsed}
            </span>
          </div>
          {item.default && (
            <Badge variant="mono" className="text-xs">
              Default
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const renderTemplateList = (item: ITemplateItem, index: number) => (
    <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors group">
      <div className="flex items-center gap-4">
        <div className="p-2 bg-primary/10 rounded-lg">
          <FileText className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold">{item.title}</h3>
          <p className="text-sm text-muted-foreground">{item.department}</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <Badge variant={item.status === 'Active' ? 'success' : 'secondary'}>
          {item.status}
        </Badge>
        <span className="text-sm text-muted-foreground">{item.fields} fields</span>
        <span className="text-sm text-muted-foreground">Last used: {item.lastUsed}</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleDeleteTemplate(index)}
          disabled={isDeleting}
          className="text-destructive hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <RiDeleteBin6Line className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  if (isCreatingTemplate) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCreatingTemplate(false)}
              className="gap-2"
            >
              <RiArrowLeftLine className="h-4 w-4" />
              Back to Templates
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <div>
              <h1 className="text-2xl font-bold">Create New Template</h1>
              <p className="text-muted-foreground">Define the structure for your document extraction</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
              className="gap-2"
            >
              <RiSettings3Line className="h-4 w-4" />
              Advanced Settings
            </Button>
          </div>
        </div>

        {/* Advanced Settings Panel */}
        {showAdvancedSettings && (
          <Card className="border-l-4 border-l-primary">
            <CardHeader>
              <CardTitle className="text-lg">Advanced Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Template Visibility</Label>
                    <RadioGroup value={templateVisibility} onValueChange={(value: 'public' | 'private') => setTemplateVisibility(value)}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="public" id="public" />
                        <Label htmlFor="public" className="text-sm">Public</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="private" id="private" />
                        <Label htmlFor="private" className="text-sm">Private</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Auto Save</Label>
                    <Switch checked={autoSave} onCheckedChange={setAutoSave} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Enable Validation</Label>
                    <Switch checked={enableValidation} onCheckedChange={setEnableValidation} />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-medium text-sm">Field Configuration</h4>
                  <div className="space-y-3">
                    {fieldConfigs.map((config, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium capitalize">{config.name}</span>
                          <Badge variant="secondary" className="text-xs">{config.type}</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => updateFieldConfig(index, 'required', !config.required)}
                                  className={config.required ? 'text-primary' : 'text-muted-foreground'}
                                >
                                  {config.required ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                {config.required ? 'Required' : 'Optional'}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => updateFieldConfig(index, 'visible', !config.visible)}
                                  className={config.visible ? 'text-primary' : 'text-muted-foreground'}
                                >
                                  {config.visible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                {config.visible ? 'Visible' : 'Hidden'}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Form */}
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RiAddLine className="h-5 w-5" />
              Template Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(handleCreateTemplate)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="title">Template Title</Label>
                      <Badge variant="secondary" className="text-xs">Required</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch 
                        checked={fieldConfigs[0]?.required} 
                        onCheckedChange={(checked) => updateFieldConfig(0, 'required', checked)}
                        size="sm"
                      />
                      <span className="text-xs text-muted-foreground">Required</span>
                    </div>
                  </div>
                  <Input
                    id="title"
                    {...form.register('title')}
                    placeholder="e.g., Invoice Template, Receipt Template"
                    className="h-11"
                  />
                  {form.formState.errors.title && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.title.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="department">Department</Label>
                      <Badge variant="secondary" className="text-xs">Required</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch 
                        checked={fieldConfigs[1]?.required} 
                        onCheckedChange={(checked) => updateFieldConfig(1, 'required', checked)}
                        size="sm"
                      />
                      <span className="text-xs text-muted-foreground">Required</span>
                    </div>
                  </div>
                  <Input
                    id="department"
                    {...form.register('department')}
                    placeholder="e.g., Finance, HR, Operations"
                    className="h-11"
                  />
                  {form.formState.errors.department && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.department.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="fields">Number of Fields</Label>
                      <Badge variant="secondary" className="text-xs">Required</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch 
                        checked={fieldConfigs[2]?.required} 
                        onCheckedChange={(checked) => updateFieldConfig(2, 'required', checked)}
                        size="sm"
                      />
                      <span className="text-xs text-muted-foreground">Required</span>
                    </div>
                  </div>
                  <Input
                    id="fields"
                    type="number"
                    {...form.register('fields', { valueAsNumber: true })}
                    placeholder="Enter number of fields"
                    className="h-11"
                  />
                  {form.formState.errors.fields && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.fields.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="status">Status</Label>
                      <Badge variant="secondary" className="text-xs">Required</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch 
                        checked={fieldConfigs[5]?.required} 
                        onCheckedChange={(checked) => updateFieldConfig(5, 'required', checked)}
                        size="sm"
                      />
                      <span className="text-xs text-muted-foreground">Required</span>
                    </div>
                  </div>
                  <Select
                    onValueChange={(value) => form.setValue('status', value)}
                    defaultValue={form.getValues('status')}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                      <SelectItem value="Draft">Draft</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.status && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.status.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Badge variant="secondary" className="text-xs">Required</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch 
                      checked={fieldConfigs[3]?.required} 
                      onCheckedChange={(checked) => updateFieldConfig(3, 'required', checked)}
                      size="sm"
                    />
                    <span className="text-xs text-muted-foreground">Required</span>
                  </div>
                </div>
                <Textarea
                  id="description"
                  {...form.register('description')}
                  placeholder="Describe what this template is used for and what kind of documents it processes..."
                  rows={4}
                  className="resize-none"
                />
                {form.formState.errors.description && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.description.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="lastUsed">Last Used Date</Label>
                    <Badge variant="secondary" className="text-xs">Required</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch 
                      checked={fieldConfigs[4]?.required} 
                      onCheckedChange={(checked) => updateFieldConfig(4, 'required', checked)}
                      size="sm"
                    />
                    <span className="text-xs text-muted-foreground">Required</span>
                  </div>
                </div>
                <Input
                  id="lastUsed"
                  type="date"
                  {...form.register('lastUsed')}
                  className="h-11"
                />
                {form.formState.errors.lastUsed && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.lastUsed.message}
                  </p>
                )}
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreatingTemplate(false)}
                  >
                    Cancel
                  </Button>
                </div>
                <Button type="submit" disabled={isCreating} className="gap-2">
                  <RiSaveLine className="h-4 w-4" />
                  {isCreating ? 'Creating...' : 'Create Template'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Template Management</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage extraction templates for document processing
          </p>
        </div>
        <Button 
          onClick={() => setIsCreatingTemplate(true)}
          className="gap-2 h-11 px-6"
        >
          <Plus className="h-4 w-4" />
          Create Template
        </Button>
      </div>

      {/* Filters and Controls */}
      <Card>
        <CardContent className="p-6">
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
                <SelectTrigger className="w-40">
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
                variant={viewMode === 'grid' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Templates Display */}
      {filteredItems.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="p-4 bg-muted rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Settings className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {searchTerm || statusFilter !== 'all' ? 'No templates found' : 'No Templates Available'}
            </h3>
            <p className="text-muted-foreground mb-6 text-center max-w-md">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : 'Create your first template to get started with document extraction.'
              }
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <Button onClick={() => setIsCreatingTemplate(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Create Your First Template
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className={viewMode === 'grid' 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
          : "space-y-3"
        }>
          {filteredItems.map((item, index) => 
            viewMode === 'grid' 
              ? renderTemplateCard(item, index)
              : renderTemplateList(item, index)
          )}
        </div>
      )}

      {/* Stats */}
      {filteredItems.length > 0 && (
        <Card className="bg-muted/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Showing {filteredItems.length} of {items.length} templates</span>
              <span>Total fields: {filteredItems.reduce((sum, item) => sum + item.fields, 0)}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
