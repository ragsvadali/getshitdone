import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import WeeklyPriorities from './components/WeeklyPriorities';
//import WeeklyArchive from './components/WeeklyArchive';
//import Analytics from './components/Analytics';
//import SmartAnalytics from './components/SmartAnalytics';
//import { BrowserRouter as Router, Route, Link, Routes } from 'react-router-dom';

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

  /* WAR - not needed anymore?
  const [weeklyArchive, setWeeklyArchive] = useState(() => {
    const savedArchive = localStorage.getItem('weeklyArchive');
    return savedArchive ? JSON.parse(savedArchive) : [];
  }); */

  useEffect(() => {
    localStorage.setItem('weeklyPriorities', JSON.stringify(priorities));
  }, [priorities]);

  useEffect(() => {
    localStorage.setItem('dailyTasks', JSON.stringify(tasks));
  }, [tasks]);

 
  useEffect(() => {
    localStorage.setItem('backlogTasks', JSON.stringify(backlogTasks));
  }, [backlogTasks]);

  /* WAR - not needed? 
  useEffect(() => {
    localStorage.setItem('weeklyArchive', JSON.stringify(weeklyArchive));
  }, [weeklyArchive]); */
  

  // NOW - is this deprecated too? NO!! this is needed to add task to today from backlog
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

  // NEW: adding code to handle duplicated moved tasks
  const handleDailyRollover = useCallback(() => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayString = yesterday.toISOString().split('T')[0];
    const todayString = new Date().toISOString().split('T')[0];

    setTasks(prevTasks => {
      const newTasks = { ...prevTasks };
      const yesterdayTasks = newTasks[yesterdayString] || [];

      // Keep completed tasks for yesterday
      newTasks[yesterdayString] = yesterdayTasks.filter(task => task.status === 'done');

      // Move unfinished tasks to today
      const unfinishedTasks = yesterdayTasks.filter(task => task.status !== 'done');

      if (unfinishedTasks.length > 0) {
        newTasks[todayString] = [
          ...(newTasks[todayString] || []),
          ...unfinishedTasks.map(task => ({ ...task, date: todayString }))
        ];
      }

      /* TO TRY:
          // Remove empty days
    Object.keys(newTasks).forEach(date => {
      if (newTasks[date].length === 0) {
        delete newTasks[date];
      }
    }); */


      // NEW > removed this line to preserve yesterday's tasks
      // delete newTasks[yesterdayString];

      // TO TRY NEXT -Keep completed tasks in their original date, if prev change didn't fix
      //newTasks[yesterdayString] = yesterdayTasks.filter(task => task.status === 'done');

      return newTasks;
    });
  }, []);

  /* OLD - replace this version of weekly rollover with a simpler one that moves incomplete tasks into the backlog
  const handleWeeklyRollover = useCallback(() => {
    // Archive the current week
    const lastWeekEnd = new Date();
    lastWeekEnd.setDate(lastWeekEnd.getDate() - lastWeekEnd.getDay());
    const lastWeekStart = new Date(lastWeekEnd);
    lastWeekStart.setDate(lastWeekStart.getDate() - 6);

    const weekTasks = Object.entries(tasks)
      .filter(([date]) => {
        const taskDate = new Date(date);
        return taskDate >= lastWeekStart && taskDate <= lastWeekEnd;
      })
      .reduce((acc, [date, dateTasks]) => {
        acc[date] = dateTasks;
        return acc;
      }, {});

    const weekArchive = {
      startDate: lastWeekStart.toISOString().split('T')[0],
      endDate: lastWeekEnd.toISOString().split('T')[0],
      priorities: priorities,
      tasks: weekTasks
    };

    setWeeklyArchive(prevArchive => [...prevArchive, weekArchive]);

    // Clear tasks and reset priorities for the new week
    setTasks({});
    setPriorities(priorities.map(priority => ({ ...priority, title: '', outcome: '' })));
  }, [tasks, priorities, setWeeklyArchive, setPriorities]);
  */

  // NEW - 
  const handleWeeklyRollover = useCallback(() => {
    const today = new Date();
    const startOfLastWeek = new Date(today);
    startOfLastWeek.setDate(today.getDate() - today.getDay() - 7);
    const endOfLastWeek = new Date(today);
    endOfLastWeek.setDate(today.getDate() - today.getDay() - 1);

    setTasks(prevTasks => {
      const newBacklogTasks = [];
      const priorityMap = new Map(priorities.map(p => [p.id, p.title]));

      // Process tasks from the previous week
      Object.entries(prevTasks).forEach(([date, dateTasks]) => {
        const taskDate = new Date(date);
        if (taskDate >= startOfLastWeek && taskDate <= endOfLastWeek) {
          dateTasks.forEach(task => {
            if (task.status !== 'done') {
              const priorityTitle = priorityMap.get(task.priority) || 'Unassigned';
              newBacklogTasks.push({
                ...task,
                title: `[${priorityTitle}] ${task.title}`
              });
            }
          });
        }
      });

      // Add new backlog tasks
      setBacklogTasks(prevBacklog => [...prevBacklog, ...newBacklogTasks]);

      // Clear all tasks (both completed and incomplete)
      return {};
    });

    // Clear priorities
    setPriorities(prevPriorities => 
      prevPriorities.map(priority => ({ ...priority, title: '', outcome: '' }))
    );

  }, [priorities]);

    // WAR - new logic from Claude to handle these rollovers
    useEffect(() => {
      const checkRollover = () => {
        const now = new Date();
        const today = now.toISOString().split('T')[0];
        const lastCheckDate = localStorage.getItem('lastRolloverCheck');
  
        if (lastCheckDate !== today) {
          // It's a new day, perform daily rollover
          handleDailyRollover();
  
          // Check if it's also Monday (new week)
          if (now.getDay() === 1) {
            handleWeeklyRollover();
          }
  
          // Update last check date
          localStorage.setItem('lastRolloverCheck', today);
        }
      };
  
      // Check rollover on component mount and then every hour
      checkRollover();
      const hourlyCheck = setInterval(checkRollover, 60 * 60 * 1000);
  
      return () => clearInterval(hourlyCheck);
    }, [handleDailyRollover, handleWeeklyRollover]);

    /* NEW - removed this from under the first div to remove the header to make it a single-page app
        <nav className="mb-4">
          <ul className="flex space-x-4">
            <li>
              <Link to="/" className="text-blue-500 hover:text-blue-700">Weekly Priorities</Link>
            </li>
            <li>
              <Link to="/archive" className="text-blue-500 hover:text-blue-700">Weekly Archive</Link>
            </li>
            <li>
              <Link to="/smartAnalytics" className="text-blue-500 hover:text-blue-700">Insights</Link>
            </li>
            <li>
              <Link to="/analytics" className="text-blue-500 hover:text-blue-700">Analytics</Link>
            </li>
          </ul>
        </nav>

        NEXT - I think I should also be able to safely remove the routes for these pages.
          Removed all of these from after the first Route annd before the </Routes>
          <Route path="/archive" element={<WeeklyArchive archive={weeklyArchive} />} />
          < Route path="/analytics" element={<Analytics tasks={tasks} />} />
          < Route 
            path=
              "/smartAnalytics" 
                element={
                <SmartAnalytics 
                  tasks={tasks} 
                  priorities={priorities}
                />
              } 
           />
    */

  return (
    <Router>
      <div className="p-4 max-w-4xl mx-auto">
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
              />
            } 
          />

        </Routes>
      </div>
    </Router>
  ); 

};

export default App;