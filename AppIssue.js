import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Link, Routes } from 'react-router-dom';
import WeeklyPriorities from './components/WeeklyPriorities';
import DailyTasks from './components/DailyTasks';

const App = () => {
  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem('tasks');
    return savedTasks ? JSON.parse(savedTasks) : {};
  });

  const [priorities, setPriorities] = useState(() => {
    const savedPriorities = localStorage.getItem('priorities');
    return savedPriorities ? JSON.parse(savedPriorities) : [];
  });

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('priorities', JSON.stringify(priorities));
  }, [priorities]);

  return (
    <Router>
      <div>
        <nav>
          <ul>
            <li><Link to="/">Weekly Priorities</Link></li>
            <li><Link to="/daily">Daily Tasks</Link></li>
          </ul>
        </nav>

        <Routes>
          <Route path="/" element={<WeeklyPriorities priorities={priorities} setPriorities={setPriorities} tasks={tasks} />} />
          <Route path="/daily" element={<DailyTasks tasks={tasks} setTasks={setTasks} priorities={priorities} />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;