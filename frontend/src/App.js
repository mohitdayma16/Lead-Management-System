import React, { useState, useEffect } from 'react';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function App(){
  const [token, setToken] = useState(localStorage.getItem('token')||'');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agents, setAgents] = useState([]);
  const [lists, setLists] = useState([]);
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');

  const login = async (e) => {
    e.preventDefault();
    setMessage('');
    try{
      const res = await fetch(API + '/api/auth/login', {
        method:'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if(res.ok){
        setToken(data.token);
        localStorage.setItem('token', data.token);
        setMessage('Logged in');
        fetchAgents(data.token);
        fetchLists(data.token);
      } else {
        setMessage(data.message || 'Login failed');
      }
    }catch(err){ setMessage('Login error'); }
  };

  const fetchAgents = async (t) => {
    try{
      const res = await fetch(API + '/api/agents', { headers: { Authorization: 'Bearer ' + t } });
      const data = await res.json();
      if(res.ok) setAgents(data);
    }catch(err){}
  };

  const fetchLists = async (t) => {
    try{
      const res = await fetch(API + '/api/upload', { headers: { Authorization: 'Bearer ' + t } });
      const data = await res.json();
      if(res.ok) setLists(data);
    }catch(err){}
  };

  useEffect(()=> {
    if(token){
      fetchAgents(token);
      fetchLists(token);
    }
  }, [token]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if(!file){ setMessage('Select file'); return; }
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch(API + '/api/upload', { method:'POST', headers: { Authorization: 'Bearer ' + token }, body: fd });
    const data = await res.json();
    if(res.ok){ setMessage(data.message); fetchLists(token); } else setMessage(data.message || 'Upload failed');
  };

  return (<div style={{padding:20, fontFamily:'Arial'}}>
    {!token ? (
      <div style={{maxWidth:400}}>
        <h2>Admin Login</h2>
        <form onSubmit={login}>
          <div><input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} style={{width:'100%',padding:8}}/></div>
          <div style={{marginTop:8}}><input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} style={{width:'100%',padding:8}}/></div>
          <button style={{marginTop:10,padding:'8px 12px'}}>Login</button>
        </form>
        <p style={{color:'green'}}>{message}</p>
      </div>
    ) : (
      <div>
        <h2>Dashboard</h2>
        <p>Token present. You can add agents using API or curl. Upload CSV/XLSX to distribute lists among first 5 agents.</p>
        <div style={{border:'1px solid #ddd',padding:10,marginTop:10}}>
          <h3>Upload CSV / XLSX</h3>
          <form onSubmit={handleUpload}>
            <input type="file" accept=".csv,.xlsx,.xls" onChange={e=>setFile(e.target.files[0])} />
            <button style={{marginLeft:8}}>Upload</button>
          </form>
          <p>{message}</p>
        </div>
        <div style={{marginTop:20}}>
          <h3>Agents</h3>
          <ul>{agents.map(a=> <li key={a._id}>{a.name} — {a.email} — {a.mobile}</li>)}</ul>
        </div>
        <div style={{marginTop:20}}>
          <h3>Distributed Lists</h3>
          {lists.map(l=> (
            <div key={l._id} style={{border:'1px solid #eee', padding:10, marginBottom:10}}>
              <strong>Agent:</strong> {l.agent.name} ({l.agent.email})<br/>
              <strong>Items:</strong>
              <ul>{l.items.map((it,idx)=> <li key={idx}>{it.firstName} — {it.phone} — {it.notes}</li>)}</ul>
            </div>
          ))}
        </div>
        <button onClick={()=>{ localStorage.removeItem('token'); setToken(''); }}>Logout</button>
      </div>
    )}
  </div>);
}

export default App;
