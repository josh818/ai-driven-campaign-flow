import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface ContentGenerationModalProps {
  isOpen: boolean;
  progress: number;
  currentStep: string;
  totalSteps: number;
  completedSteps: number;
  errors: string[];
}

const ContentGenerationModal = ({ 
  isOpen, 
  progress, 
  currentStep, 
  totalSteps, 
  completedSteps, 
  errors 
}: ContentGenerationModalProps) => {
  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
            <span>Generating Professional Content</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{completedSteps} of {totalSteps} complete</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
              <span className="text-sm text-gray-600">{currentStep}</span>
            </div>
          </div>
          
          {completedSteps > 0 && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-600">
                  {completedSteps} content piece{completedSteps !== 1 ? 's' : ''} generated successfully
                </span>
              </div>
            </div>
          )}
          
          {errors.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-amber-500" />
                <span className="text-sm text-amber-600">
                  {errors.length} issue{errors.length !== 1 ? 's' : ''} encountered (content will still be created)
                </span>
              </div>
            </div>
          )}
          
          <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
            <p className="font-medium mb-1">Please wait while we create your content:</p>
            <ul className="space-y-1">
              <li>• AI-powered copywriting for each platform</li>
              <li>• Professional image generation</li>
              <li>• Video concepts and scripts</li>
              <li>• Email campaign content</li>
            </ul>
            <p className="mt-2 font-medium">This process typically takes 1-2 minutes.</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ContentGenerationModal;