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

  // Field mapping state
  const [fieldMappings, setFieldMappings] = useState<FieldMapping[]>([
    { id: '1', plmField: '', similarFieldNames: [], sampleValues: [], description: '' }
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
  });

  const handleCreateTemplate = async (data: TemplateFormValues) => {
    try {
      // Map form data to API request body structure
      const requestBody = {
        name: data.title,
        type: "pdf",
        category: data.department,
        description: data.description,
        field_mappings: fieldMappings.map(mapping => ({
          target_field: mapping.plmField,
          sample_field_names: mapping.similarFieldNames,
          value_patterns: mapping.sampleValues,
          required: true
        }))
      };

      // Send request to the API endpoint
      const response = await fetch('https://api.consolidator-ai.site/api/v1/dociq/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add any required authentication headers here
          // 'Authorization': 'Bearer your-token'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      toast.success('Template created successfully!');
      setIsCreatingTemplate(false);
      form.reset();
      setFieldMappings([{ id: '1', plmField: '', similarFieldNames: [], sampleValues: [], description: '' }]);
    } catch (error) {
      console.error('Error creating template:', error);
      toast.error('Failed to create template. Please try again.');
    }
  };

  const handleDeleteTemplate = async (index: number) => {
    const template = items[index];
    if (!template?.id) {
      toast.error('Cannot delete template without ID');
      return;
    }

    try {
      await deleteTemplate(template.id);
      toast.success('Template deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete template. Please try again.');
    }
  };

  const handleEditTemplate = (template: ITemplateItem) => {
    // TODO: Implement edit functionality
    toast.info('Edit functionality coming soon!');
  };

  const updateFieldConfig = (index: number, field: keyof FieldConfig, value: any) => {
    setFieldConfigs(prev => prev.map((config, i) => 
      i === index ? { ...config, [field]: value } : config
    ));
  };

  // Field mapping functions
  const addFieldMapping = () => {
    const newId = (fieldMappings.length + 1).toString();
    setFieldMappings(prev => [...prev, { id: newId, plmField: '', similarFieldNames: [], sampleValues: [], description: '' }]);
  };

  const removeFieldMapping = (id: string) => {
    if (fieldMappings.length > 1) {
      setFieldMappings(prev => prev.filter(mapping => mapping.id !== id));
    }
  };

  const updateFieldMapping = (id: string, field: keyof FieldMapping, value: any) => {
    setFieldMappings(prev => prev.map(mapping => 
      mapping.id === id ? { ...mapping, [field]: value } : mapping
    ));
  };

  const addSimilarFieldName = (mappingId: string, value: string) => {
    if (value.trim()) {
      setFieldMappings(prev => prev.map(mapping => 
        mapping.id === mappingId 
          ? { ...mapping, similarFieldNames: [...mapping.similarFieldNames, value.trim()] }
          : mapping
      ));
    }
  };

  const removeSimilarFieldName = (mappingId: string, fieldIndex: number) => {
    setFieldMappings(prev => prev.map(mapping => 
      mapping.id === mappingId 
        ? { ...mapping, similarFieldNames: mapping.similarFieldNames.filter((_, index) => index !== fieldIndex) }
        : mapping
    ));
  };

  const addSampleValue = (mappingId: string, value: string) => {
    if (value.trim()) {
      setFieldMappings(prev => prev.map(mapping => 
        mapping.id === mappingId 
          ? { ...mapping, sampleValues: [...mapping.sampleValues, value.trim()] }
          : mapping
      ));
    }
  };

  const removeSampleValue = (mappingId: string, valueIndex: number) => {
    setFieldMappings(prev => prev.map(mapping => 
      mapping.id === mappingId 
        ? { ...mapping, sampleValues: mapping.sampleValues.filter((_, index) => index !== valueIndex) }
        : mapping
    ));
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const renderTemplateCard = (item: ITemplateItem, index: number) => (
    <Card key={index} className="hover:shadow-lg transition-all duration-200 group relative">
      {/* Status and Default Badges - Top Right */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        {item.default && (
          <Badge variant="mono" size="sm" className="shadow-sm">
            Default
          </Badge>
        )}
        <Badge 
          variant={item.status === 'Active' ? 'success' : item.status === 'Draft' ? 'warning' : 'secondary'}
          size="sm"
          className="shadow-sm"
        >
          {item.status}
        </Badge>
      </div>

      <CardHeader className="py-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1">
            <div className="p-2.5 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base font-semibold leading-none tracking-tight">{item.title}</CardTitle>
              <p className="text-sm text-secondary-foreground mt-1">{item.department}</p>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <p className="text-sm text-secondary-foreground mb-4 line-clamp-2">{item.description}</p>
        
        {/* Action Buttons - Bottom */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1.5 text-secondary-foreground">
              <Settings className="h-3.5 w-3.5" />
              {item.fields} fields
            </span>
            <span className="text-secondary-foreground">
              Last used: {item.lastUsed}
            </span>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditTemplate(item)}
                    className="h-8 w-8 p-0"
                  >
                    <Edit3 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Edit template</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteTemplate(index)}
                    disabled={isDeleting}
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  >
                    <RiDeleteBin6Line className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Delete template</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderTemplateList = (item: ITemplateItem, index: number) => (
    <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors group">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="p-2 bg-primary/10 rounded-lg shrink-0">
          <FileText className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm leading-none tracking-tight">{item.title}</h3>
          <p className="text-sm text-secondary-foreground mt-1">{item.department}</p>
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <Badge variant={item.status === 'Active' ? 'success' : 'secondary'} size="sm">
          {item.status}
        </Badge>
        <span className="text-sm text-secondary-foreground">{item.fields} fields</span>
        <span className="text-sm text-secondary-foreground">Last used: {item.lastUsed}</span>
        
        {/* Action Buttons */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEditTemplate(item)}
                  className="h-8 w-8 p-0"
                >
                  <Edit3 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Edit template</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteTemplate(index)}
                  disabled={isDeleting}
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                >
                  <RiDeleteBin6Line className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Delete template</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
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
              <h1 className="text-xl font-semibold text-mono">Create New Template</h1>
              <p className="text-sm text-secondary-foreground">Define the structure for your document extraction</p>
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

        {/* Main Content - 70/30 Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
          {/* Field Mapping Section - 70% */}
          <div className="lg:col-span-7">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Field Mapping Configuration
                </CardTitle>
                <p className="text-sm text-secondary-foreground">
                  Map PLM fields to vendor fields and define sample values for extraction
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Field Mapping Rows */}
                {fieldMappings.map((mapping, index) => (
                  <div key={mapping.id} className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-sm">Field Mapping {index + 1}</h4>
                      {fieldMappings.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFieldMapping(mapping.id)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      {/* PLM Field */}
                      <div className="space-y-1">
                        <Label className="text-xs font-medium">PLM Field</Label>
                        <Input
                          placeholder="PLM field"
                          value={mapping.plmField}
                          onChange={(e) => updateFieldMapping(mapping.id, 'plmField', e.target.value)}
                          className="h-8 text-sm"
                        />
                      </div>

                      {/* Similar Field Names */}
                      <div className="space-y-1">
                        <Label className="text-xs font-medium">Similar Field Names</Label>
                        <div className="space-y-1">
                          <div className="relative">
                            <Input
                              placeholder="Add similar field"
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  addSimilarFieldName(mapping.id, e.currentTarget.value);
                                  e.currentTarget.value = '';
                                }
                              }}
                              className="h-8 text-sm pr-8"
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                                addSimilarFieldName(mapping.id, input.value);
                                input.value = '';
                              }}
                              className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0 bg-primary text-primary-foreground hover:bg-primary/90"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <div className="flex flex-wrap gap-1 max-h-12 overflow-y-auto">
                            {mapping.similarFieldNames.map((field, fieldIndex) => (
                              <Badge key={fieldIndex} variant="secondary" size="sm" className="gap-1 text-xs">
                                {field}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeSimilarFieldName(mapping.id, fieldIndex)}
                                  className="h-3 w-3 p-0 hover:bg-transparent"
                                >
                                  <X className="h-2 w-2" />
                                </Button>
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Sample Values */}
                      <div className="space-y-1">
                        <Label className="text-xs font-medium">Sample Values</Label>
                        <div className="space-y-1">
                          <div className="relative">
                            <Input
                              placeholder="Add sample value"
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  addSampleValue(mapping.id, e.currentTarget.value);
                                  e.currentTarget.value = '';
                                }
                              }}
                              className="h-8 text-sm pr-8"
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                                addSampleValue(mapping.id, input.value);
                                input.value = '';
                              }}
                              className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0 bg-primary text-primary-foreground hover:bg-primary/90"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <div className="flex flex-wrap gap-1 max-h-12 overflow-y-auto">
                            {mapping.sampleValues.map((value, valueIndex) => (
                              <Badge key={valueIndex} variant="secondary" size="sm" className="gap-1 text-xs">
                                {value}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeSampleValue(mapping.id, valueIndex)}
                                  className="h-3 w-3 p-0 hover:bg-transparent"
                                >
                                  <X className="h-2 w-2" />
                                </Button>
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      <div className="space-y-1">
                        <Label className="text-xs font-medium">Description</Label>
                        <Input
                          placeholder="Description"
                          value={mapping.description}
                          onChange={(e) => updateFieldMapping(mapping.id, 'description', e.target.value)}
                          className="h-8 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {/* Add New Field Mapping Button */}
                <Button
                  variant="secondary"
                  onClick={addFieldMapping}
                  className="w-full gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Field Mapping
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Template Details Section - 30% */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RiAddLine className="h-5 w-5" />
                  Template Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={form.handleSubmit(handleCreateTemplate)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Template Title</Label>
                    <Input
                      id="title"
                      {...form.register('title')}
                      placeholder="e.g., Invoice Template"
                    />
                    {form.formState.errors.title && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.title.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Input
                      id="department"
                      {...form.register('department')}
                      placeholder="e.g., Finance, HR"
                    />
                    {form.formState.errors.department && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.department.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      {...form.register('description')}
                      placeholder="Describe what this template is used for..."
                      rows={3}
                      className="resize-none"
                    />
                    {form.formState.errors.description && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.description.message}
                      </p>
                    )}
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsCreatingTemplate(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isCreating} className="gap-2">
                      <RiSaveLine className="h-4 w-4" />
                      {isCreating ? 'Creating...' : 'Create Template'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-mono">Template Management</h1>
          <p className="text-sm text-secondary-foreground mt-1">
            Create and manage extraction templates for document processing
          </p>
        </div>
        <Button 
          onClick={() => setIsCreatingTemplate(true)}
          className="gap-2"
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
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
