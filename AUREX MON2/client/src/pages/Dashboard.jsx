import { useState, useEffect } from 'react'
import TaskForm from '../components/TaskForm'
import TaskList from '../components/TaskList'

export default function Dashboard() {
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem("aurex_tasks");
    return saved ? JSON.parse(saved) : [];
  });
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    localStorage.setItem("aurex_tasks", JSON.stringify(tasks));
  }, [tasks]);

  const handleAdd = (newTask) => setTasks([{ id: Date.now(), status: 'Pending', ...newTask }, ...tasks]);
  const handleToggle = (id) => setTasks(tasks.map(t => t.id === id ? { ...t, status: t.status === 'Completed' ? 'Pending' : 'Completed' } : t));
  const handleDelete = (id) => setTasks(tasks.filter(t => t.id !== id));
  const handleEdit = (id, updated) => setTasks(tasks.map(t => t.id === id ? { ...t, ...updated } : t));
  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    window.location.reload();
  };

  const total = tasks.length;
  const completed = tasks.filter(t => t.status === 'Completed').length;
  const pending = total - completed;

  const filteredTasks = tasks.filter(t => {
    if (filter === 'Completed') return t.status === 'Completed';
    if (filter === 'Pending') return t.status === 'Pending';
    return true;
  });

  const btnStyle = (active) => ({
    padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 700,
    border: '1px solid', cursor: 'pointer',
    background: active ? '#16A34A' : '#F0FDF4',
    color: active ? 'white' : '#16A34A',
    borderColor: active ? '#16A34A' : '#BBF7D0'
  });

  const circleBase = {
    borderRadius: '50%', background: 'white', display: 'flex', flexDirection: 'column',
    justifyContent: 'center', alignItems: 'center', cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(22,163,74,0.1)', flexShrink: 0
  };

  return (
    <>
      <style>{`
        .dashboard-wrapper { max-width: 720px; margin: 0 auto; padding: 24px; background: #F0FDF4; min-height: 100vh; }
        .circles-row { display: flex; gap: 18px; justify-content: center; margin-bottom: 32px; flex-wrap: wrap; }
        .circle-item { width: 110px; height: 110px; }
        @media (max-width: 600px) {
          .dashboard-wrapper { padding: 12px; }
          .circles-row { gap: 10px; }
          .circle-item { width: 90px; height: 90px; }
          .circle-item span { font-size: 8px !important; }
          .circle-item h2 { font-size: 24px !important; }
        }
      `}</style>

      <div className="dashboard-wrapper">
        <div style={{ background: '#14532D', padding: '16px 20px', borderRadius: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h1 style={{ margin: 0, color: 'white', fontSize: '20px', fontWeight: 800 }}>AUREX Tasks</h1>
          <button onClick={handleLogout} style={{ background: '#16A34A', color: 'white', border: 'none', padding: '6px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px' }}>Logout</button>
        </div>

        <div className="circles-row">
          <div onClick={() => setFilter('All')} className="circle-item" style={{ ...circleBase, background: filter==='All'?'#14532D':'white', border: '3px solid #16A34A' }}>
            <span style={{ fontSize: '10px', fontWeight: '800', color: filter==='All'?'#86EFAC':'#15803D' }}>TOTAL</span>
            <h2 style={{ margin: '4px 0 0', fontSize: '28px', color: filter==='All'?'white':'#14532D', fontWeight: 800 }}>{total}</h2>
          </div>
          <div onClick={() => setFilter('Completed')} className="circle-item" style={{ ...circleBase, background: filter==='Completed'?'#16A34A':'white', border: '3px solid #4ADE80' }}>
            <span style={{ fontSize: '10px', fontWeight: '800', color: filter==='Completed'?'white':'#16A34A' }}>COMPLETED</span>
            <h2 style={{ margin: '4px 0 0', fontSize: '28px', color: filter==='Completed'?'white':'#16A34A', fontWeight: 800 }}>{completed}</h2>
          </div>
          <div onClick={() => setFilter('Pending')} className="circle-item" style={{ ...circleBase, background: filter==='Pending'?'#FBBF24':'white', border: '3px solid #FBBF24' }}>
            <span style={{ fontSize: '10px', fontWeight: '800', color: filter==='Pending'?'#78350F':'#D97706' }}>PENDING</span>
            <h2 style={{ margin: '4px 0 0', fontSize: '28px', color: filter==='Pending'?'#78350F':'#D97706', fontWeight: 800 }}>{pending}</h2>
          </div>
        </div>

        <div style={{ background: 'white', padding: '20px', borderRadius: '16px', marginBottom: '16px', border: '1px solid #DCFCE7' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '15px', fontWeight: 800, color: '#14532D' }}>New Task</h3>
          <TaskForm onAdd={handleAdd} />
        </div>

        <div style={{ background: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #DCFCE7' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#14532D' }}>My Tasks - {filter}</h3>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button onClick={() => setFilter('All')} style={btnStyle(filter==='All')}>Total</button>
              <button onClick={() => setFilter('Pending')} style={btnStyle(filter==='Pending')}>Pending</button>
              <button onClick={() => setFilter('Completed')} style={btnStyle(filter==='Completed')}>Completed</button>
            </div>
          </div>
          <TaskList tasks={filteredTasks} onToggle={handleToggle} onDelete={handleDelete} onEdit={handleEdit} />
        </div>
                {/* FOOTER */}
        <div style={{ 
          marginTop: '30px', 
          background: '#14532D', 
          color: 'white', 
          padding: '16px 20px', 
          borderRadius: '14px', 
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px'
        }}>
          <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, letterSpacing: '0.5px' }}>
            AUREX Tasks © 2026
          </p>
          <p style={{ margin: 0, fontSize: '11px', color: '#BBF7D0', opacity: 0.9 }}>
            Organize Your Work • Boost Productivity • Internship Project
          </p>
          <div style={{ marginTop: '6px', display: 'flex', justifyContent: 'center', gap: '16px', fontSize: '11px' }}>
            <span style={{ color: '#86EFAC', cursor: 'pointer' }}>Privacy</span>
            <span style={{ color: '#86EFAC', cursor: 'pointer' }}>Terms</span>
            <span style={{ color: '#86EFAC', cursor: 'pointer' }}>Contact</span>
          </div>
        </div>
      </div>
    </>
  )
}