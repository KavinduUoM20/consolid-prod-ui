'use client';

import { Fragment, useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogBody, DialogClose } from '@/components/ui/dialog';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { templateSchema, TemplateFormValues } from './forms';
import { TemplateDialog } from './template-dialog';
import { Alert, AlertIcon, AlertTitle } from '@/components/ui/alert';
import { RiCheckboxCircleFill } from '@remixicon/react';
import { toast } from 'sonner';
import { useTemplateContext, TemplateDetails } from '../../context/template-context';

interface ITemplateItem {
  default: boolean;
  title: string;
  department: string;
  fields: number;
  description: string;
  lastUsed: string;
  status: string;
  badge?: boolean;
}

export function Info() {
  const { selectedTemplate, setSelectedTemplate } = useTemplateContext();
  
  const [items, setItems] = useState<ITemplateItem[]>([
    {
      default: true,
      title: 'Raw Material Template',
      department: 'Procurement',
      fields: 6,
      description: 'Template for extracting raw material purchase data from invoices',
      lastUsed: '2 days ago',
      status: 'Active',
      badge: true,
    },
    {
      default: false,
      title: 'Invoice Processing Template',
      department: 'Finance',
      fields: 8,
      description: 'Standard template for processing vendor invoices',
      lastUsed: '1 week ago',
      status: 'Active',
      badge: false,
    },
    {
      default: false,
      title: 'Expense Report Template',
      department: 'HR',
      fields: 4,
      description: 'Template for employee expense report processing',
      lastUsed: '3 days ago',
      status: 'Draft',
      badge: false,
    },
    {
      default: false,
      title: 'Contract Analysis Template',
      department: 'Legal',
      fields: 12,
      description: 'Template for extracting key terms from legal contracts',
      lastUsed: '2 weeks ago',
      status: 'Active',
      badge: false,
    },
  ]);

  // Dialog state
  const [editOpen, setEditOpen] = useState<number|null>(null); 
  const [removeOpen, setRemoveOpen] = useState<number|null>(null); 

  // react-hook-form for editing
  const form = useForm<TemplateFormValues>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      title: '',
      department: '',
      fields: 0,
      description: '',
      lastUsed: '',
      status: '',
    },
    mode: 'onChange',
  });

  // Reset form values when editOpen changes
  useEffect(() => {
    if (editOpen !== null) {
      const item = items[editOpen];
      form.reset({
        title: item?.title || '',
        department: item?.department || '',
        fields: item?.fields || 0,
        description: item?.description || '',
        lastUsed: item?.lastUsed || '',
        status: item?.status || '',
      });
    }
  }, [editOpen, items, form]);


  // Handle edit submit
  function handleEditSubmit(data: TemplateFormValues) {
    if (editOpen === null) return;
    setItems((prev: ITemplateItem[]) =>
      prev.map((item: ITemplateItem, i: number) =>
        i === editOpen
          ? {
              ...item,
              ...data,
            }
          : item
      )
    );
    setEditOpen(null);
  }

  // Remove template
  function handleRemove(idx: number) {
    setItems((prev: ITemplateItem[]) => prev.filter((_, i: number) => i !== idx));
    setRemoveOpen(null);
  };

  const renderItem = (item: ITemplateItem, index: number) => (
    <Card key={index}>
      <CardHeader className="px-5">
        <CardTitle>{item.title}</CardTitle>
        {item.default && (
          <Badge variant="success" appearance="outline">
            Selected Template
          </Badge>
        )}
      </CardHeader>

      <CardContent className="px-5 space-y-4">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-mono">
              Department: {item.department}
            </span>
            <span className="text-sm font-medium text-mono">
              Fields: {item.fields}
            </span>
          </div>

          <div className="flex flex-col gap-2 text-sm font-normal text-mono">
            <span className="text-secondary-foreground">{item.description}</span>
            <span>Last Used: {item.lastUsed}</span>
            <span>Status: {item.status}</span>
          </div>
        </div>

        <div className="flex justify-between items-center min-h-8.5">
          <div className="flex items-center gap-5">
            {/* Edit Dialog */}
            <TemplateDialog
              open={editOpen === index}
              onOpenChange={val => setEditOpen(val ? index : null)}
              initialValues={item}
              onSubmit={handleEditSubmit}
              title="Edit Template"
              description="Update the template details below."
              submitLabel="Update Template"
              trigger={
                <Button mode="link" underlined="dashed">
                  Edit
                </Button>
              }
            />

            {/* Remove Dialog */}
            <Dialog open={removeOpen === index} onOpenChange={open => open ? setRemoveOpen(index) : setRemoveOpen(null)}>
              <DialogTrigger asChild>
                <Button mode="link" underlined="dashed">
                  Remove
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Remove Template</DialogTitle>
                </DialogHeader>
                <DialogBody className="text-sm">
                  Are you sure you want to remove this template? This action cannot be undone.
                </DialogBody>
                <DialogFooter>
                  <Button variant="destructive" onClick={() => handleRemove(index)}>
                    Yes, Remove
                  </Button>
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {item.default === false && (
            <Button size="sm" variant="outline" onClick={() => handleSelect(index)}>
              Select Template
            </Button>
          )}

        </div>
      </CardContent>
    </Card>
  );

  // Handle Select Template
  const handleSelect = (idx: number) => {
    const selectedItem = items[idx];
    
    // Update items state
    setItems(prev => prev.map((item, i) => ({
      ...item,
      default: i === idx,
      badge: i === idx,
    })));

    // Save selected template to localStorage
    const templateDetails: TemplateDetails = {
      title: selectedItem.title,
      department: selectedItem.department,
      fields: selectedItem.fields,
      description: selectedItem.description,
      lastUsed: selectedItem.lastUsed,
      status: selectedItem.status,
      isDefault: true,
    };
    setSelectedTemplate(templateDetails);

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
          <AlertTitle>Template selected!</AlertTitle>
        </Alert>
      ),
      {
        duration: 5000,
      }
    );
  };

  return (
    <Fragment>
      {items.map((item, index) => {
        return renderItem(item, index);
      })}
    </Fragment>
  );
}

