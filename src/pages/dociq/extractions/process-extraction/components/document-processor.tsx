'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { FileText, CheckCircle, Clock, Zap } from 'lucide-react';
import { useProcessingContext } from '../../context/processing-context';
import { Button } from '@/components/ui/button';

interface ProcessingStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'processing' | 'completed';
  icon: React.ComponentType<{ className?: string }>;
}

export function DocumentProcessor() {
  const { processingState, updateProgress, updateCurrentStep, updateTimeElapsed, updateEstimatedTime, updateStatus } = useProcessingContext();
  const { progress, currentStep, status } = processingState;
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isProcessingRef = useRef(false);
  const currentProgressRef = useRef(progress);
  const currentStepRef = useRef(currentStep);
  const [error, setError] = useState<string | null>(null);

  // Update refs when state changes
  useEffect(() => {
    currentProgressRef.current = progress;
    currentStepRef.current = currentStep;
  }, [progress, currentStep]);

  // Error recovery function
  const handleError = useCallback((errorMessage: string) => {
    console.error('DocumentProcessor error:', errorMessage);
    setError(errorMessage);
    
    // Clean up any running intervals
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    isProcessingRef.current = false;
    
    // Reset to a safe state
    updateStatus('pending');
  }, [updateStatus]);

  // Clear error when status changes
  useEffect(() => {
    if (error && status === 'processing') {
      setError(null);
    }
  }, [status, error]);

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

  // Update progress based on actual mapping status
  useEffect(() => {
    
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (status === 'processing' && !isProcessingRef.current) {
      isProcessingRef.current = true;
      
      // Start with 25% when processing begins
      if (currentProgressRef.current < 25) {
        updateProgress(25);
        updateCurrentStep(1);
      }
      
      // Simulate progress to 100% over 3 seconds
      intervalRef.current = setInterval(() => {
        try {
          const currentProgress = currentProgressRef.current;
          const currentStepValue = currentStepRef.current;
          
          if (currentProgress >= 100) {
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
            isProcessingRef.current = false;
            return;
          }
          
          const newProgress = Math.min(currentProgress + 15, 100);
          updateProgress(newProgress);
          
          // Update steps based on progress
          if (newProgress >= 50 && currentStepValue === 1) {
            updateCurrentStep(2);
          } else if (newProgress >= 75 && currentStepValue === 2) {
            updateCurrentStep(3);
          }
          
          // Update time elapsed
          updateTimeElapsed(Math.floor(newProgress / 10));
          updateEstimatedTime(Math.max(1, Math.floor((100 - newProgress) / 10)));
        } catch (error) {
          console.error('Error in progress simulation:', error);
          handleError('Progress simulation failed. Please try again.');
        }
      }, 500);
    } else if (status === 'completed') {
      // Set to 100% when completed
      updateProgress(100);
      updateCurrentStep(3);
      isProcessingRef.current = false;
    } else if (status === 'pending') {
      // Reset when pending
      isProcessingRef.current = false;
    }

    // Cleanup function
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      isProcessingRef.current = false;
    };
  }, [status, updateProgress, updateCurrentStep, updateTimeElapsed, updateEstimatedTime, updateStatus, handleError]);

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
      {/* Error Display */}
      {error && (
        <Card className="bg-red-50 border-red-200">
          <CardHeader className="px-5">
            <CardTitle className="text-sm text-red-800">Processing Error</CardTitle>
          </CardHeader>
          <CardContent className="px-5">
            <p className="text-sm text-red-700 mb-3">{error}</p>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => {
                setError(null);
                updateStatus('processing');
              }}
            >
              Retry Processing
            </Button>
          </CardContent>
        </Card>
      )}

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