import React from 'react';
import type { ModulePerformanceProps } from './types';

const ModulePerformance: React.FC<ModulePerformanceProps> = ({
  averageSubmissionRate,
  averageResponseRate,
  completionRate,
  activeTeachersRate,
}) => {
  const getPerformanceColor = (rate: number) => {
    if (rate >= 90) return 'text-green-600';
    if (rate >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressBarColor = (rate: number) => {
    if (rate >= 90) return 'bg-green-600';
    if (rate >= 75) return 'bg-yellow-600';
    return 'bg-red-600';
  };

  const getProgressBarWidth = (rate: number) => {
    const clampedRate = Math.min(Math.max(rate, 0), 100);
    if (clampedRate >= 95) return 'w-full';
    if (clampedRate >= 90) return 'w-11/12';
    if (clampedRate >= 80) return 'w-4/5';
    if (clampedRate >= 75) return 'w-3/4';
    if (clampedRate >= 66) return 'w-2/3';
    if (clampedRate >= 50) return 'w-1/2';
    if (clampedRate >= 33) return 'w-1/3';
    if (clampedRate >= 25) return 'w-1/4';
    if (clampedRate >= 10) return 'w-1/12';
    return 'w-1';
  };

  const ProgressBar: React.FC<{ rate: number; color: string }> = ({ rate, color }) => (
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div className={`${color} ${getProgressBarWidth(rate)} h-2 rounded-full transition-all duration-300`} />
    </div>
  );

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Module Performance</h3>
      <div className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Average Submission Rate</span>
            <span className={`text-sm font-bold ${getPerformanceColor(averageSubmissionRate)}`}>
              {Math.round(averageSubmissionRate)}%
            </span>
          </div>
          <ProgressBar rate={averageSubmissionRate} color={getProgressBarColor(averageSubmissionRate)} />
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Average Response Rate</span>
            <span className={`text-sm font-bold ${getPerformanceColor(averageResponseRate)}`}>
              {Math.round(averageResponseRate)}%
            </span>
          </div>
          <ProgressBar rate={averageResponseRate} color={getProgressBarColor(averageResponseRate)} />
        </div>

        <div className="pt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Completion Rate:</span>
              <span className={`font-medium ml-2 ${getPerformanceColor(completionRate)}`}>
                {Math.round(completionRate)}%
              </span>
            </div>
            <div>
              <span className="text-gray-500">Active Teachers:</span>
              <span className={`font-medium ml-2 ${getPerformanceColor(activeTeachersRate)}`}>
                {Math.round(activeTeachersRate)}%
              </span>
            </div>
          </div>
        </div>

        {/* Performance Summary */}
        <div className="pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            <div className="flex items-center justify-between">
              <span>Overall Module Health:</span>
              <span className={`font-bold ${getPerformanceColor((averageSubmissionRate + averageResponseRate + completionRate + activeTeachersRate) / 4)}`}>
                {Math.round((averageSubmissionRate + averageResponseRate + completionRate + activeTeachersRate) / 4)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModulePerformance;
