import { useState } from 'react'

export default function TaskForm({ onAdd }) {
  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')
  const [priority, setPriority] = useState('Medium')
  const [due, setDue] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!title.trim()) return
    onAdd({ title, desc, priority, due })
    setTitle(''); setDesc(''); setPriority('Medium'); setDue('')
  }

  return (
    <form onSubmit={handleSubmit} className="form-card">
      <h3 className="form-title">New Task</h3>
      <label className="label">Task Title</label>
      <input className="input" placeholder="e.g. Complete project report" value={title} onChange={e => setTitle(e.target.value)} required />

      <label className="label">Description</label>
      <textarea className="input" style={{ minHeight: '70px' }} placeholder="Add details..." value={desc} onChange={e => setDesc(e.target.value)} />

      <div className="row">
        <div style={{ flex: 1 }}>
          <label className="label">Priority</label>
          <select className="input" value={priority} onChange={e => setPriority(e.target.value)}>
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <label className="label">Due Date</label>
          <input className="input" type="date" value={due} onChange={e => setDue(e.target.value)} />
        </div>
      </div>

      <button type="submit" className="btn-primary">+ Add Task</button>
    </form>
  )
}