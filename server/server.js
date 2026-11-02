#!/usr/bin/env node
// PS Toolbox API: stores Conference Rooms projects in MySQL / MariaDB and serves the built page.
// No sign-in. By default it only answers this computer (HOST=127.0.0.1). To share it, set HOST=0.0.0.0 and list the
// names people will use in ALLOWED_HOSTS, and put it behind a sign-in (VPN or Cloudflare Access) first.
//
//   GET    /api/projects       list of projects (no data)
//   POST   /api/projects       { data }                    -> { id, version }
//   GET    /api/projects/:id   -> { id, name, site, room_count, version, updated_at, data }
//   PUT    /api/projects/:id   { data, version, force? }   -> { version }, or 409 if someone saved first
const http = require('http'), fs = require('fs'), path = require('path');
const mysql = require('mysql2/promise');

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || '127.0.0.1';
// Host names the page may be reached by. Checking the Host header blocks DNS rebinding (another site's domain
// pointed at this machine), and checking Origin blocks other sites' pages from writing through a browser.
const ALLOWED_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]',
  ...(process.env.ALLOWED_HOSTS || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean)]);
const hostName = h => String(h || '').toLowerCase().replace(/:\d+$/, '');
const PAGE = path.join(__dirname, '..', 'PS Toolbox.html');
const MAX_BODY = 10 * 1024 * 1024;

const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'ps_toolbox',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ps_toolbox',
  connectionLimit: 5,
});

const send = (res, status, body) => {
  res.writeHead(status, { 'Content-Type': 'application/json', 'X-Content-Type-Options': 'nosniff' });
  res.end(JSON.stringify(body));
};

const readBody = req => new Promise((resolve, reject) => {
  let size = 0; const chunks = [];
  req.on('data', c => { size += c.length; if (size > MAX_BODY) { reject(Object.assign(new Error('Project is too large'), { status: 413 })); req.destroy(); } else chunks.push(c); });
  req.on('end', () => { try { resolve(JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}')); } catch (e) { reject(Object.assign(new Error('Body is not JSON'), { status: 400 })); } });
  req.on('error', reject);
});

// The client sends the rooms state as the same JSON string it keeps in localStorage.
function summarize(data) {
  if (typeof data !== 'string') throw Object.assign(new Error('data must be a JSON string'), { status: 400 });
  let s; try { s = JSON.parse(data); } catch (e) { throw Object.assign(new Error('data is not valid JSON'), { status: 400 }); }
  const r = (s && s.report) || {};
  return {
    name: String(r.client || '').slice(0, 200),
    site: String(r.site || '').slice(0, 300),
    room_count: Array.isArray(s && s.rooms) ? s.rooms.length : 0,
  };
}

async function api(req, res, id) {
  if (!id && req.method === 'GET') {
    const [rows] = await db.query('SELECT id, name, site, room_count, version, updated_at FROM projects ORDER BY updated_at DESC LIMIT 500');
    return send(res, 200, rows);
  }
  if (!id && req.method === 'POST') {
    const { data } = await readBody(req), m = summarize(data);
    const [r] = await db.query('INSERT INTO projects (name, site, room_count, data) VALUES (?, ?, ?, ?)', [m.name, m.site, m.room_count, data]);
    return send(res, 201, { id: r.insertId, version: 1 });
  }
  if (id && req.method === 'GET') {
    const [rows] = await db.query('SELECT id, name, site, room_count, version, updated_at, data FROM projects WHERE id = ?', [id]);
    return rows.length ? send(res, 200, rows[0]) : send(res, 404, { error: 'Project not found' });
  }
  if (id && req.method === 'PUT') {
    const { data, version, force } = await readBody(req), m = summarize(data);
    const [r] = force
      ? await db.query('UPDATE projects SET name=?, site=?, room_count=?, data=?, version=version+1 WHERE id=?', [m.name, m.site, m.room_count, data, id])
      : await db.query('UPDATE projects SET name=?, site=?, room_count=?, data=?, version=version+1 WHERE id=? AND version=?', [m.name, m.site, m.room_count, data, id, Number(version) || 0]);
    const [[row]] = await db.query('SELECT version FROM projects WHERE id = ?', [id]);
    if (!row) return send(res, 404, { error: 'Project not found' });
    if (!r.affectedRows) return send(res, 409, { error: 'Someone else saved this project first', version: row.version });
    return send(res, 200, { version: row.version });
  }
  send(res, 405, { error: 'Method not allowed' });
}

http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x');
  try {
    if (!ALLOWED_HOSTS.has(hostName(req.headers.host))) return send(res, 421, { error: 'Unknown host name' });
    const origin = req.headers.origin;
    if (origin && origin !== `http://${req.headers.host}` && origin !== `https://${req.headers.host}`) return send(res, 403, { error: 'Cross-site request refused' });
    if ((req.method === 'POST' || req.method === 'PUT') && !/^application\/json\b/i.test(req.headers['content-type'] || ''))
      return send(res, 415, { error: 'Send JSON' }); // a plain form post can't set this type, so this also stops form-based cross-site writes
    const m = url.pathname.match(/^\/api\/projects(?:\/(\d+))?\/?$/);
    if (m) return await api(req, res, m[1] ? Number(m[1]) : null);
    if (req.method === 'GET' && (url.pathname === '/' || url.pathname === '/index.html')) {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache' });
      return fs.createReadStream(PAGE).on('error', () => res.end('Run "node build.js" first.')).pipe(res);
    }
    send(res, 404, { error: 'Not found' });
  } catch (e) {
    if (!e.status) console.error(e);
    send(res, e.status || 500, { error: e.status ? e.message : 'Database error' });
  }
}).listen(PORT, HOST, () => console.log(`PS Toolbox on http://${HOST === '127.0.0.1' ? 'localhost' : HOST}:${PORT}`));
