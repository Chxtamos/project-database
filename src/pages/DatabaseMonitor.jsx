import React, { useState, useEffect, useCallback } from 'react';

const API = 'http://localhost:5000/api/database';

// ── tiny helpers ──────────────────────────────────────────────
const badge = (type) => {
  const m = { TABLE: '#3b82f6', VIEW: '#8b5cf6', BASE: '#10b981' };
  return m[type] || '#6b7280';
};

export default function DatabaseMonitor() {
  const [dbInfo,      setDbInfo]      = useState(null);
  const [tables,      setTables]      = useState([]);
  const [search,      setSearch]      = useState('');
  const [selected,    setSelected]    = useState(null);   // table name
  const [tableData,   setTableData]   = useState(null);
  const [page,        setPage]        = useState(0);
  const [sql,         setSql]         = useState('');
  const [sqlResult,   setSqlResult]   = useState(null);
  const [sqlError,    setSqlError]    = useState('');
  const [loading,     setLoading]     = useState(false);
  const [sqlLoading,  setSqlLoading]  = useState(false);
  const [activeTab,   setActiveTab]   = useState('tables'); // 'tables' | 'sql'
  const LIMIT = 20;

  // ── fetch db info + table list ────────────────────────────────
  const loadTables = useCallback(async () => {
    setLoading(true);
    try {
      const [infoRes, tablesRes] = await Promise.all([
        fetch(`${API}/info`).then(r => r.json()),
        fetch(`${API}/tables`).then(r => r.json()),
      ]);
      if (infoRes.success)   setDbInfo(infoRes.info);
      if (tablesRes.success) setTables(tablesRes.tables);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadTables(); }, [loadTables]);

  // ── fetch table rows ──────────────────────────────────────────
  const loadTable = useCallback(async (name, pg = 0) => {
    setLoading(true);
    setTableData(null);
    try {
      const res = await fetch(`${API}/tables/${name}?limit=${LIMIT}&offset=${pg * LIMIT}`).then(r => r.json());
      if (res.success) setTableData(res);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  const handleSelectTable = (name) => {
    setSelected(name);
    setPage(0);
    setActiveTab('tables');
    loadTable(name, 0);
  };

  const handlePage = (dir) => {
    const np = page + dir;
    setPage(np);
    loadTable(selected, np);
  };

  // ── run SQL ───────────────────────────────────────────────────
  const runSQL = async () => {
    if (!sql.trim()) return;
    setSqlLoading(true);
    setSqlResult(null);
    setSqlError('');
    try {
      const res = await fetch(`${API}/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sql }),
      }).then(r => r.json());

      if (res.success) {
        setSqlResult(res);
        loadTables(); // refresh table list in case of CREATE/DROP
      } else {
        setSqlError(res.message || 'SQL Error');
      }
    } catch (e) { setSqlError(e.message); }
    finally { setSqlLoading(false); }
  };

  const filtered = tables.filter(t =>
    t.table_name.toLowerCase().includes(search.toLowerCase())
  );

  // ── styles ────────────────────────────────────────────────────
  const s = {
    root:      { display:'flex', height:'100vh', fontFamily:"'Inter',sans-serif", background:'#0f172a', color:'#e2e8f0' },
    sidebar:   { width:240, background:'#1e293b', borderRight:'1px solid #334155', display:'flex', flexDirection:'column', overflow:'hidden' },
    sideHead:  { padding:'16px', borderBottom:'1px solid #334155' },
    logo:      { fontSize:18, fontWeight:700, color:'#38bdf8', display:'flex', alignItems:'center', gap:8 },
    dbBadge:   { background:'#0f172a', borderRadius:6, padding:'6px 10px', fontSize:12, color:'#94a3b8', marginTop:8 },
    searchBox: { padding:'8px 12px', background:'#0f172a', border:'1px solid #334155', borderRadius:6, color:'#e2e8f0', width:'100%', boxSizing:'border-box', fontSize:12, outline:'none' },
    tableList: { flex:1, overflowY:'auto', padding:'8px 0' },
    tableItem: (active) => ({
      padding:'8px 16px', cursor:'pointer', fontSize:13,
      background: active ? '#0ea5e950' : 'transparent',
      color: active ? '#38bdf8' : '#cbd5e1',
      borderLeft: active ? '3px solid #38bdf8' : '3px solid transparent',
      display:'flex', alignItems:'center', gap:6,
      transition:'all .15s',
    }),
    main:      { flex:1, display:'flex', flexDirection:'column', overflow:'hidden' },
    topBar:    { background:'#1e293b', borderBottom:'1px solid #334155', padding:'12px 20px', display:'flex', alignItems:'center', justifyContent:'space-between' },
    tabs:      { display:'flex', gap:4 },
    tab:       (active) => ({
      padding:'6px 16px', borderRadius:6, cursor:'pointer', fontSize:13, fontWeight:500,
      background: active ? '#38bdf8' : '#0f172a',
      color: active ? '#0f172a' : '#94a3b8',
      border:'none', transition:'all .15s',
    }),
    content:   { flex:1, overflow:'auto', padding:20 },
    card:      { background:'#1e293b', borderRadius:10, border:'1px solid #334155', overflow:'hidden' },
    cardHead:  { padding:'12px 16px', borderBottom:'1px solid #334155', display:'flex', alignItems:'center', justifyContent:'space-between' },
    btn:       (color='#38bdf8') => ({
      padding:'6px 14px', borderRadius:6, border:'none', cursor:'pointer',
      background:color, color:'#0f172a', fontWeight:600, fontSize:12,
      display:'flex', alignItems:'center', gap:4,
    }),
    table:     { width:'100%', borderCollapse:'collapse', fontSize:12 },
    th:        { background:'#0f172a', padding:'8px 12px', textAlign:'left', color:'#94a3b8', fontWeight:600, borderBottom:'1px solid #334155', whiteSpace:'nowrap' },
    td:        { padding:'7px 12px', borderBottom:'1px solid #1e293b', color:'#cbd5e1', maxWidth:200, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' },
    sqlBox:    { width:'100%', minHeight:140, background:'#0f172a', border:'1px solid #334155', borderRadius:8, color:'#e2e8f0', fontFamily:'monospace', fontSize:13, padding:12, boxSizing:'border-box', resize:'vertical', outline:'none', lineHeight:1.6 },
    pill:      (c) => ({ display:'inline-block', padding:'2px 7px', borderRadius:10, fontSize:10, fontWeight:700, background:c+'22', color:c }),
    stat:      { background:'#0f172a', borderRadius:8, padding:'10px 16px', fontSize:12, color:'#94a3b8' },
    statVal:   { fontSize:18, fontWeight:700, color:'#38bdf8', marginTop:2 },
    error:     { background:'#450a0a', border:'1px solid #7f1d1d', borderRadius:8, padding:'10px 14px', color:'#fca5a5', fontSize:12, fontFamily:'monospace' },
    success:   { background:'#052e16', border:'1px solid #14532d', borderRadius:8, padding:'10px 14px', color:'#86efac', fontSize:12 },
  };

  const totalPages = tableData ? Math.ceil(tableData.total / LIMIT) : 0;

  return (
    <div style={s.root}>
      {/* ── Sidebar ── */}
      <aside style={s.sidebar}>
        <div style={s.sideHead}>
          <div style={s.logo}>🗄️ DB Monitor</div>
          {dbInfo && (
            <div style={s.dbBadge}>
              <div>📦 {dbInfo.database}</div>
              <div style={{marginTop:2}}>💾 {dbInfo.db_size} &nbsp;|&nbsp; {dbInfo.table_count} tables</div>
            </div>
          )}
          <input
            style={{...s.searchBox, marginTop:10}}
            placeholder="🔍 search table..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div style={s.tableList}>
          {filtered.map(t => (
            <div
              key={t.table_name}
              style={s.tableItem(selected === t.table_name)}
              onClick={() => handleSelectTable(t.table_name)}
            >
              <span>{t.table_type === 'VIEW' ? '👁' : '📋'}</span>
              <span style={{overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{t.table_name}</span>
            </div>
          ))}
          {filtered.length === 0 && (
            <div style={{padding:'12px 16px', color:'#475569', fontSize:12}}>No tables found</div>
          )}
        </div>

        <div style={{padding:'12px 16px', borderTop:'1px solid #334155'}}>
          <button
            style={{...s.btn('#22c55e'), width:'100%', justifyContent:'center'}}
            onClick={() => { setActiveTab('sql'); setSql('CREATE TABLE example (\n  id SERIAL PRIMARY KEY,\n  name VARCHAR(100)\n);'); }}
          >
            ＋ New Table (SQL)
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main style={s.main}>
        {/* Top bar */}
        <div style={s.topBar}>
          <div style={{display:'flex', alignItems:'center', gap:8, fontSize:13, color:'#94a3b8'}}>
            {dbInfo && <><span style={{color:'#38bdf8'}}>PostgreSQL</span> › <span>{dbInfo.database}</span> › <span>public</span></>}
            {selected && <><span>›</span><span style={{color:'#f8fafc', fontWeight:600}}>{selected}</span></>}
          </div>
          <div style={s.tabs}>
            <button style={s.tab(activeTab==='tables')} onClick={() => setActiveTab('tables')}>📋 Tables</button>
            <button style={s.tab(activeTab==='sql')}    onClick={() => setActiveTab('sql')}>⚡ SQL Editor</button>
          </div>
          <button style={s.btn()} onClick={loadTables} title="Refresh">🔄 Refresh</button>
        </div>

        <div style={s.content}>

          {/* ── DB Overview Stats ── */}
          {!selected && activeTab === 'tables' && (
            <>
              {dbInfo && (
                <div style={{display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:20}}>
                  {[
                    {label:'Database',    val: dbInfo.database},
                    {label:'Total Size',  val: dbInfo.db_size},
                    {label:'Tables',      val: dbInfo.table_count},
                    {label:'Schema',      val: dbInfo.schema},
                  ].map(item => (
                    <div key={item.label} style={s.stat}>
                      <div>{item.label}</div>
                      <div style={s.statVal}>{item.val}</div>
                    </div>
                  ))}
                </div>
              )}

              <div style={s.card}>
                <div style={s.cardHead}>
                  <span style={{fontWeight:600, fontSize:14}}>Tables & Views <span style={{color:'#94a3b8', fontWeight:400}}>({tables.length})</span></span>
                </div>
                <table style={s.table}>
                  <thead>
                    <tr>
                      {['Table Name','Type','Columns','Size','Comment'].map(h => (
                        <th key={h} style={s.th}>{h}</th>
                      ))}
                      <th style={s.th}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tables.map(t => (
                      <tr key={t.table_name} style={{cursor:'pointer'}} onClick={() => handleSelectTable(t.table_name)}
                        onMouseEnter={e => e.currentTarget.style.background='#0f172a'}
                        onMouseLeave={e => e.currentTarget.style.background=''}
                      >
                        <td style={{...s.td, color:'#38bdf8', fontWeight:600}}>{t.table_name}</td>
                        <td style={s.td}><span style={s.pill(badge(t.table_type))}>{t.table_type}</span></td>
                        <td style={s.td}>{t.column_count}</td>
                        <td style={s.td}>{t.total_size}</td>
                        <td style={{...s.td, color:'#64748b'}}>{t.comment || '—'}</td>
                        <td style={s.td}>
                          <button style={{...s.btn('#38bdf8'), fontSize:11, padding:'3px 10px'}}
                            onClick={e => { e.stopPropagation(); handleSelectTable(t.table_name); }}>
                            Select
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ── Table Detail ── */}
          {selected && activeTab === 'tables' && (
            <>
              {/* Column definitions */}
              {tableData && (
                <div style={{...s.card, marginBottom:16}}>
                  <div style={s.cardHead}>
                    <span style={{fontWeight:600, fontSize:14}}>🔖 Columns — <span style={{color:'#38bdf8'}}>{selected}</span></span>
                    <span style={{color:'#64748b', fontSize:12}}>{tableData.columns.length} columns</span>
                  </div>
                  <table style={s.table}>
                    <thead>
                      <tr>
                        {['Column','Data Type','Max Length','Nullable','Default'].map(h => (
                          <th key={h} style={s.th}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {tableData.columns.map(c => (
                        <tr key={c.column_name}>
                          <td style={{...s.td, fontWeight:600, color:'#f8fafc'}}>{c.column_name}</td>
                          <td style={s.td}><span style={s.pill('#8b5cf6')}>{c.data_type}</span></td>
                          <td style={s.td}>{c.character_maximum_length || '—'}</td>
                          <td style={s.td}>{c.is_nullable === 'YES' ? <span style={s.pill('#f59e0b')}>YES</span> : <span style={s.pill('#22c55e')}>NO</span>}</td>
                          <td style={{...s.td, fontFamily:'monospace', color:'#94a3b8'}}>{c.column_default || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Data rows */}
              <div style={s.card}>
                <div style={s.cardHead}>
                  <span style={{fontWeight:600, fontSize:14}}>📊 Data <span style={{color:'#94a3b8', fontWeight:400}}>({tableData?.total ?? '…'} rows)</span></span>
                  <div style={{display:'flex', gap:8, alignItems:'center'}}>
                    <span style={{fontSize:12, color:'#64748b'}}>Page {page+1} / {totalPages||1}</span>
                    <button style={s.btn('#334155')} disabled={page===0}         onClick={() => handlePage(-1)}>◀</button>
                    <button style={s.btn('#334155')} disabled={page+1>=totalPages} onClick={() => handlePage(1)}>▶</button>
                    <button style={{...s.btn('#f59e0b'), color:'#0f172a'}}
                      onClick={() => { setSql(`SELECT * FROM "${selected}" LIMIT 100;`); setActiveTab('sql'); }}>
                      ⚡ SQL
                    </button>
                  </div>
                </div>

                {loading ? (
                  <div style={{padding:40, textAlign:'center', color:'#64748b'}}>Loading…</div>
                ) : tableData && tableData.rows.length > 0 ? (
                  <div style={{overflowX:'auto'}}>
                    <table style={s.table}>
                      <thead>
                        <tr>{tableData.columns.map(c => <th key={c.column_name} style={s.th}>{c.column_name}</th>)}</tr>
                      </thead>
                      <tbody>
                        {tableData.rows.map((row, i) => (
                          <tr key={i}
                            onMouseEnter={e => e.currentTarget.style.background='#0f172a'}
                            onMouseLeave={e => e.currentTarget.style.background=''}>
                            {tableData.columns.map(c => (
                              <td key={c.column_name} style={s.td} title={String(row[c.column_name] ?? '')}>
                                {row[c.column_name] === null
                                  ? <span style={{color:'#475569', fontStyle:'italic'}}>NULL</span>
                                  : typeof row[c.column_name] === 'object'
                                    ? JSON.stringify(row[c.column_name])
                                    : String(row[c.column_name])}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div style={{padding:40, textAlign:'center', color:'#64748b'}}>No rows found</div>
                )}
              </div>
            </>
          )}

          {/* ── SQL Editor ── */}
          {activeTab === 'sql' && (
            <div style={{display:'flex', flexDirection:'column', gap:16}}>
              <div style={s.card}>
                <div style={s.cardHead}>
                  <span style={{fontWeight:600, fontSize:14}}>⚡ SQL Command</span>
                  <div style={{display:'flex', gap:8}}>
                    <button style={s.btn('#475569')} onClick={() => setSql('')}>Clear</button>
                    <button
                      style={s.btn(sqlLoading ? '#334155' : '#22c55e')}
                      onClick={runSQL}
                      disabled={sqlLoading}
                    >
                      {sqlLoading ? '⏳ Running…' : '▶ Run SQL'}
                    </button>
                  </div>
                </div>
                <div style={{padding:12}}>
                  <textarea
                    style={s.sqlBox}
                    value={sql}
                    onChange={e => setSql(e.target.value)}
                    placeholder={`-- Type your SQL here\nSELECT * FROM your_table LIMIT 10;\n\n-- Or create a new table:\nCREATE TABLE example (\n  id SERIAL PRIMARY KEY,\n  name VARCHAR(100) NOT NULL\n);`}
                    onKeyDown={e => { if (e.ctrlKey && e.key === 'Enter') runSQL(); }}
                  />
                  <div style={{fontSize:11, color:'#475569', marginTop:4}}>Ctrl+Enter to run</div>
                </div>

                {/* Quick templates */}
                <div style={{padding:'0 12px 12px', display:'flex', gap:6, flexWrap:'wrap'}}>
                  {[
                    ['SELECT all', 'SELECT * FROM "table_name" LIMIT 50;'],
                    ['List tables', `SELECT table_name, table_type FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name;`],
                    ['Create table', `CREATE TABLE new_table (\n  id SERIAL PRIMARY KEY,\n  name VARCHAR(100) NOT NULL,\n  created_at TIMESTAMP DEFAULT NOW()\n);`],
                    ['Add column', `ALTER TABLE "table_name" ADD COLUMN new_col VARCHAR(100);`],
                    ['Drop table', `DROP TABLE IF EXISTS "table_name";`],
                    ['Count rows', `SELECT table_name, (SELECT COUNT(*) FROM information_schema.tables t2 WHERE t2.table_name = t.table_name) FROM information_schema.tables t WHERE table_schema='public';`],
                  ].map(([label, tmpl]) => (
                    <button key={label}
                      style={{padding:'3px 10px', borderRadius:5, border:'1px solid #334155', background:'#0f172a', color:'#94a3b8', fontSize:11, cursor:'pointer'}}
                      onClick={() => setSql(tmpl)}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Result */}
              {sqlError && <div style={s.error}>❌ {sqlError}</div>}
              {sqlResult && (
                <div style={s.card}>
                  <div style={s.cardHead}>
                    <span style={{fontWeight:600, fontSize:14}}>Results</span>
                    <div style={{display:'flex', gap:12, fontSize:12, color:'#94a3b8'}}>
                      <span>Command: <strong style={{color:'#38bdf8'}}>{sqlResult.command}</strong></span>
                      <span>Rows: <strong style={{color:'#22c55e'}}>{sqlResult.rowCount}</strong></span>
                      <span>Time: <strong style={{color:'#f59e0b'}}>{sqlResult.duration_ms}ms</strong></span>
                    </div>
                  </div>

                  {sqlResult.rows.length > 0 ? (
                    <div style={{overflowX:'auto'}}>
                      <table style={s.table}>
                        <thead>
                          <tr>{sqlResult.fields.map(f => <th key={f.name} style={s.th}>{f.name}</th>)}</tr>
                        </thead>
                        <tbody>
                          {sqlResult.rows.map((row, i) => (
                            <tr key={i}
                              onMouseEnter={e => e.currentTarget.style.background='#0f172a'}
                              onMouseLeave={e => e.currentTarget.style.background=''}>
                              {sqlResult.fields.map(f => (
                                <td key={f.name} style={s.td}>
                                  {row[f.name] === null
                                    ? <span style={{color:'#475569', fontStyle:'italic'}}>NULL</span>
                                    : typeof row[f.name] === 'object'
                                      ? JSON.stringify(row[f.name])
                                      : String(row[f.name])}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div style={{...s.success, margin:12}}>
                      ✅ Query executed successfully. {sqlResult.rowCount} row(s) affected.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
