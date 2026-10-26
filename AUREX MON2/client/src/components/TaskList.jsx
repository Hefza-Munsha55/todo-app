import TaskItem from './TaskItem'

export default function TaskList({ tasks, onToggle, onDelete, onEdit }) {
  if (tasks.length === 0) {
    return <div className="empty">No tasks found. Add a new one!</div>
  }
  return (
    <div className="task-list">
      {tasks.map(task => (
        <TaskItem key={task.id} task={task} onToggle={onToggle} onDelete={onDelete} onEdit={onEdit} />
      ))}
    </div>
  )
}