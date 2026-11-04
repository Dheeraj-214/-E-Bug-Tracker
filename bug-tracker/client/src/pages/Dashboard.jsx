import { useEffect, useState } from 'react';
import api from '../api';

const empty = { title: '', description: '', severity: 'Medium' };
const STATUSES = ['Open', 'In Progress', 'Resolved', 'Closed'];
const SEVERITIES = ['Low', 'Medium', 'High', 'Critical'];

export default function Dashboard({ user, logout }) {
  const [bugs, setBugs] = useState([]);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(empty);
  const [filter, setFilter] = useState({ status: '', severity: '', search: '' });

  const load = async () => {
    const { data } = await api.get('/bugs', { params: filter });
    setBugs(data);
  };

  useEffect(() => { load(); }, [filter]);
  useEffect(() => { api.get('/auth/users').then((r) => setUsers(r.data)); }, []);

  const addBug = async (e) => {
    e.preventDefault();
    await api.post('/bugs', form);
    setForm(empty);
    load();
  };
  const update = async (id, patch) => { await api.put('/bugs/' + id, patch); load(); };
  const remove = async (id) => {
    if (!confirm('Delete this bug?')) return;
    try { await api.delete('/bugs/' + id); load(); }
    catch (err) { alert(err.response?.data?.message); }
  };

  const count = (s) => bugs.filter((b) => b.status === s).length;

  return (
    <div className="container">
      <header>
        <h2>🐞 Bug Tracker</h2>
        <div>Hi, {user.name} <button onClick={logout}>Logout</button></div>
      </header>

      <div className="stats">
        {STATUSES.map((s) => <div key={s} className="stat"><b>{count(s)}</b><span>{s}</span></div>)}
      </div>

      <form className="card" onSubmit={addBug}>
        <h3>Report a bug</h3>
        <input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        <textarea placeholder="Describe the bug (steps to reproduce...)" value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })} required />
        <select value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })}>
          {SEVERITIES.map((s) => <option key={s}>{s}</option>)}
        </select>
        <button>Add Bug</button>
      </form>

      <div className="filters">
        <input placeholder="Search title..." onChange={(e) => setFilter({ ...filter, search: e.target.value })} />
        <select onChange={(e) => setFilter({ ...filter, status: e.target.value })}>
          <option value="">All status</option>
          {STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
        <select onChange={(e) => setFilter({ ...filter, severity: e.target.value })}>
          <option value="">All severity</option>
          {SEVERITIES.map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>

      {bugs.length === 0 && <p>No bugs found 🎉</p>}

      {bugs.map((b) => (
        <div className="card bug" key={b._id}>
          <div className="row">
            <h3>{b.title}</h3>
            <span className={'tag ' + b.severity}>{b.severity}</span>
          </div>
          <p>{b.description}</p>
          <small>Reported by {b.reportedBy?.name} on {new Date(b.createdAt).toLocaleDateString()}</small>

          <div className="row">
            <label>Status
              <select value={b.status} onChange={(e) => update(b._id, { status: e.target.value })}>
                {STATUSES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </label>
            <label>Assigned to
              <select value={b.assignedTo?._id || ''} onChange={(e) => update(b._id, { assignedTo: e.target.value })}>
                <option value="">Unassigned</option>
                {users.map((u) => <option key={u._id} value={u._id}>{u.name}</option>)}
              </select>
            </label>
          </div>

          <textarea placeholder="Write the solution/fix here (saves when you click outside)"
            defaultValue={b.solution}
            onBlur={(e) => e.target.value !== b.solution && update(b._id, { solution: e.target.value })} />

          <button className="danger" onClick={() => remove(b._id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}