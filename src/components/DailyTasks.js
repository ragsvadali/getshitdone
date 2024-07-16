import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { PlusCircle, CheckCircle, Clock, XCircle, GripVertical, Edit2, Trash2 } from 'lucide-react';

const getCurrentDate = () => new Date().toISOString().split('T')[0];

const DailyTasks = ({ tasks, setTasks, priorities }) => {
  const [selectedDate, setSelectedDate] = useState(getCurrentDate());
  const [newTask, setNewTask] = useState({ title: '', estimatedPomodoros: 0, actualPomodoros: 0, status: 'pending', priority: '' });

  const addTask = () => {
    if (newTask.title) {
      setTasks(prevTasks => ({
        ...prevTasks,
        [selectedDate]: [...(prevTasks[selectedDate] || []), { ...newTask, id: Date.now().toString() }]
      }));
      setNewTask({ title: '', estimatedPomodoros: 0, actualPomodoros: 0, status: 'pending', priority: '' });
    }
  };

  const updateTask = (id, updates) => {
    setTasks(prevTasks => ({
      ...prevTasks,
      [selectedDate]: prevTasks[selectedDate].map(t => t.id === id ? { ...t, ...updates } : t)
    }));
  };

  const deleteTask = (id) => {
    setTasks(prevTasks => ({
      ...prevTasks,
      [selectedDate]: prevTasks[selectedDate].filter(t => t.id !== id)
    }));
  };

  const onDragEnd = (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const newTasks = Array.from(tasks[selectedDate] || []);
    const [reorderedItem] = newTasks.splice(source.index, 1);
    newTasks.splice(destination.index, 0, reorderedItem);

    setTasks(prevTasks => ({
      ...prevTasks,
      [selectedDate]: newTasks
    }));
  };

  const getPriorityTitle = (priorityId) => {
    const priority = priorities.find(p => p.id.toString() === priorityId);
    return priority ? priority.title : 'Unaligned';
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">Daily Tasks</h1>
      <div className="mb-6">
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="input"
        />
      </div>
      <div className="card mb-6">
        <div className="flex flex-col sm:flex-row items-end gap-2">
          <input
            placeholder="New task"
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            className="input flex-grow"
          />
          <input
            type="number"
            placeholder="Est. Pomodoros"
            value={newTask.estimatedPomodoros}
            onChange={(e) => setNewTask({ ...newTask, estimatedPomodoros: parseInt(e.target.value) || 0 })}
            className="input w-32"
          />
          <select
            value={newTask.priority}
            onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
            className="input w-40"
          >
            <option value="">Select priority</option>
            {priorities.map((priority) => (
              <option key={priority.id} value={priority.id.toString()}>
                {priority.title || `${priority.type === 'top' ? 'Top' : 'Secondary'} Priority ${priority.id}`}
              </option>
            ))}
            <option value="unaligned">Unaligned</option>
          </select>
          <button onClick={addTask} className="btn flex items-center">
            <PlusCircle className="mr-2 h-4 w-4" /> Add Task
          </button>
        </div>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="taskList">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {(tasks[selectedDate] || []).map((task, index) => (
                <Draggable key={task.id} draggableId={task.id} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className="card mb-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <GripVertical className="text-gray-400 mr-2" />
                        <h3 className="text-lg font-semibold flex-grow">{task.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold 
                          ${task.status === 'done' ? 'status-done' : 
                            task.status === 'defer' ? 'status-defer' : 
                            task.status === 'delete' ? 'status-delete' : 'status-pending'}`}>
                          {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center">
                          <span className="mr-2">Pomodoros:</span>
                          <input
                            type="number"
                            value={task.actualPomodoros}
                            onChange={(e) => updateTask(task.id, { actualPomodoros: parseInt(e.target.value) || 0 })}
                            className="input w-16 mr-2"
                          />
                          <span>/ {task.estimatedPomodoros}</span>
                        </div>
                        <div className="space-x-2">
                          <button onClick={() => updateTask(task.id, { status: 'done' })} className="btn-icon">
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          </button>
                          <button onClick={() => updateTask(task.id, { status: 'defer' })} className="btn-icon">
                            <Clock className="h-5 w-5 text-yellow-500" />
                          </button>
                          <button onClick={() => deleteTask(task.id)} className="btn-icon">
                            <Trash2 className="h-5 w-5 text-red-500" />
                          </button>
                        </div>
                      </div>
                      <div className="mt-2">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold 
                          ${task.priority === '1' ? 'priority-top' :
                            task.priority === '2' || task.priority === '3' ? 'priority-secondary' :
                            'priority-unaligned'}`}>
                          {getPriorityTitle(task.priority)}
                        </span>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default DailyTasks;