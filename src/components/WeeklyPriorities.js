import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { CheckCircle, Circle, Plus, ArrowRight, Trash2, Timer, GripVertical, X } from 'lucide-react';


const WeeklyPriorities = ({ priorities, setPriorities, tasks, setTasks, backlogTasks, setBacklogTasks, addTaskToToday }) => {
  const [viewMode, setViewMode] = useState('today');
  const [addingTaskForPriority, setAddingTaskForPriority] = useState(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  //const [viewMode, setViewMode] = useState('today');

  const today = new Date().toISOString().split('T')[0];
  console.log('date is:', today);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { weekday: 'long', day: 'numeric', month: 'long' };
    return date.toLocaleDateString('en-US', options);
  };

  const getTasksForPriority = (priorityId, date) => {
    return (tasks[date] || []).filter(task => task && task.priority === priorityId.toString());
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

  // Adding a new function to get to parity with daily task addition
  const handleAddBacklogTask = () => {
    if (newTaskTitle.trim()) {
      setBacklogTasks(prev => [...prev, { id: Date.now().toString(), title: newTaskTitle.trim() }]);
      setNewTaskTitle('');
      setAddingTaskForPriority(null);
    }
  };


  /* PREV- Adding grippable elements back to Backlog view
  const renderBacklogTasks = () => {
    return (
      <>
        <Droppable droppableId="backlog">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {backlogTasks.map((task, index) => (
                <Draggable key={task.id} draggableId={task.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`flex items-center bg-white p-3 mb-2 rounded shadow ${
                        snapshot.isDragging ? 'bg-gray-100' : ''
                      }`}
                    >
                      <div {...provided.dragHandleProps} className="mr-2 cursor-move">
                        <GripVertical className="w-4 h-4 text-gray-400" />
                      </div>
                      <span className="flex-grow">{task.title}</span>
                      <div className="flex items-center">
                        <select
                          onChange={(e) => {
                            addTaskToToday(task, e.target.value);
                            setBacklogTasks(prevTasks => prevTasks.filter(t => t.id !== task.id));
                          }}
                          className="mr-2 p-1 border rounded"
                        >
                          <option value="">Schedule to...</option>
                          {priorities.map((priority) => (
                            <option key={priority.id} value={priority.id}>
                              {priority.title || `Priority ${priority.id}`}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => setBacklogTasks(prevTasks => prevTasks.filter(t => t.id !== task.id))}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
        {addingTaskForPriority === 'backlog' ? (
          <div className="flex items-center mt-2">
            <input
              type="text"
              placeholder="New task title"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddBacklogTask()}
              className="flex-grow text-sm p-1 border rounded mr-2"
              autoFocus
            />
            <button onClick={handleAddBacklogTask} className="text-green-500 hover:text-green-700">
              <Plus className="w-5 h-5" />
            </button>
            <button onClick={() => setAddingTaskForPriority(null)} className="text-red-500 hover:text-red-700 ml-2">
              <X className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <button 
            onClick={() => setAddingTaskForPriority('backlog')} 
            className="text-sm text-blue-500 hover:text-blue-700 mt-2 flex items-center"
          >
            <Plus className="w-4 h-4 mr-1" /> Add task
          </button>
        )}
      </>
    );
  }; */

  // NEW version to add an always available text input box
  // Changed elements of className for button: to bg-white, text-green, hover:bg-green-400
  // Removed focus:ring-2 fron className for input
  // Also editing the dropdown to have a calendar icon ...
  const renderBacklogTasks = () => {
    return (
      <>
        <div className="mb-4 flex items-center">
          <input
            type="text"
            placeholder="Add a new task to backlog"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && newTaskTitle.trim()) {
                handleAddBacklogTask();
              }
            }}
            className="flex-grow text-sm p-2 border rounded-l focus:outline-none focus:ring-blue-300"
          />
          <button 
            onClick={handleAddBacklogTask} 
            className="bg-white 
                      text-green 
                      p-2 
                      border
                      rounded-r 
                      hover:bg-green-400
                      focus:outline-none 
                      focus:ring-2 
                      focus:ring-green-300"
            disabled={!newTaskTitle.trim()}
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
        <Droppable droppableId="backlog">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {backlogTasks.map((task, index) => (
                <Draggable key={task.id} draggableId={task.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`flex items-center bg-white p-3 mb-2 rounded shadow ${
                        snapshot.isDragging ? 'bg-gray-100' : ''
                      }`}
                    >
                      <div {...provided.dragHandleProps} className="mr-2 cursor-move">
                        <GripVertical className="w-4 h-4 text-gray-400" />
                      </div>
                      <span className="flex-grow">{task.title}</span>
                      <div className="flex items-center">
                        <select
                          onChange={(e) => {
                            addTaskToToday(task, e.target.value);
                            setBacklogTasks(prevTasks => prevTasks.filter(t => t.id !== task.id));
                          }}
                          className="mr-2 p-1 text-gray-500 text-sm text-right rounded"
                          defaultValue=""
                        >
                          <option value="" disabled>Move
                            </option>
                          {priorities.map((priority) => (
                            <option key={priority.id} value={priority.id}>
                              {priority.title || `Priority ${priority.id}`}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => setBacklogTasks(prevTasks => prevTasks.filter(t => t.id !== task.id))}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </>
    );
  };


  // NEW version to fix dragging?
  const onDragEnd = (result) => {
    const { source, destination } = result;
  
    if (!destination) {
      return;
    }
  
    if (viewMode === 'backlog') {
      // Handle reordering in backlog
      setBacklogTasks(prevTasks => {
        const newTasks = Array.from(prevTasks);
        const [reorderedItem] = newTasks.splice(source.index, 1);
        newTasks.splice(destination.index, 0, reorderedItem);
        return newTasks;
      });
    } else if (viewMode === 'today') {
      // Handle reordering in today's tasks
      if (source.droppableId !== destination.droppableId) {
        console.log('Attempted to move task between priorities. This is not allowed.');
        return;
      }
  
      const today = new Date().toISOString().split('T')[0];
      setTasks(prevTasks => {
        const currentTasks = prevTasks[today] || [];
        const priorityTasks = currentTasks.filter(task => task.priority === source.droppableId);
        
        const newPriorityTasks = Array.from(priorityTasks);
        const [reorderedItem] = newPriorityTasks.splice(source.index, 1);
        newPriorityTasks.splice(destination.index, 0, reorderedItem);
  
        const newTasks = currentTasks.map(task => 
          task.priority === source.droppableId
            ? newPriorityTasks.shift() || task
            : task
        );
  
        return {
          ...prevTasks,
          [today]: newTasks
        };
      });
    }
  };

  const renderTask = (task, index) => {
    if (!task) return null;
  
    const handleToggleStatus = () => {
      toggleTaskStatus(task.id, task.date);
    };
  
    const taskContent = (
      <>
        <button onClick={handleToggleStatus} className="mr-2 flex-shrink-0">
          {task.status === 'done' ? (
            <CheckCircle className="w-4 h-4 text-green-500" />
          ) : (
            <Circle className="w-4 h-4 text-gray-300" />
          )}
        </button>
        <span className={`flex-grow ${task.status === 'done' ? 'text-gray-500 line-through' : ''}`}>
          {task.title}
        </span>
        {task.completedPomodoros > 0 && (
          <span className="text-xs text-gray-600 ml-2">
            <Timer className="w-4 h-4 inline-block mr-1" />
            {task.completedPomodoros}
          </span>
        )}
      </>
    );
  
    if (viewMode === 'today') {
      return (
        <Draggable key={`${task.id}-${task.priority}`} draggableId={task.id} index={index}>
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.draggableProps}
              {...provided.dragHandleProps}
              className={`flex items-center text-sm mb-2 ${snapshot.isDragging ? 'bg-gray-100' : ''}`}
            >
              <GripVertical className="w-4 h-4 text-gray-400 mr-2" />
              {taskContent}
              <div className="flex items-center ml-2">
                <button onClick={() => addPomodoro(task.id, task.date)} className="text-gray-400 hover:text-gray-600 mr-2">
                  <Plus className="w-4 h-4" />
                </button>
                <button onClick={() => deferTask(task.id, task.date)} className="text-blue-500 hover:text-blue-700 mr-2">
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button onClick={() => deleteTask(task.id, task.date)} className="text-red-500 hover:text-red-700">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </Draggable>
      );
    } else {
      const isToday = task.date === today;
      const taskDate = new Date(task.date);
      const dayOfWeek = taskDate.toLocaleDateString('en-US', { weekday: 'short' });
      
      return (
        <div key={`${task.id}-${task.priority}`} className="flex items-center text-sm mb-2">
          {taskContent}
          <span className={`text-xs ml-2 ${isToday ? 'bg-blue-500 text-white px-2 py-1 rounded-full' : 'text-gray-500'}`}>
            {isToday ? 'Today' : dayOfWeek}
          </span>
        </div>
      );
    }
  };
  
  const renderWeekView = (priority) => {
    const startOfWeek = new Date(today);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);
  
    const weekTasks = Object.entries(tasks)
      .filter(([date]) => {
        const taskDate = new Date(date);
        return taskDate >= startOfWeek && taskDate <= endOfWeek;
      })
      .flatMap(([date, dateTasks]) => 
        dateTasks.filter(task => task && task.priority === priority.id.toString())
      )
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  
    return (
      <div>
        {weekTasks.map((task, index) => renderTask(task, index))}
      </div>
    );
  };

  // Adding a return function that uses the new renderBacklogTasks() function
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="max-w-4xl mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">
            Get Shit Done /  <span className="text-xl font-light text-gray-400">{formatDate(today)}</span>
          </h1>
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
              className={`px-4 py-2 rounded-full text-sm font-medium ${viewMode === 'backlog' ? 'bg-blue-500 text-white' : 'text-gray-700'}`}
              onClick={() => setViewMode('backlog')}
            >
              Backlog
            </button>
          </div>
        </div>

        {viewMode === 'backlog' ? (
          renderBacklogTasks()
        ) : (
          priorities.map((priority) => (
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
          ))
        )}
      </div>
    </DragDropContext>
  ); 
};

export default WeeklyPriorities;