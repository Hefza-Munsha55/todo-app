import { useState } from 'react'

export default function TaskItem({ task, onToggle, onDelete, onEdit }) {
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(task.title)
  const [editDesc, setEditDesc] = useState(task.desc)
  const [editPriority, setEditPriority] = useState(task.priority)

  const isCompleted = task.status === 'Completed'

  const handleSave = () => {
    if (!editTitle.trim()) return
    onEdit(task.id, { title: editTitle, desc: editDesc, priority: editPriority })
    setIsEditing(false)
  }

  if (isEditing) {
    return (
      <div className="task-card">
        <div className="edit-box">
          <label className="label">Title</label>
          <input className="input" value={editTitle} onChange={e => setEditTitle(e.target.value)} />

          <label className="label">Description</label>
          <textarea className="input" value={editDesc} onChange={e => setEditDesc(e.target.value)} />

          <label className="label">Priority</label>
          <select className="input" value={editPriority} onChange={e => setEditPriority(e.target.value)}>
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>

          <div className="edit-actions">
            <button onClick={handleSave} className="btn-save">Save</button>
            <button onClick={() => setIsEditing(false)} className="btn-cancel">Cancel</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`task-card ${isCompleted ? 'completed' : ''}`} style={{ borderLeft: `4px solid ${task.priority === 'High' ? 'var(--red)' : task.priority === 'Medium' ? 'var(--amber)' : 'var(--green)'}` }}>
      <input type="checkbox" checked={isCompleted} onChange={() => onToggle(task.id)} className="checkbox" />
      <div style={{ flex: 1 }}>
        <h4 className={`task-title ${isCompleted ? 'line' : ''}`}>{task.title}</h4>
        {task.desc && <p className="task-desc">{task.desc}</p>}
        <div className="meta">
          <span className={`badge badge-${task.priority.toLowerCase()}`}>{task.priority}</span>
          <span className="badge badge-status">{task.status}</span>
          {task.due && <span className="due">Due: {task.due}</span>}
        </div>
      </div>
      <div className="task-actions">
        <button onClick={() => setIsEditing(true)} className="btn-edit">Edit</button>
        <button onClick={() => onDelete(task.id)} className="btn-delete">Delete</button>
      </div>
    </div>
  )
}