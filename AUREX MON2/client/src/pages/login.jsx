import { useState } from "react";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) return alert("Email password likho");
    // Mock login success
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("userEmail", email);
    onLogin();
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f0fdf4' }}>
      <form onSubmit={handleSubmit} style={{ background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', width: '360px' }}>
        <h2 style={{ textAlign: 'center', color: '#16a34a', marginBottom: '10px' }}>AUREX Login</h2>
        <p style={{ textAlign: 'center', color: '#666', marginBottom: '20px', fontSize: '14px' }}>Internship Project</p>
        
        <label className="label">Email</label>
        <input className="input" type="email" placeholder="test@aurex.com" value={email} onChange={e => setEmail(e.target.value)} required />

        <label className="label" style={{ marginTop: '12px', display: 'block' }}>Password</label>
        <input className="input" type="password" placeholder="123456" value={password} onChange={e => setPassword(e.target.value)} required />

        <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '20px' }}>Login</button>
        <p style={{ textAlign: 'center', marginTop: '12px', fontSize: '12px', color: '#888' }}>Koi bhi email/password chalega (Mock)</p>
      </form>
    </div>
  );
}