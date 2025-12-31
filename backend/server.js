
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
const pool = new Pool({
  user: process.env.DB_USER || 'taskflow',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'taskflow_db',
  password: process.env.DB_PASSWORD || 'secure_password',
  port: process.env.DB_PORT || 5432,
});

// --- DATABASE INITIALIZATION & MIGRATION ---
const initDB = async () => {
  try {
    // 1. Create Tables
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        role VARCHAR(50),
        bio TEXT,
        telegram_chat_id VARCHAR(50)
      );
      CREATE TABLE IF NOT EXISTS todos (
        id VARCHAR(255) PRIMARY KEY,
        text TEXT,
        priority VARCHAR(50),
        due_date VARCHAR(50),
        tags TEXT[],
        description TEXT,
        status VARCHAR(50),
        created_at BIGINT,
        start_date VARCHAR(50),
        is_ai_generated BOOLEAN DEFAULT FALSE
      );
      CREATE TABLE IF NOT EXISTS goals (
        id VARCHAR(255) PRIMARY KEY,
        title VARCHAR(255),
        category VARCHAR(50),
        progress INTEGER,
        milestones JSONB,
        description TEXT
      );
      CREATE TABLE IF NOT EXISTS books (
        id VARCHAR(255) PRIMARY KEY,
        title VARCHAR(255),
        author VARCHAR(255),
        status VARCHAR(50),
        rating INTEGER,
        cover_color VARCHAR(50),
        total_pages INTEGER,
        current_page INTEGER,
        genre VARCHAR(50)
      );
      CREATE TABLE IF NOT EXISTS finance (
        id VARCHAR(255) PRIMARY KEY,
        description TEXT,
        amount DECIMAL,
        type VARCHAR(20),
        date VARCHAR(50),
        category VARCHAR(50)
      );
      CREATE TABLE IF NOT EXISTS habits (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255),
        streak INTEGER,
        completed_today BOOLEAN,
        history BOOLEAN[]
      );
      CREATE TABLE IF NOT EXISTS pages (
        id VARCHAR(255) PRIMARY KEY,
        content TEXT
      );
      CREATE TABLE IF NOT EXISTS journal (
        id VARCHAR(255) PRIMARY KEY,
        content TEXT,
        mood VARCHAR(50),
        date VARCHAR(50)
      );
      CREATE TABLE IF NOT EXISTS projects (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255),
        status VARCHAR(50),
        due_date VARCHAR(50),
        description TEXT,
        progress INTEGER DEFAULT 0,
        team_members TEXT[],
        tags TEXT[]
      );
      CREATE TABLE IF NOT EXISTS chat_messages (
        id VARCHAR(255) PRIMARY KEY,
        sender_id VARCHAR(255),
        receiver_id VARCHAR(255),
        text TEXT,
        timestamp BIGINT,
        is_read BOOLEAN
      );
      CREATE TABLE IF NOT EXISTS app_config (
        id INT PRIMARY KEY,
        disabled_modules TEXT[]
      );
      CREATE TABLE IF NOT EXISTS meetings (
        id VARCHAR(255) PRIMARY KEY,
        title VARCHAR(255),
        date VARCHAR(50),
        attendees TEXT[],
        content TEXT,
        type VARCHAR(50)
      );
      CREATE TABLE IF NOT EXISTS wiki_docs (
        id VARCHAR(255) PRIMARY KEY,
        title VARCHAR(255),
        content TEXT,
        last_updated VARCHAR(50),
        author VARCHAR(50),
        category VARCHAR(50)
      );
      CREATE TABLE IF NOT EXISTS travel_trips (
        id VARCHAR(255) PRIMARY KEY,
        destination VARCHAR(255),
        dates VARCHAR(50),
        status VARCHAR(50),
        budget DECIMAL,
        itinerary JSONB
      );
      CREATE TABLE IF NOT EXISTS archive (
        id VARCHAR(255) PRIMARY KEY,
        original_id VARCHAR(255),
        type VARCHAR(50),
        title VARCHAR(255),
        archived_at VARCHAR(50)
      );
    `);

    // 2. Seed Users (Admin & User)
    const seedUsers = async () => {
        try {
            const adminCheck = await pool.query("SELECT * FROM users WHERE email = 'admin@taskflow.app'");
            if (adminCheck.rows.length === 0) {
                await pool.query("INSERT INTO users (id, email, password, name, role, bio) VALUES ($1, $2, $3, $4, $5, $6)",
                    ['1', 'admin@taskflow.app', 'admin123', 'Admin User', 'admin', 'System Administrator']
                );
                console.log("------------------------------------------------");
                console.log("✅ Admin Account Created");
                console.log("   Email:    admin@taskflow.app");
                console.log("   Password: admin123");
                console.log("------------------------------------------------");
            }

            const userCheck = await pool.query("SELECT * FROM users WHERE email = 'user@taskflow.app'");
            if (userCheck.rows.length === 0) {
                await pool.query("INSERT INTO users (id, email, password, name, role, bio) VALUES ($1, $2, $3, $4, $5, $6)",
                    ['2', 'user@taskflow.app', 'user123', 'Regular User', 'user', 'Productivity Enthusiast']
                );
                console.log("✅ Regular User Account Created");
                console.log("   Email:    user@taskflow.app");
                console.log("   Password: user123");
                console.log("------------------------------------------------");
            }
        } catch (err) {
            console.error("Error seeding users:", err);
        }
    };
    await seedUsers();

    console.log("🚀 Database Initialized Successfully");
  } catch (err) {
    console.error("❌ Error initializing database tables:", err);
  }
};

// Initialize DB on startup
initDB();

// --- ROUTES ---

// AUTH
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if (result.rows.length > 0) {
            const user = result.rows[0];
            if (user.password === password) {
                 res.json({
                     id: user.id,
                     name: user.name,
                     email: user.email,
                     role: user.role === 'admin' ? 'Workspace Owner' : 'Team Member', 
                     accessLevel: user.role, // 'admin' or 'user'
                     bio: user.bio,
                     telegramChatId: user.telegram_chat_id || ''
                 });
                 return;
            }
        }
        res.status(401).json({ error: "Invalid email or password" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// USER MANAGEMENT (ADMIN)
app.get('/api/users', async (req, res) => {
  try {
    const result = await pool.query("SELECT id, name, email, role, bio, telegram_chat_id as telegramChatId FROM users ORDER BY name ASC");
    const mapped = result.rows.map(u => ({
        ...u,
        accessLevel: u.role,
        role: u.role === 'admin' ? 'Workspace Owner' : 'Team Member'
    }));
    res.json(mapped);
  } catch (err) { res.status(500).send(err.message); }
});

app.post('/api/users', async (req, res) => {
  const { id, name, email, password, role } = req.body;
  try {
    const result = await pool.query(
        "INSERT INTO users (id, name, email, password, role, bio) VALUES ($1, $2, $3, $4, $5, 'New Member') RETURNING id, name, email, role",
        [id, name, email, password, role]
    );
    res.json(result.rows[0]);
  } catch (err) { res.status(500).send(err.message); }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
      const user = await pool.query("SELECT email FROM users WHERE id = $1", [req.params.id]);
      if (user.rows.length > 0 && user.rows[0].email === 'admin@taskflow.app') {
          return res.status(403).json({ error: "Cannot delete the root admin." });
      }
      await pool.query("DELETE FROM users WHERE id = $1", [req.params.id]);
      res.json({ message: "User deleted" });
  } catch (err) { res.status(500).send(err.message); }
});

// CONFIG
app.get('/api/config', async (req, res) => {
  try {
    const result = await pool.query('SELECT disabled_modules FROM app_config WHERE id = 1');
    if (result.rows.length > 0) {
      res.json({ disabledModules: result.rows[0].disabled_modules || [] });
    } else {
      res.json({ disabledModules: [] });
    }
  } catch (err) {
    res.json({ disabledModules: [] });
  }
});

app.post('/api/config', async (req, res) => {
  const { disabledModules } = req.body;
  try {
    await pool.query(
      'INSERT INTO app_config (id, disabled_modules) VALUES (1, $1) ON CONFLICT (id) DO UPDATE SET disabled_modules = $1',
      [disabledModules]
    );
    res.json({ disabledModules });
  } catch (err) { res.status(500).send(err.message); }
});

// TODOS
app.get('/api/todos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM todos ORDER BY created_at DESC');
    const mapped = result.rows.map(row => ({
        ...row,
        completed: row.status === 'done',
        dueDate: row.due_date,
        startDate: row.start_date,
        createdAt: parseInt(row.created_at),
        isAiGenerated: row.is_ai_generated
    }));
    res.json(mapped);
  } catch (err) { res.status(500).send(err.message); }
});

app.post('/api/todos', async (req, res) => {
  const { id, text, priority, dueDate, tags, description, status, startDate, isAiGenerated } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO todos (id, text, priority, due_date, tags, description, status, created_at, start_date, is_ai_generated) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
      [id, text, priority, dueDate, tags, description, status || 'todo', Date.now(), startDate, isAiGenerated || false]
    );
    const row = result.rows[0];
    res.json({ ...row, completed: row.status === 'done', dueDate: row.due_date, startDate: row.start_date });
  } catch (err) { res.status(500).send(err.message); }
});

app.post('/api/todos/batch', async (req, res) => {
  const { todos } = req.body;
  if (!todos || !Array.isArray(todos)) return res.status(400).send('Invalid input');
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const queryText = 'INSERT INTO todos (id, text, priority, due_date, tags, description, status, created_at, start_date, is_ai_generated) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)';
    for (const todo of todos) {
      await client.query(queryText, [todo.id, todo.text, todo.priority, todo.dueDate, todo.tags, todo.description, todo.status || 'todo', Date.now(), todo.startDate, todo.isAiGenerated || false]);
    }
    await client.query('COMMIT');
    res.json({ success: true, count: todos.length });
  } catch (e) {
    await client.query('ROLLBACK');
    res.status(500).send(e.message);
  } finally {
    client.release();
  }
});

app.put('/api/todos/:id', async (req, res) => {
  const { id } = req.params;
  const { status, text, priority, dueDate, description, startDate } = req.body;
  try {
    const result = await pool.query(
      'UPDATE todos SET status = $1, text = $2, priority = $3, due_date = $4, description = $5, start_date = $6 WHERE id = $7 RETURNING *',
      [status, text, priority, dueDate, description, startDate, id]
    );
    const row = result.rows[0];
    res.json({ ...row, completed: row.status === 'done', dueDate: row.due_date, startDate: row.start_date });
  } catch (err) { res.status(500).send(err.message); }
});

app.delete('/api/todos/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM todos WHERE id = $1', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).send(err.message); }
});

// GENERIC RESOURCES (Goals, Books, Finance, etc)
// Goals
app.get('/api/goals', async (req, res) => {
  try { const r = await pool.query('SELECT * FROM goals'); res.json(r.rows); } catch (e) { res.status(500).send(e.message); }
});
app.post('/api/goals', async (req, res) => {
  const { id, title, category, progress, milestones, description } = req.body;
  try { const r = await pool.query('INSERT INTO goals (id, title, category, progress, milestones, description) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *', [id, title, category, progress, JSON.stringify(milestones), description]); res.json(r.rows[0]); } catch (e) { res.status(500).send(e.message); }
});
app.put('/api/goals/:id', async (req, res) => {
  const { progress, milestones, title } = req.body;
  try { const r = await pool.query('UPDATE goals SET progress = $1, milestones = $2, title = $3 WHERE id = $4 RETURNING *', [progress, JSON.stringify(milestones), title, req.params.id]); res.json(r.rows[0]); } catch (e) { res.status(500).send(e.message); }
});
app.delete('/api/goals/:id', async (req, res) => { try { await pool.query('DELETE FROM goals WHERE id=$1', [req.params.id]); res.json({message:'Deleted'}); } catch(e){ res.status(500).send(e.message); }});

// Books
app.get('/api/books', async (req, res) => {
  try { const r = await pool.query('SELECT * FROM books'); res.json(r.rows.map(b => ({...b, coverColor: b.cover_color, totalPages: b.total_pages, currentPage: b.current_page}))); } catch (e) { res.status(500).send(e.message); }
});
app.post('/api/books', async (req, res) => {
  const { id, title, author, status, rating, coverColor, totalPages, currentPage, genre } = req.body;
  try { const r = await pool.query('INSERT INTO books (id, title, author, status, rating, cover_color, total_pages, current_page, genre) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *', [id, title, author, status, rating, coverColor, totalPages, currentPage, genre]); res.json({...r.rows[0], coverColor: r.rows[0].cover_color, totalPages: r.rows[0].total_pages, currentPage: r.rows[0].current_page}); } catch (e) { res.status(500).send(e.message); }
});
app.put('/api/books/:id', async (req, res) => {
  const { status, rating, currentPage } = req.body;
  try { const r = await pool.query('UPDATE books SET status=$1, rating=$2, current_page=$3 WHERE id=$4 RETURNING *', [status, rating, currentPage, req.params.id]); res.json({...r.rows[0], coverColor: r.rows[0].cover_color, totalPages: r.rows[0].total_pages, currentPage: r.rows[0].current_page}); } catch (e) { res.status(500).send(e.message); }
});
app.delete('/api/books/:id', async (req, res) => { try { await pool.query('DELETE FROM books WHERE id=$1', [req.params.id]); res.json({message:'Deleted'}); } catch(e){ res.status(500).send(e.message); }});

// Finance
app.get('/api/finance', async (req, res) => { try { const r = await pool.query('SELECT * FROM finance ORDER BY date DESC'); res.json(r.rows); } catch (e) { res.status(500).send(e.message); } });
app.post('/api/finance', async (req, res) => { const { id, description, amount, type, date, category } = req.body; try { const r = await pool.query('INSERT INTO finance (id, description, amount, type, date, category) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *', [id, description, amount, type, date, category]); res.json(r.rows[0]); } catch (e) { res.status(500).send(e.message); } });
app.delete('/api/finance/:id', async (req, res) => { try { await pool.query('DELETE FROM finance WHERE id=$1', [req.params.id]); res.json({message:'Deleted'}); } catch(e){ res.status(500).send(e.message); }});

// Habits
app.get('/api/habits', async (req, res) => { try { const r = await pool.query('SELECT * FROM habits'); res.json(r.rows.map(h => ({...h, completedToday: h.completed_today}))); } catch (e) { res.status(500).send(e.message); } });
app.post('/api/habits', async (req, res) => { const { id, name } = req.body; try { const r = await pool.query('INSERT INTO habits (id, name, streak, completed_today) VALUES ($1, $2, 0, false) RETURNING *', [id, name]); res.json({...r.rows[0], completedToday: false}); } catch (e) { res.status(500).send(e.message); } });
app.put('/api/habits/:id', async (req, res) => { const { streak, completedToday } = req.body; try { const r = await pool.query('UPDATE habits SET streak=$1, completed_today=$2 WHERE id=$3 RETURNING *', [streak, completedToday, req.params.id]); res.json({...r.rows[0], completedToday: r.rows[0].completed_today}); } catch (e) { res.status(500).send(e.message); } });
app.delete('/api/habits/:id', async (req, res) => { try { await pool.query('DELETE FROM habits WHERE id=$1', [req.params.id]); res.json({message:'Deleted'}); } catch(e){ res.status(500).send(e.message); }});

// Meetings
app.get('/api/meetings', async (req, res) => { try { const r = await pool.query('SELECT * FROM meetings ORDER BY date DESC'); res.json(r.rows); } catch (e) { res.status(500).send(e.message); } });
app.post('/api/meetings', async (req, res) => { const { id, title, date, attendees, content, type } = req.body; try { const r = await pool.query('INSERT INTO meetings (id, title, date, attendees, content, type) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *', [id, title, date, attendees, content, type]); res.json(r.rows[0]); } catch (e) { res.status(500).send(e.message); } });
app.put('/api/meetings/:id', async (req, res) => { const { title, date, attendees, content, type } = req.body; try { const r = await pool.query('UPDATE meetings SET title=$1, date=$2, attendees=$3, content=$4, type=$5 WHERE id=$6 RETURNING *', [title, date, attendees, content, type, req.params.id]); res.json(r.rows[0]); } catch (e) { res.status(500).send(e.message); } });
app.delete('/api/meetings/:id', async (req, res) => { try { await pool.query('DELETE FROM meetings WHERE id=$1', [req.params.id]); res.json({message:'Deleted'}); } catch(e){ res.status(500).send(e.message); }});

// Wiki
app.get('/api/wiki', async (req, res) => { try { const r = await pool.query('SELECT * FROM wiki_docs'); res.json(r.rows.map(d => ({...d, lastUpdated: d.last_updated}))); } catch (e) { res.status(500).send(e.message); } });
app.post('/api/wiki', async (req, res) => { const { id, title, content, lastUpdated, author, category } = req.body; try { const r = await pool.query('INSERT INTO wiki_docs (id, title, content, last_updated, author, category) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *', [id, title, content, lastUpdated, author, category]); res.json({...r.rows[0], lastUpdated: r.rows[0].last_updated}); } catch (e) { res.status(500).send(e.message); } });
app.put('/api/wiki/:id', async (req, res) => { const { title, content, lastUpdated, author, category } = req.body; try { const r = await pool.query('UPDATE wiki_docs SET title=$1, content=$2, last_updated=$3, author=$4, category=$5 WHERE id=$6 RETURNING *', [title, content, lastUpdated, author, category, req.params.id]); res.json({...r.rows[0], lastUpdated: r.rows[0].last_updated}); } catch (e) { res.status(500).send(e.message); } });
app.delete('/api/wiki/:id', async (req, res) => { try { await pool.query('DELETE FROM wiki_docs WHERE id=$1', [req.params.id]); res.json({message:'Deleted'}); } catch(e){ res.status(500).send(e.message); }});

// Travel
app.get('/api/travel', async (req, res) => { try { const r = await pool.query('SELECT * FROM travel_trips'); res.json(r.rows); } catch (e) { res.status(500).send(e.message); } });
app.post('/api/travel', async (req, res) => { const { id, destination, dates, status, budget, itinerary } = req.body; try { const r = await pool.query('INSERT INTO travel_trips (id, destination, dates, status, budget, itinerary) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *', [id, destination, dates, status, budget, JSON.stringify(itinerary)]); res.json(r.rows[0]); } catch (e) { res.status(500).send(e.message); } });
app.delete('/api/travel/:id', async (req, res) => { try { await pool.query('DELETE FROM travel_trips WHERE id=$1', [req.params.id]); res.json({message:'Deleted'}); } catch(e){ res.status(500).send(e.message); }});

// Archive
app.get('/api/archive', async (req, res) => { try { const r = await pool.query('SELECT * FROM archive'); res.json(r.rows.map(a => ({...a, originalId: a.original_id, archivedAt: a.archived_at}))); } catch (e) { res.status(500).send(e.message); } });
app.post('/api/archive', async (req, res) => { const { id, originalId, type, title, archivedAt } = req.body; try { const r = await pool.query('INSERT INTO archive (id, original_id, type, title, archived_at) VALUES ($1, $2, $3, $4, $5) RETURNING *', [id, originalId, type, title, archivedAt]); res.json({...r.rows[0], originalId: r.rows[0].original_id, archivedAt: r.rows[0].archived_at}); } catch (e) { res.status(500).send(e.message); } });
app.delete('/api/archive/:id', async (req, res) => { try { await pool.query('DELETE FROM archive WHERE id=$1', [req.params.id]); res.json({message:'Deleted'}); } catch(e){ res.status(500).send(e.message); }});

// Pages
app.get('/api/pages/:id', async (req, res) => { try { const r = await pool.query('SELECT content FROM pages WHERE id=$1', [req.params.id]); if(r.rows.length>0) res.json(r.rows[0]); else res.status(404).send('Not found'); } catch (e) { res.status(500).send(e.message); } });
app.post('/api/pages/:id', async (req, res) => { const { content } = req.body; try { const check = await pool.query('SELECT * FROM pages WHERE id=$1', [req.params.id]); if(check.rows.length>0) await pool.query('UPDATE pages SET content=$1 WHERE id=$2', [content, req.params.id]); else await pool.query('INSERT INTO pages (id, content) VALUES ($1, $2)', [req.params.id, content]); res.json({success:true}); } catch (e) { res.status(500).send(e.message); } });

// Journal
app.get('/api/journal/today', async (req, res) => { try { const r = await pool.query('SELECT * FROM journal ORDER BY date DESC LIMIT 1'); res.json(r.rows[0] || {}); } catch (e) { res.status(500).send(e.message); } });
app.post('/api/journal/today', async (req, res) => { const { content, mood } = req.body; const date = new Date().toISOString().split('T')[0]; try { const check = await pool.query('SELECT * FROM journal WHERE date=$1', [date]); if(check.rows.length>0) await pool.query('UPDATE journal SET content=$1, mood=$2 WHERE date=$3', [content, mood, date]); else await pool.query('INSERT INTO journal (id, content, mood, date) VALUES ($1, $2, $3, $4)', [Math.random().toString(36).substring(7), content, mood, date]); res.json({success:true}); } catch (e) { res.status(500).send(e.message); } });

// Projects
app.get('/api/projects', async (req, res) => { try { const r = await pool.query('SELECT * FROM projects'); res.json(r.rows.map(p => ({...p, dueDate: p.due_date, teamMembers: p.team_members||[], tags: p.tags||[]}))); } catch (e) { res.status(500).send(e.message); } });
app.post('/api/projects', async (req, res) => { const { id, name, status, dueDate, description, progress, teamMembers, tags } = req.body; try { const r = await pool.query('INSERT INTO projects (id, name, status, due_date, description, progress, team_members, tags) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *', [id, name, status, dueDate, description, progress, teamMembers, tags]); res.json({...r.rows[0], dueDate: r.rows[0].due_date, teamMembers: r.rows[0].team_members, tags: r.rows[0].tags}); } catch (e) { res.status(500).send(e.message); } });

// Chat
app.get('/api/chat/messages/:userId', async (req, res) => { try { const r = await pool.query('SELECT * FROM chat_messages ORDER BY timestamp ASC'); res.json(r.rows.map(m => ({...m, senderId: m.sender_id, receiverId: m.receiver_id, isRead: m.is_read}))); } catch (e) { res.status(500).send(e.message); } });
app.post('/api/chat/messages', async (req, res) => { const { id, senderId, receiverId, text, timestamp, isRead } = req.body; try { const r = await pool.query('INSERT INTO chat_messages (id, sender_id, receiver_id, text, timestamp, is_read) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *', [id, senderId, receiverId, text, timestamp, isRead]); res.json({...r.rows[0], senderId: r.rows[0].sender_id, receiverId: r.rows[0].receiver_id, isRead: r.rows[0].is_read}); } catch (e) { res.status(500).send(e.message); } });

// Telegram
app.post('/api/notify/telegram', async (req, res) => {
    const { chatId, message } = req.body;
    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    if (!BOT_TOKEN) return res.status(500).json({ error: 'Telegram Bot Token not configured' });
    try {
        const r = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: 'Markdown' }) });
        const d = await r.json();
        if (d.ok) res.json({ success: true }); else res.status(500).json({ error: 'Telegram API Error' });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`\nServer running on port ${port}`);
});
