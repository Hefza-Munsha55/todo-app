export default function Footer() {
  const go = (id) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
    else window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="footer" id="contact-section">
      <div className="footer-inner">
        <div className="footer-brand">
          <div className="logo small">A</div>
          <div>
            <h4>AUREX Tasks</h4>
            <p>Manage your work, Efficiently!</p>
          </div>
        </div>

        <div className="footer-links">
          <button onClick={() => go('top')}>Home</button>
          <button onClick={() => go('tasks-section')}>Tasks</button>
          <button onClick={() => go('stats-section')}>About</button>
          <button onClick={() => go('contact-section')}>Contact</button>
        </div>

        <p className="footer-copy">© 2026 AUREX Tasks. All rights reserved.</p>
      </div>
    </footer>
  )
}