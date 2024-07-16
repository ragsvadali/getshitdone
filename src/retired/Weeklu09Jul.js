import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { CheckCircle, Circle, Plus, ArrowRight, Trash2, Timer, GripVertical, X } from 'lucide-react';

const WeeklyPriorities = ({ priorities, setPriorities, tasks, setTasks, resetState }) => {
  const [addingTaskForPriority, setAddingTaskForPriority] = useState(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [viewMode, setViewMode] = useState('today');

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    console.log("Current tasks:", tasks);
    console.log("Current priorities:", priorities);
  }, [tasks, priorities]);

  const getTasksForPriority = (priorityId) => {
    console.log(`Getting tasks for priority: ${priorityId}, View mode: ${viewMode}`);
    if (viewMode === 'today') {
      const todayTasks = tasks[today] || [];
      return todayTasks.filter(task => task && task.priority === priorityId.toString());
    } else {
      // Week view logic
      const allTasks = Object.values(tasks).flat();
      return allTasks.filter(task => task && task.priority === priorityId.toString());
    }
  };

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
        [tomorrowString]: [...(prevTasks[tomorrowString] || []), { ...taskToDefer, date: tomorrowString }]
      };
    });
  };

  const deleteTask = (taskId, date) => {
    setTasks(prevTasks => ({
      ...prevTasks,
      [date]: prevTasks[date].filter(task => task.id !== taskId)
    }));
  };

  const addPomodoro = (taskId, date) => {
    setTasks(prevTasks => ({
      ...prevTasks,
      [date]: prevTasks[date].map(task =>
        task.id === taskId ? { ...task, completedPomodoros: (task.completedPomodoros || 0) + 1 } : task
      )
    }));
  };


  /* Fix dragging only in Today view
  const onDragEnd = (result) => {
    const { source, destination } = result;
  
    if (!destination) return;
  
    console.log('Drag result:', result);
  
    setTasks(prevTasks => {
      console.log('Previous tasks state:', prevTasks);
  
      const sourceDate = source.droppableId;
      const destDate = destination.droppableId;
  
      const sourceTasks = prevTasks[sourceDate] || [];
      const destTasks = sourceDate === destDate ? sourceTasks : (prevTasks[destDate] || []);
  
      // Find the task being moved
      const [movedTask] = sourceTasks.splice(source.index, 1);
  
      if (!movedTask) {
        console.error('Task not found');
        return prevTasks;
      }
  
      // Update the task's date if it's moved to a different day
      if (sourceDate !== destDate) {
        movedTask.date = destDate;
      }
  
      // Insert the task at the new position
      destTasks.splice(destination.index, 0, movedTask);
  
      // Prepare the new state
      const newState = {
        ...prevTasks,
        [sourceDate]: sourceTasks,
      };
  
      // If the destination date is different, update it separately
      if (sourceDate !== destDate) {
        newState[destDate] = destTasks;
      }
  
      console.log('New tasks state:', newState);
      return newState;
    });
  }; */

  const onDragEnd = (result) => {
    if (viewMode !== 'today') return; // Only allow reordering in 'today' view
  
    const { source, destination } = result;
  
    if (!destination) return;
  
    // Ensure the source and destination are within the same priority
    if (source.droppableId !== destination.droppableId) {
      console.log('Attempted to move task between priorities. This is not allowed.');
      return;
    }
  
    console.log('Drag result:', result);
  
    setTasks(prevTasks => {
      const currentTasks = prevTasks[today] || [];
      const priorityTasks = currentTasks.filter(task => task.priority === source.droppableId);
      
      const newPriorityTasks = Array.from(priorityTasks);
      const [reorderedItem] = newPriorityTasks.splice(source.index, 1);
      newPriorityTasks.splice(destination.index, 0, reorderedItem);
  
      const newTasks = currentTasks.map(task => 
        task.priority === source.droppableId
          ? newPriorityTasks[newPriorityTasks.findIndex(t => t.id === task.id)] || task
          : task
      );
  
      console.log('New tasks:', newTasks);
  
      return {
        ...prevTasks,
        [today]: newTasks
      };
    });
  };

  /* this version didn't have the names of day and blue pills
  const renderTask = (task, index) => {
    if (!task) return null; //skip rendering for null tasks

    return(
      <Draggable key={task.id} draggableId={task.id} index={index}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className={`flex items-center text-sm mb-2 ${snapshot.isDragging ? 'bg-gray-100' : ''}`}
          >
            <GripVertical className="w-4 h-4 text-gray-400 mr-2" />
            <button onClick={() => toggleTaskStatus(task.id, task.date)} className="mr-2 flex-shrink-0">
              {task.status === 'done' ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <Circle className="w-4 h-4 text-gray-300" />
              )}
            </button>
            <input
              value={task.title}
              onChange={(e) => handleTaskChange(task.id, task.date, 'title', e.target.value)}
              className={`flex-grow bg-transparent border-none focus:outline-none focus:ring-0 ${task.status === 'done' ? 'text-gray-500' : ''}`}
              disabled={task.status === 'done'}
            />
            <div className="flex items-center ml-2">
              {task.status !== 'done' && (
                <>
                  <button onClick={() => addPomodoro(task.id, task.date)} className="text-gray-400 hover:text-gray-600 mr-2">
                    <Plus className="w-4 h-4" />
                  </button>
                  <button onClick={() => deferTask(task.id, task.date)} className="text-blue-500 hover:text-blue-700 mr-2">
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button onClick={() => deleteTask(task.id, task.date)} className="text-red-500 hover:text-red-700 mr-2">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )}
              {task.completedPomodoros > 0 && (
                <>
                  <Timer className="w-4 h-4 text-gray-400 mr-1" />
                  <span className="text-xs text-gray-600 mr-2">{task.completedPomodoros}</span>
                </>
              )}
            </div>
            {viewMode === 'week' && (
              <span className="text-xs text-gray-500 ml-2">{task.date}</span>
            )}
          </div>
        )}
      </Draggable>
    );
  } */
    const renderTask = (task, index) => {
      if (!task) return null;
    
      const getDayOfWeek = (dateString) => {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const date = new Date(dateString);
        return days[date.getDay()];
      };
    
      const isToday = (dateString) => {
        const today = new Date();
        const taskDate = new Date(dateString);
        return today.toDateString() === taskDate.toDateString();
      };
    
      return (
        <Draggable key={task.id} draggableId={task.id} index={index}>
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.draggableProps}
              {...provided.dragHandleProps}
              className={`flex items-center text-sm mb-2 ${snapshot.isDragging ? 'bg-gray-100' : ''}`}
            >
              <GripVertical className="w-4 h-4 text-gray-400 mr-2" />
              <button onClick={() => toggleTaskStatus(task.id, task.date)} className="mr-2 flex-shrink-0">
                {task.status === 'done' ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <Circle className="w-4 h-4 text-gray-300" />
                )}
              </button>
              <input
                value={task.title}
                onChange={(e) => handleTaskChange(task.id, task.date, 'title', e.target.value)}
                className={`flex-grow bg-transparent border-none focus:outline-none focus:ring-0 ${task.status === 'done' ? 'text-gray-500' : ''}`}
                disabled={task.status === 'done'}
              />
              <div className="flex items-center ml-2">
                {task.status !== 'done' && (
                  <>
                    <button onClick={() => addPomodoro(task.id, task.date)} className="text-gray-400 hover:text-gray-600 mr-2">
                      <Plus className="w-4 h-4" />
                    </button>
                    <button onClick={() => deferTask(task.id, task.date)} className="text-blue-500 hover:text-blue-700 mr-2">
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <button onClick={() => deleteTask(task.id, task.date)} className="text-red-500 hover:text-red-700 mr-2">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
                {task.completedPomodoros > 0 && (
                  <>
                    <Timer className="w-4 h-4 text-gray-400 mr-1" />
                    <span className="text-xs text-gray-600 mr-2">{task.completedPomodoros}</span>
                  </>
                )}
              </div>
              {viewMode === 'week' && (
                <span className={`text-xs ml-2 ${isToday(task.date) ? 'bg-blue-500 text-white px-2 py-1 rounded-full' : 'text-gray-500'}`}>
                  {isToday(task.date) ? 'Today' : getDayOfWeek(task.date)}
                </span>
              )}
            </div>
          )}
        </Draggable>
      );
    };
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
            <button
            onClick={resetState}
            className="ml-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Reset All Data
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
                onChange={(e) => setPriorities(prev => prev.map(p => p.id === priority.id ? {...p, title: e.target.value} : p))}
              />
            </div>
            <textarea
              className="w-full p-2 text-sm bg-gray-50 rounded mb-4 focus:outline-none focus:ring-1 focus:ring-blue-300"
              placeholder="Describe successful outcome"
              value={priority.outcome}
              onChange={(e) => setPriorities(prev => prev.map(p => p.id === priority.id ? {...p, outcome: e.target.value} : p))}
              rows="2"
            />
            
            {viewMode === 'today' ? (
            <Droppable droppableId={priority.id.toString()}>
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps}>
                  {getTasksForPriority(priority.id, today).map((task, index) => renderTask(task, index))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ) : (
            renderWeekView(priority)
          )}
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