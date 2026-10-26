export default function Header({ search, setSearch }) {
  return (
    <header className="header">
      <div className="header-inner">
        <div className="logo-wrap">
          <div className="logo">A</div>
          <div>
            <h1 className="header-title">AUREX Tasks</h1>
            <p className="header-sub">Manage your work, Efficiently!</p>
          </div>
        </div>
        <input className="search" placeholder="Search tasks..." value={search} onChange={e => setSearch(e.target.value)} />
        <div className="avatar">H</div>
      </div>
    </header>
  )
}