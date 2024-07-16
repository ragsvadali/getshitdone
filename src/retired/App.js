import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Link, Routes } from 'react-router-dom';
import WeeklyPriorities from './components/WeeklyPriorities';
//import Backlog from './components/Backlog';
import Analytics from './components/Analytics';

const App = () => {
  const [priorities, setPriorities] = useState(() => {
    const savedPriorities = localStorage.getItem('weeklyPriorities');
    return savedPriorities ? JSON.parse(savedPriorities) : [
      { id: '1', title: '', outcome: '', type: 'top' },
      { id: '2', title: '', outcome: '', type: 'secondary' },
      { id: '3', title: '', outcome: '', type: 'secondary' },
    ];
  });

  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem('dailyTasks');
    return savedTasks ? JSON.parse(savedTasks) : {};
  });

  const [backlogTasks, setBacklogTasks] = useState(() => {
    const savedBacklog = localStorage.getItem('backlogTasks');
    return savedBacklog ? JSON.parse(savedBacklog) : [];
  });

  useEffect(() => {
    localStorage.setItem('weeklyPriorities', JSON.stringify(priorities));
  }, [priorities]);

  useEffect(() => {
    localStorage.setItem('dailyTasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('backlogTasks', JSON.stringify(backlogTasks));
  }, [backlogTasks]);

  const resetState = () => {
    const initialPriorities = [
      { id: '1', title: '', outcome: '', type: 'top' },
      { id: '2', title: '', outcome: '', type: 'secondary' },
      { id: '3', title: '', outcome: '', type: 'secondary' },
    ];

    setPriorities(initialPriorities);
    setTasks({});
    setBacklogTasks([]);

    localStorage.removeItem('weeklyPriorities');
    localStorage.removeItem('dailyTasks');
    localStorage.removeItem('backlogTasks');

    console.log('State has been reset');
  };

  const addTaskToToday = (task, priorityId) => {
    const today = new Date().toISOString().split('T')[0];
    setTasks(prevTasks => ({
      ...prevTasks,
      [today]: [
        ...(prevTasks[today] || []),
        { ...task, priority: priorityId, date: today, status: 'pending', completedPomodoros: 0 }
      ]
    }));
  };

  // Adding back logic to handle daily and weekly rollovers
  useEffect(() => {
    const checkRollover = () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const lastCheck = localStorage.getItem('lastRolloverCheck');
      if (lastCheck) {
        const lastCheckDate = new Date(lastCheck);
        if (lastCheckDate < today) {
          // It's a new day, handle daily rollover
          handleDailyRollover();
          
          // Check if it's also a new week (Monday)
          if (today.getDay() === 1) {
            handleWeekRollover();
          }
        }
      }

      // Update last check date
      localStorage.setItem('lastRolloverCheck', today.toISOString());
    };

    checkRollover();
    // Run this check every hour
    const hourlyCheck = setInterval(checkRollover, 60 * 60 * 1000);

    return () => clearInterval(hourlyCheck);
  }, []);

  const handleDailyRollover = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayString = yesterday.toISOString().split('T')[0];
    const todayString = new Date().toISOString().split('T')[0];

    setTasks(prevTasks => {
      const newTasks = { ...prevTasks };
      const yesterdayTasks = newTasks[yesterdayString] || [];
      const unfinishedTasks = yesterdayTasks.filter(task => task.status !== 'done');

      if (unfinishedTasks.length > 0) {
        newTasks[todayString] = [
          ...(newTasks[todayString] || []),
          ...unfinishedTasks.map(task => ({ ...task, date: todayString }))
        ];
      }

      // Remove yesterday's tasks
      delete newTasks[yesterdayString];

      return newTasks;
    });
  };

  const handleWeekRollover = () => {
    setTasks(prevTasks => {
      const newTasks = { ...prevTasks };
      const today = new Date().toISOString().split('T')[0];
      const unfinishedTasks = [];

      // Collect unfinished tasks from the past week
      Object.entries(newTasks).forEach(([date, tasks]) => {
        if (date < today) {
          tasks.forEach(task => {
            if (task.status !== 'done') {
              unfinishedTasks.push({ ...task, date: today });
            }
          });
          delete newTasks[date]; // Remove old dates
        }
      });

      // Add unfinished tasks to today
      if (unfinishedTasks.length > 0) {
        newTasks[today] = [...(newTasks[today] || []), ...unfinishedTasks];
      }

      return newTasks;
    });

    // Reset weekly priorities
    setPriorities(priorities.map(priority => ({ ...priority, title: '', outcome: '' })));
  };

  return (
    <Router>
      <div className="p-4 max-w-4xl mx-auto">
        <nav className="mb-4">
          <ul className="flex space-x-4">
            <li>
              <Link to="/" className="text-blue-500 hover:text-blue-700">Weekly Priorities</Link>
            </li>
            <li>
              <Link to="/analytics" className="text-blue-500 hover:text-blue-700">Analytics</Link>
            </li>
          </ul>
        </nav>

        <Routes>
          <Route 
            path="/" 
            element={
              <WeeklyPriorities 
                priorities={priorities} 
                setPriorities={setPriorities} 
                tasks={tasks} 
                setTasks={setTasks} 
                backlogTasks={backlogTasks}
                setBacklogTasks={setBacklogTasks}
                addTaskToToday={addTaskToToday}
                resetState={resetState}
              />
            } 
          />
          <Route path="/analytics" element={<Analytics tasks={tasks} />} />
        </Routes>
      </div>
    </Router>
  ); 

};

export default App;