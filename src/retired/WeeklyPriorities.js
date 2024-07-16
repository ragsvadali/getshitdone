import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { CheckCircle, Circle, Plus, X, ArrowRight, Trash2, Timer,GripVertical } from 'lucide-react';
//import { data } from 'autoprefixer';

const WeeklyPriorities = ({ priorities, setPriorities, tasks, setTasks }) => {
  const [addingTaskForPriority, setAddingTaskForPriority] = useState(null);
  const [newTaskTitle, setNewTaskTitle] = useState(''); // added this new
  const [viewMode, setViewMode] = useState('today'); // 'today' or 'week'

  const today = new Date().toISOString().split('T')[0];

  // Task rollover effect
  useEffect(() => {
    const rollOverTasks = () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowString = tomorrow.toISOString().split('T')[0];

      setTasks(prevTasks => {
        const todayTasks = prevTasks[today] || [];
        const unfinishedTasks = todayTasks.filter(task => task.status !== 'done');
        
        return {
          ...prevTasks,
          [tomorrowString]: [...(prevTasks[tomorrowString] || []), ...unfinishedTasks]
        };
      });
    };

    const now = new Date();
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    const timeUntilEndOfDay = endOfDay.getTime() - now.getTime();

    const timerId = setTimeout(rollOverTasks, timeUntilEndOfDay);

    return () => clearTimeout(timerId);
  }, [today, setTasks]);

  // Logging effect for debugging
  useEffect(() => {
    console.log("current tasks:", tasks);
  }, [tasks]);

  const handlePriorityChange = (id, field, value) => {
    setPriorities(priorities =>
      priorities.map(p => p.id === id ? { ...p, [field]: value } : p)
    );
  };

  const getTasksForPriority = (priorityId) => {
    if (viewMode === 'today') {
      return (tasks[today] || []).filter(task => task.priority === priorityId.toString);
    } else {
      // Week view - get tasks from monday to sunday
      const weekStart = new Date(today);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);

      return Object.entries(tasks)
        .filter(([date]) => {
          const taskDate = new Date(date);
          return taskDate >= weekStart && taskDate <= weekEnd;
        })
        .flatMap(([date, dayTasks]) => 
          dayTasks.filter(task => task.priority === priorityId.toString)
        );
    }
  };

  /* DEPRECATED Modified to replace newTask state with newTaskTitle
  const handleAddTask = (priorityId) => {
    if (newTaskTitle.trim()) {
      setTasks(prevTasks => ({
        ...prevTasks,
        [today]: [
          ...(prevTasks[today] || []),
          {
            id: Date.now().toString(),
            title: newTaskTitle.trim(),
            status: 'pending',
            priority: priorityId, //removed toString() 
            date: today,
            completedPomodoros: 0
          }
        ]
      }));
      setNewTaskTitle('');
      setAddingTaskForPriority(null);
    }
  }; */

  const handleAddTask = (priorityId) => {
    if (newTaskTitle.trim()) {
      const newTask = {
        id: Date.now().toString(),
        title: newTaskTitle.trim(),
        status: 'pending',
        priority: priorityId.toString(),
        date: today,
        completedPomodoros: 0
      };
      
      setTasks(prevTasks => ({
        ...prevTasks,
        [today]: [...(prevTasks[today] || []), newTask]
      }));
      setNewTaskTitle('');
      setAddingTaskForPriority(null);
    }
  };

  // New function handleKeyPress to allow task creation with Enter
  const handleKeyPress = (event, priorityId) => {
    if (event.key === 'Enter') {
      handleAddTask(priorityId);
    }
  };

  const handleTaskChange = (taskId, date, field, value) => {
    setTasks(prevTasks => ({
      ...prevTasks,
      [date]: prevTasks[date].map(task =>
        task.id === taskId ? { ...task, [field]: value } : task
      )
    }));
  };

  const toggleTaskStatus = (taskId, date) => {
    setTasks(prevTasks => ({
      ...prevTasks,
      [date]: prevTasks[date].map(task =>
        task.id === taskId ? { ...task, status: task.status === 'done' ? 'pending' : 'done' } : task
      )
    }));
  };

  const deferTask = (taskId, date) => {
    const tomorrow = new Date(date);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowString = tomorrow.toISOString().split('T')[0];

    setTasks(prevTasks => {
      const taskToDefer = prevTasks[date].find(task => task.id === taskId);
      return {
        ...prevTasks,
        [date]: prevTasks[date].filter(task => task.id !== taskId),
        [tomorrowString]: [...(prevTasks[tomorrowString] || []), { ...taskToDefer, date: tomorrowString, status: 'deferred' }]
      };
    });
  };

  const deleteTask = (taskId, date) => {
    setTasks(prevTasks => ({
      ...prevTasks,
      [date]: prevTasks[date].map(task =>
        task.id === taskId ? { ...task, status: 'deleted' } : task
      )
    }));
  };

  const getDayOfWeek = (dateString) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const date = new Date(dateString);
    return days[date.getDay()];
  };

  const isToday = (dateString) => {
    return dateString === today;
  };

  // Adding a function to add a pomodoro
  const addPomodoro = (taskId, date) => {
    setTasks(prevTasks => ({
      ...prevTasks,
      [date]: prevTasks[date].map(task =>
        task.id === taskId ? { ...task, completedPomodoros: (task.completedPomodoros || 0) + 1 } : task
      )
    }));
  };

  // Modify this to correct errors with drag and drop
  const onDragEnd = (result) => {
    const { source, destination } = result;

    // Dropped outside the list
    if (!destination) {
      return;
    }

    const sourceDate = source.droppableId;
    const destDate = destination.droppableId; // dropped the split

    // If the task was dropped in a different date, we don't allow it
    if (sourceDate !== destDate) {
      return;
    }

    // Add some console logging to debug
    console.log('Current tasks state', tasks);
    console.log('Source date:', sourceDate);

    const currentTasks = tasks[sourceDate] || [];

    if(!Array.isArray(currentTasks)) {
      console.error('Tasks for current date are not an array:', currentTasks);
      return;
    }

    const newTasks = Array.from(currentTasks);
    const [reorderedItem] = newTasks.splice(source.index, 1);
    newTasks.splice(destination.index, 0, reorderedItem);

    setTasks(prevTasks => ({
      ...prevTasks,
      [sourceDate]: newTasks
    }));
  };

  /* Modified to get pomodoros on the same line - replace with new draggable version
  const renderTask = (task) => (
    <div key={task.id} className="flex items-center text-sm mb-2">
      {task.status === 'done' ? (
        <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
      ) : (
        <button onClick={() => toggleTaskStatus(task.id, task.date)} className="mr-2 flex-shrink-0">
          <Circle className="w-4 h-4 text-gray-300" />
        </button>
      )}
      <input
        value={task.title}
        onChange={(e) => handleTaskChange(task.id, task.date, 'title', e.target.value)}
        className={`flex-grow bg-transparent border-none focus:outline-none focus:ring-0 ${task.status === 'done' ? 'text-gray-500' : ''}`}
        disabled={task.status === 'done'}
      />
      {task.completedPomodoros > 0 && (
        <div className="flex items-center mr-2">
          <Timer className="w-4 h-4 text-red-500 mr-1" />
          <span className="text-xs text-gray-600">{task.completedPomodoros}</span>
        </div>
      )}
      {task.status !== 'done' && (
        <>
          <button onClick={() => addPomodoro(task.id, task.date)} className="ml-2 text-gray-400 hover:text-gray-600">
            <Plus className="w-4 h-4" />
          </button>
          <button onClick={() => deferTask(task.id, task.date)} className="ml-2 text-blue-500 hover:text-blue-700">
            <ArrowRight className="w-4 h-4" />
          </button>
          <button onClick={() => deleteTask(task.id, task.date)} className="ml-2 text-red-500 hover:text-red-700">
            <Trash2 className="w-4 h-4" />
          </button>
        </>
      )}
      {viewMode === 'week' && (
        <span className={`ml-2 text-xs ${isToday(task.date) ? 'bg-blue-500 text-white px-2 py-1 rounded-full' : 'text-gray-500'}`}>
          {isToday(task.date) ? 'Today' : getDayOfWeek(task.date)}
        </span>
      )}
    </div>
  ); */

  const renderTask = (task, index) => (
    <Draggable key={task.id} draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`flex items-center text-sm mb-2 ${snapshot.isDragging ? 'bg-gray-100' : ''}`}
        >
          <div {...provided.dragHandleProps} className="mr-2 cursor-move">
            <GripVertical className="w-4 h-4 text-gray-400" />
          </div>
          {task.status === 'done' ? (
            <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
          ) : (
            <button onClick={() => toggleTaskStatus(task.id, task.date)} className="mr-2 flex-shrink-0">
              <Circle className="w-4 h-4 text-gray-300" />
            </button>
          )}
          <input
            value={task.title}
            onChange={(e) => handleTaskChange(task.id, task.date, 'title', e.target.value)}
            className={`flex-grow bg-transparent border-none focus:outline-none focus:ring-0 ${task.status === 'done' ? 'text-gray-500' : ''}`}
            disabled={task.status === 'done'}
          />
          {task.completedPomodoros > 0 && (
            <div className="flex items-center mr-2">
              <Timer className="w-4 h-4 text-red-500 mr-1" />
              <span className="text-xs text-gray-600">{task.completedPomodoros}</span>
            </div>
          )}
          {task.status !== 'done' && (
            <>
              <button onClick={() => addPomodoro(task.id, task.date)} className="ml-2 text-gray-400 hover:text-gray-600">
                <Plus className="w-4 h-4" />
              </button>
              <button onClick={() => deferTask(task.id, task.date)} className="ml-2 text-blue-500 hover:text-blue-700">
                <ArrowRight className="w-4 h-4" />
              </button>
              <button onClick={() => deleteTask(task.id, task.date)} className="ml-2 text-red-500 hover:text-red-700">
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
          {viewMode === 'week' && (
            <span className={`ml-2 text-xs ${isToday(task.date) ? 'bg-blue-500 text-white px-2 py-1 rounded-full' : 'text-gray-500'}`}>
              {isToday(task.date) ? 'Today' : getDayOfWeek(task.date)}
            </span>
          )}
        </div>
      )}
    </Draggable>
  );

  /* OLD redo section with changes, also to add draggable features
  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">{viewMode === 'today' ? "Today's" : "This Week's"} Priorities</h1>
        <div className="flex items-center bg-gray-200 rounded-full">
          <button
            className={`px-4 py-2 rounded-full text-sm font-medium ${viewMode === 'today' ? 'bg-blue-500 text-white' : 'text-gray-700'}`}
            onClick={() => setViewMode('today')}
          >
            Today
          </button>
          <button
            className={`px-4 py-2 rounded-full text-sm font-medium ${viewMode === 'week' ? 'bg-blue-500 text-white' : 'text-gray-700'}`}
            onClick={() => setViewMode('week')}
          >
            Week
          </button>
        </div>
      </div>
      {priorities.map((priority) => (
        <div key={priority.id} className="bg-white rounded-lg shadow-md mb-6 p-4">
          <div className="flex items-center mb-2">
            <span className={`w-3 h-3 rounded-full mr-2 ${priority.type === 'top' ? 'bg-blue-500' : 'bg-blue-300'}`}></span>
            <input
              className="text-lg font-medium bg-transparent border-none focus:outline-none focus:ring-0 w-full"
              placeholder={`Enter ${priority.type === 'top' ? 'top' : 'secondary'} priority`}
              value={priority.title}
              onChange={(e) => handlePriorityChange(priority.id, 'title', e.target.value)}
            />
          </div>
          <textarea
            className="w-full p-2 text-sm bg-gray-50 rounded mb-4 focus:outline-none focus:ring-1 focus:ring-blue-300"
            placeholder="Describe successful outcome"
            value={priority.outcome}
            onChange={(e) => handlePriorityChange(priority.id, 'outcome', e.target.value)}
            rows="2"
          />
             <div className="mt-2">
            {getTasksForPriority(priority.id).map(renderTask)}
            {viewMode === 'today' && (
              addingTaskForPriority === priority.id ? (
                <div className="flex items-center mt-2">
                  <input
                    type="text"
                    placeholder="New task title"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    onKeyPress={(e) => handleKeyPress(e, priority.id)}
                    className="flex-grow text-sm p-1 border rounded mr-2"
                    autoFocus
                  />
                  <button onClick={() => handleAddTask(priority.id)} className="text-green-500 hover:text-green-700">
                    <Plus className="w-5 h-5" />
                  </button>
                  <button onClick={() => setAddingTaskForPriority(null)} className="text-red-500 hover:text-red-700 ml-2">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => setAddingTaskForPriority(priority.id)} 
                  className="text-sm text-blue-500 hover:text-blue-700 mt-2 flex items-center"
                >
                  <Plus className="w-4 h-4 mr-1" /> Add task
                </button>
              )
            )}
          </div>
        </div>
      ))}
    </div>
  ); */

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="max-w-4xl mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">{viewMode === 'today' ? "Today's" : "This Week's"} Priorities</h1>
          <div className="flex items-center bg-gray-200 rounded-full">
            <button
              className={`px-4 py-2 rounded-full text-sm font-medium ${viewMode === 'today' ? 'bg-blue-500 text-white' : 'text-gray-700'}`}
              onClick={() => setViewMode('today')}
            >
              Today
            </button>
            <button
              className={`px-4 py-2 rounded-full text-sm font-medium ${viewMode === 'week' ? 'bg-blue-500 text-white' : 'text-gray-700'}`}
              onClick={() => setViewMode('week')}
            >
              Week
            </button>
          </div>
        </div>
        {priorities.map((priority) => (
          <div key={priority.id} className="bg-white rounded-lg shadow-md mb-6 p-4">
            <div className="flex items-center mb-2">
              <span className={`w-3 h-3 rounded-full mr-2 ${priority.type === 'top' ? 'bg-blue-500' : 'bg-blue-300'}`}></span>
              <input
                className="text-lg font-medium bg-transparent border-none focus:outline-none focus:ring-0 w-full"
                placeholder={`Enter ${priority.type === 'top' ? 'top' : 'secondary'} priority`}
                value={priority.title}
                onChange={(e) => handlePriorityChange(priority.id, 'title', e.target.value)}
              />
            </div>
            <textarea
              className="w-full p-2 text-sm bg-gray-50 rounded mb-4 focus:outline-none focus:ring-1 focus:ring-blue-300"
              placeholder="Describe successful outcome"
              value={priority.outcome}
              onChange={(e) => handlePriorityChange(priority.id, 'outcome', e.target.value)}
              rows="2"
            /> 
            <Droppable droppableId={viewMode === 'today' ? today : 'week'}>
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps}>
                  {getTasksForPriority(priority.id).map((task, index) => renderTask(task, index))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
            {viewMode === 'today' && (
              addingTaskForPriority === priority.id ? (
                <div className="flex items-center mt-2">
                  <input
                    type="text"
                    placeholder="New task title"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    onKeyPress={(e) => handleKeyPress(e, priority.id)}
                    className="flex-grow text-sm p-1 border rounded mr-2"
                    autoFocus
                  />
                  <button onClick={() => handleAddTask(priority.id)} className="text-green-500 hover:text-green-700">
                    <Plus className="w-5 h-5" />
                  </button>
                  <button onClick={() => setAddingTaskForPriority(null)} className="text-red-500 hover:text-red-700 ml-2">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => setAddingTaskForPriority(priority.id)} 
                  className="text-sm text-blue-500 hover:text-blue-700 mt-2 flex items-center"
                >
                  <Plus className="w-4 h-4 mr-1" /> Add task
                </button>
              )
            )}
          </div>
        ))}
      </div>
    </DragDropContext>
  );

};

export default WeeklyPriorities;