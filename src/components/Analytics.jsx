import React from 'react';

const Analytics = ({ tasks }) => {
  // Calculate total tasks and completed tasks
  const totalTasks = Object.values(tasks).flat().length;
  const completedTasks = Object.values(tasks).flat().filter(task => task.status === 'done').length;

  // Calculate completion rate
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks * 100).toFixed(2) : 0;

  const StatCard = ({ title, value, description }) => (
    <div className="card flex flex-col items-center justify-center p-6">
      <h3 className="text-lg font-semibold text-gray-600 mb-2">{title}</h3>
      <p className="text-4xl font-bold text-primary mb-2">{value}</p>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">Analytics</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Total Tasks" 
          value={totalTasks} 
          description="Tasks created overall"
        />
        <StatCard 
          title="Completed Tasks" 
          value={completedTasks} 
          description="Tasks marked as done"
        />
        <StatCard 
          title="Completion Rate" 
          value={`${completionRate}%`} 
          description="Percentage of tasks completed"
        />
      </div>
    </div>
  );
};

export default Analytics;