import React, { useState, useEffect, useCallback } from 'react';
import { AlertCircle, ThumbsUp, AlertTriangle } from 'lucide-react';

const SmartAnalytics = ({ tasks, priorities }) => {
  const [analysis, setAnalysis] = useState('');
  const [sentiment, setSentiment] = useState('neutral');

  const generateAnalysis = useCallback(() => {
    // Calculate statistics
    const totalTasks = Object.values(tasks).flat().length;
    const completedTasks = Object.values(tasks).flat().filter(task => task.status === 'done').length;
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks * 100).toFixed(2) : 0;

    // Analyze priorities
    const topPriority = priorities.find(p => p.type === 'top');
    const topPriorityTasks = Object.values(tasks).flat().filter(task => task.priority === topPriority.id);
    const topPriorityCompletion = topPriorityTasks.filter(task => task.status === 'done').length / topPriorityTasks.length;

    // Generate analysis text
    let analysisText = `This week, you've completed ${completedTasks} out of ${totalTasks} tasks, achieving a ${completionRate}% completion rate. `;

    if (completionRate > 80) {
      analysisText += "You're making excellent progress! Keep up the great work. ";
      setSentiment('positive');
    } else if (completionRate > 50) {
      analysisText += "You're doing well, but there's room for improvement. Try to focus on completing more tasks. ";
      setSentiment('neutral');
    } else {
      analysisText += "It looks like you're facing some challenges this week. Let's see how we can improve your productivity. ";
      setSentiment('negative');
    }

    if (topPriorityCompletion === 1) {
      analysisText += `You've successfully completed all tasks related to your top priority "${topPriority.title}". Excellent focus! `;
    } else if (topPriorityCompletion > 0.5) {
      analysisText += `You're making good progress on your top priority "${topPriority.title}", but there are still some tasks to complete. `;
    } else {
      analysisText += `Your top priority "${topPriority.title}" needs more attention. Try to focus on these important tasks. `;
    }

    // Add some advice based on the analysis
    if (completionRate < 50) {
      analysisText += "Consider breaking down larger tasks into smaller, manageable pieces. This can help you make steady progress and boost your motivation. ";
    }

    if (topPriorityCompletion < 0.5) {
      analysisText += "Remember to allocate time specifically for your top priority tasks. They often have the biggest impact on your overall progress. ";
    }

    analysisText += "Keep pushing forward, and don't hesitate to adjust your priorities if needed. You've got this!";

    setAnalysis(analysisText);
  }, [tasks,priorities]);

  useEffect(() => {
    generateAnalysis();
  }, [generateAnalysis]);


  const SentimentIcon = () => {
    switch (sentiment) {
      case 'positive':
        return <ThumbsUp className="w-8 h-8 text-green-500" />;
      case 'negative':
        return <AlertCircle className="w-8 h-8 text-red-500" />;
      default:
        return <AlertTriangle className="w-8 h-8 text-yellow-500" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-semibold mb-6 flex items-center">
        <SentimentIcon />
        <span className="ml-2">Weekly Analysis</span>
      </h1>
      <p className="text-gray-700 leading-relaxed">{analysis}</p>
    </div>
  );
};

export default SmartAnalytics;