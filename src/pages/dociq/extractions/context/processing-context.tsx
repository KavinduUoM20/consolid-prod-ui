import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

interface ProcessingState {
  progress: number;
  currentStep: number;
  timeElapsed: number;
  estimatedTime: number;
  stepsCompleted: number;
  totalSteps: number;
  status: 'processing' | 'completed' | 'pending';
}

interface ProcessingContextType {
  processingState: ProcessingState;
  updateProgress: (progress: number) => void;
  updateCurrentStep: (step: number) => void;
  updateTimeElapsed: (time: number) => void;
  updateEstimatedTime: (time: number) => void;
  updateStatus: (status: ProcessingState['status']) => void;
  resetProcessing: () => void;
}

const ProcessingContext = createContext<ProcessingContextType | undefined>(undefined);

interface ProcessingProviderProps {
  children: ReactNode;
}

export function ProcessingProvider({ children }: ProcessingProviderProps) {
  const [processingState, setProcessingState] = useState<ProcessingState>({
    progress: 0,
    currentStep: 0,
    timeElapsed: 0,
    estimatedTime: 20,
    stepsCompleted: 1,
    totalSteps: 4,
    status: 'pending',
  });

  const updateProgress = useCallback((progress: number) => {
    setProcessingState(prev => ({
      ...prev,
      progress: Math.min(progress, 100),
      status: progress >= 100 ? 'completed' : 'processing',
    }));
  }, []);

  const updateCurrentStep = useCallback((step: number) => {
    setProcessingState(prev => ({
      ...prev,
      currentStep: step,
      stepsCompleted: step + 1,
    }));
  }, []);

  const updateTimeElapsed = useCallback((time: number) => {
    setProcessingState(prev => ({
      ...prev,
      timeElapsed: time,
    }));
  }, []);

  const updateEstimatedTime = useCallback((time: number) => {
    setProcessingState(prev => ({
      ...prev,
      estimatedTime: time,
    }));
  }, []);

  const updateStatus = useCallback((status: ProcessingState['status']) => {
    setProcessingState(prev => ({
      ...prev,
      status,
    }));
  }, []);

  const resetProcessing = useCallback(() => {
    setProcessingState({
      progress: 0,
      currentStep: 0,
      timeElapsed: 0,
      estimatedTime: 20,
      stepsCompleted: 1,
      totalSteps: 4,
      status: 'pending',
    });
  }, []);

  return (
    <ProcessingContext.Provider
      value={{
        processingState,
        updateProgress,
        updateCurrentStep,
        updateTimeElapsed,
        updateEstimatedTime,
        updateStatus,
        resetProcessing,
      }}
    >
      {children}
    </ProcessingContext.Provider>
  );
}

export function useProcessingContext() {
  const context = useContext(ProcessingContext);
  if (context === undefined) {
    throw new Error('useProcessingContext must be used within a ProcessingProvider');
  }
  return context;
} 