'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { FileText, CheckCircle, Clock, Zap } from 'lucide-react';
import { useProcessingContext } from '../../context/processing-context';

interface ProcessingStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'processing' | 'completed';
  icon: React.ComponentType<{ className?: string }>;
}

export function DocumentProcessor() {
  const { processingState, updateProgress, updateCurrentStep, updateTimeElapsed, updateEstimatedTime } = useProcessingContext();
  const { progress, currentStep } = processingState;

  const processingSteps: ProcessingStep[] = [
    {
      id: 'upload',
      title: 'Document Upload',
      description: 'Validating document format and size',
      status: 'completed',
      icon: FileText,
    },
    {
      id: 'analysis',
      title: 'Document Analysis',
      description: 'Analyzing document structure and content',
      status: 'processing',
      icon: Zap,
    },
    {
      id: 'extraction',
      title: 'Data Extraction',
      description: 'Extracting relevant information from document',
      status: 'pending',
      icon: CheckCircle,
    },
    {
      id: 'validation',
      title: 'Data Validation',
      description: 'Validating extracted data accuracy',
      status: 'pending',
      icon: Clock,
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      if (progress >= 100) {
        clearInterval(interval);
        return;
      }
      
      // Simulate realistic progress based on mapping status
      let progressIncrement = 1;
      
      // If we're in the early stages, progress slower
      if (progress < 30) {
        progressIncrement = 0.5;
      } else if (progress < 70) {
        progressIncrement = 1.5;
      } else {
        progressIncrement = 2;
      }
      
      const newProgress = progress + progressIncrement;
      const finalProgress = Math.min(newProgress, 100);
      
      updateProgress(finalProgress);
      
      // Update current step based on progress
      if (finalProgress >= 25 && currentStep === 0) {
        updateCurrentStep(1);
      } else if (finalProgress >= 50 && currentStep === 1) {
        updateCurrentStep(2);
      } else if (finalProgress >= 75 && currentStep === 2) {
        updateCurrentStep(3);
      }
      
      // Update time elapsed
      updateTimeElapsed(Math.floor(finalProgress / 10));
      
      // Update estimated time
      updateEstimatedTime(Math.max(1, Math.floor((100 - finalProgress) / 10)));
    }, 500); // Slower interval for more realistic progress

    return () => clearInterval(interval);
  }, [progress, currentStep, updateProgress, updateCurrentStep, updateTimeElapsed, updateEstimatedTime]);

  const getStepStatus = (index: number): ProcessingStep['status'] => {
    if (index < currentStep) return 'completed';
    if (index === currentStep) return 'processing';
    return 'pending';
  };

  const getStatusColor = (status: ProcessingStep['status']) => {
    switch (status) {
      case 'completed':
        return 'text-green-500';
      case 'processing':
        return 'text-blue-500';
      case 'pending':
        return 'text-muted-foreground';
    }
  };

  const getStatusBadge = (status: ProcessingStep['status']) => {
    switch (status) {
      case 'completed':
        return <Badge variant="success" appearance="outline">Completed</Badge>;
      case 'processing':
        return <Badge variant="primary" appearance="outline">Processing</Badge>;
      case 'pending':
        return <Badge variant="secondary" appearance="outline">Pending</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <Card className="bg-accent/50">
        <CardHeader className="px-5">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Document Processing</CardTitle>
            <Badge variant="primary" appearance="outline">
              {Math.round(progress)}% Complete
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="px-5 space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Processing Progress</span>
              <span className="font-medium text-mono">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
          
          <div className="text-sm text-muted-foreground">
            {progress < 25 && "Uploading and validating document..."}
            {progress >= 25 && progress < 50 && "Analyzing document structure..."}
            {progress >= 50 && progress < 75 && "Extracting data from document..."}
            {progress >= 75 && progress < 100 && "Validating extracted information..."}
            {progress >= 100 && "Processing completed successfully!"}
          </div>
        </CardContent>
      </Card>

      {/* Processing Steps */}
      <Card>
        <CardHeader className="px-5">
          <CardTitle>Processing Steps</CardTitle>
        </CardHeader>
        <CardContent className="px-5 space-y-4">
          {processingSteps.map((step, index) => {
            const status = getStepStatus(index);
            const Icon = step.icon;
            
            return (
              <div key={step.id} className="flex items-center gap-4 p-3 rounded-lg border border-border">
                <div className={`flex-shrink-0 ${getStatusColor(status)}`}>
                  <Icon className="size-5" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-medium text-foreground">
                      {step.title}
                    </h4>
                    {getStatusBadge(status)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>


    </div>
  );
} 