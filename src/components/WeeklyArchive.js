import React from 'react';

const WeeklyArchive = ({ archive }) => {
  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-6">Weekly Archive</h1>
      {archive.map((week, index) => (
        <div key={index} className="mb-8 bg-white rounded-lg shadow-md p-4">
          <h2 className="text-xl font-semibold mb-4">
            Week of {week.startDate} to {week.endDate}
          </h2>
          <h3 className="text-lg font-semibold mt-4 mb-2">Priorities</h3>
          {week.priorities.map((priority) => (
            <div key={priority.id} className="mb-4">
              <h4 className="font-medium">{priority.type === 'top' ? 'Top Priority' : 'Secondary Priority'}</h4>
              <p>{priority.title}</p>
              <p className="text-sm text-gray-600">{priority.outcome}</p>
            </div>
          ))}
          <h3 className="text-lg font-semibold mt-4 mb-2">Tasks</h3>
          {Object.entries(week.tasks).map(([date, tasks]) => (
            <div key={date} className="mb-4">
              <h4 className="font-medium">{date}</h4>
              <ul className="list-disc list-inside">
                {tasks.map((task) => (
                  <li key={task.id} className={task.status === 'done' ? 'line-through text-gray-500' : ''}>
                    {task.title}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default WeeklyArchive;