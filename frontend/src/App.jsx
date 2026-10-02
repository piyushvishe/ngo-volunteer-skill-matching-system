import { useState } from 'react'

const opportunities = [
  { id:1, title:'Community Teaching Drive', ngo:'Udaan Education Trust', location:'Pune', date:'18 Sep 2026', time:'9 AM – 1 PM', score:96, skills:['Teaching','Communication','Weekdays'] },
  { id:2, title:'Digital Awareness Campaign', ngo:'Green Earth Initiative', location:'Remote', date:'24 Sep 2026', time:'5 PM – 7 PM', score:91, skills:['Communication','Digital Skills','Flexible'] },
  { id:3, title:'Community Health Camp', ngo:'Seva Foundation', location:'Mumbai', date:'28 Sep 2026', time:'10 AM – 3 PM', score:87, skills:['Social Work','Communication','Weekends'] },
]

const applicants = [
  {name:'Ananya Sharma', initials:'AS', location:'Pune', availability:'Weekdays', score:96, assignments:12, hours:42, skills:['Teaching','Communication','Graphic Design'], experience:'Community Teaching Drive, Digital Literacy Workshop, School Support Programme.'},
  {name:'Kabir Shah', initials:'KS', location:'Pune', availability:'Weekends', score:88, assignments:7, hours:25, skills:['Teaching','Event Management'], experience:'Youth Workshop, Community Events.'},
]

function go(path){ window.location.hash = path }
function Link({to, children, className=''}){ return <a href={'#'+to} className={className}>{children}</a> }

function Brand({dark=false}){ return <Link to="/" className="brand" style={dark?{color:'#fff'}:{}}><span className="brand-mark">🤝</span><span>Volunteer<span>Link</span></span></Link> }

function Home(){
 return <>
  <header className="topbar"><Brand/><nav className="nav"><a href="#flow">How it works</a><a href="#modules">Modules</a><Link to="/login" className="btn btn-outline">Login</Link><Link to="/register" className="btn btn-primary">Get Started</Link></nav></header>
  <section className="hero"><div><span className="eyebrow">NGO VOLUNTEER–SKILL MATCHING SYSTEM</span><h1>Right volunteer.<br/><span>Right NGO.</span><br/>Right time.</h1><p>A smart community platform where organisations post requirements, volunteers receive personalised recommendations, and NGOs choose the best-fit volunteers after they accept.</p><div className="hero-actions"><Link to="/register" className="btn btn-primary">Join the platform →</Link><a href="#flow" className="btn btn-soft">See the workflow</a></div></div><div className="hero-visual"><div className="demo-window"><div className="demo-head"><b>Recommended for you</b><span>3 matches</span></div><div className="demo-match"><span className="score">96%</span><b>Community Teaching Drive</b><small>Udaan Education Trust</small><p>📍 Pune &nbsp; 📅 18 Sep &nbsp; ⏰ 9 AM</p><div className="tags"><span className="tag">Teaching</span><span className="tag">Communication</span><span className="tag">Weekdays</span></div><Link to="/opportunities" className="btn btn-primary btn-block">View opportunity</Link></div></div></div></section>
  <section id="flow" className="section"><div className="section-head"><span className="eyebrow">END-TO-END WORKFLOW</span><h2>Two-sided matching, then final selection</h2><p>The platform recommends relevant opportunities first; the organisation then reviews accepted volunteers and makes the final selection.</p></div><div className="grid4">{[['01','Organisation posts','Skills, domain, date, time, location, availability and task details.'],['02','Volunteer accepts','Matching recommends relevant opportunities based on profile and availability.'],['03','NGO reviews','Organisation sees accepted volunteers and checks profiles and previous assignments.'],['04','Final assignment','Selected volunteer receives the confirmed task, date, time and location.']].map(x=><div className="card" key={x[0]}><div className="stepnum">{x[0]}</div><h3>{x[1]}</h3><p>{x[2]}</p></div>)}</div></section>
  <section id="modules" className="section" style={{background:'#eef4fa'}}><div className="section-head"><span className="eyebrow">CORE MODULES</span><h2>Built around your project scope</h2></div><div className="grid4">{[['👤','Volunteer Profile','Skills, domain, availability and participation history.'],['🏢','Requirements','NGOs create detailed volunteer requirements.'],['🎯','Smart Matching','Matches skills, domain, availability and location.'],['📋','Assignment History','Tracks accepted, selected and completed participation.']].map(x=><div className="card" key={x[1]}><h3>{x[0]} {x[1]}</h3><p>{x[2]}</p></div>)}</div></section>
  <section className="cta"><span className="eyebrow">COMMUNITY ENGAGEMENT MINI PROJECT 2026–27</span><h2>From opportunity to meaningful participation.</h2><p>VolunteerLink connects volunteers and NGOs through skills, availability and requirements.</p><Link to="/register" className="btn btn-primary">Start Demo →</Link></section><footer className="footer">VolunteerLink • NGO Volunteer–Skill Matching System</footer>
 </>
}

function AuthShell({children,wide=false}){ return <div className="auth"><div className="auth-shell" style={wide?{maxWidth:720}:{}}><div className="auth-top"><Brand dark/><Link to="/">← Home</Link></div>{children}</div></div> }
function Login(){
 const [role,setRole]=useState('volunteer');
 const [email,setEmail]=useState('');
 const [password,setPassword]=useState('');
 const [error,setError]=useState('');

 const submit=(e)=>{
   e.preventDefault();
   setError('');
   const users=JSON.parse(localStorage.getItem('volunteerlink_users')||'[]');
   const user=users.find(u=>u.email.toLowerCase()===email.trim().toLowerCase() && u.password===password && u.role===role);
   if(!user){
     setError('Invalid email, password, or account type.');
     return;
   }
   localStorage.setItem('volunteerlink_current_user', JSON.stringify(user));
   go(role==='ngo'?'/ngo-dashboard':'/volunteer-dashboard');
 };

 return <AuthShell>
   <div className="auth-card">
     <div className="auth-info">
       <span className="eyebrow">WELCOME BACK</span>
       <h1>Continue your community journey.</h1>
       <p>Volunteers discover opportunities. NGO administrators review and assign the best-fit candidates.</p>
     </div>
     <form className="form" onSubmit={submit}>
       <h2>Sign in</h2>
       <p className="muted">Use the account you created on VolunteerLink.</p>
       <label>Email<input type="email" required placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)}/></label>
       <label>Password<input type="password" required placeholder="••••••••" value={password} onChange={e=>setPassword(e.target.value)}/></label>
       <label>Login as<select value={role} onChange={e=>setRole(e.target.value)}>
         <option value="volunteer">Volunteer</option>
         <option value="ngo">Organisation / NGO</option>
       </select></label>
       {error && <div style={{background:'#fff0f0',color:'#b42318',padding:'10px',borderRadius:8,fontSize:12}}>{error}</div>}
       <button className="btn btn-primary btn-block">Sign in →</button>
       <p style={{textAlign:'center',marginTop:18,fontSize:12}}>New here? <Link to="/register" style={{color:'#2563eb',fontWeight:700}}>Create account</Link></p>
     </form>
   </div>
 </AuthShell>
}
function Register(){
 const [role,setRole]=useState('volunteer');
 const [form,setForm]=useState({
   name:'', email:'', phone:'', password:'', location:'Pune',
   availability:'Weekdays', skills:'', organisation:'', domain:''
 });
 const [error,setError]=useState('');

 const update=(key,value)=>setForm({...form,[key]:value});

 const submit=(e)=>{
   e.preventDefault();
   setError('');
   const users=JSON.parse(localStorage.getItem('volunteerlink_users')||'[]');
   const email=form.email.trim().toLowerCase();
   if(users.some(u=>u.email.toLowerCase()===email)){
     setError('An account with this email already exists. Please login.');
     return;
   }
   const user={
     id:Date.now(),
     role,
     name:form.name.trim(),
     email,
     phone:form.phone.trim(),
     password:form.password,
     location:form.location.trim(),
     availability:form.availability,
     skills:role==='volunteer'
       ? form.skills.split(',').map(s=>s.trim()).filter(Boolean)
       : [],
     organisation:role==='ngo'?form.organisation.trim():'',
     domain:role==='ngo'?form.domain.trim():''
   };
   users.push(user);
   localStorage.setItem('volunteerlink_users',JSON.stringify(users));
   alert('Account created successfully. Please login.');
   go('/login');
 };

 return <AuthShell wide>
   <form className="form" style={{borderRadius:20,background:'#fff'}} onSubmit={submit}>
     <span className="eyebrow">CREATE ACCOUNT</span>
     <h1>Join VolunteerLink</h1>
     <p className="muted">Select how you will use the platform.</p>

     <div className="role-picker">
       <button type="button" className={'role '+(role==='volunteer'?'active':'')} onClick={()=>setRole('volunteer')}>
         <b>👤 Volunteer</b><small>Find and accept opportunities</small>
       </button>
       <button type="button" className={'role '+(role==='ngo'?'active':'')} onClick={()=>setRole('ngo')}>
         <b>🏢 Organisation / NGO</b><small>Post, review and assign</small>
       </button>
     </div>

     <div className="two">
       <label>Full name<input required value={form.name} onChange={e=>update('name',e.target.value)}/></label>
       <label>Email<input type="email" required value={form.email} onChange={e=>update('email',e.target.value)}/></label>
     </div>

     <label>Phone<input required value={form.phone} onChange={e=>update('phone',e.target.value)}/></label>
     <label>Password<input type="password" required minLength="4" value={form.password} onChange={e=>update('password',e.target.value)}/></label>

     {role==='volunteer' ? <>
       <div className="two">
         <label>Location<input value={form.location} onChange={e=>update('location',e.target.value)} placeholder="Pune"/></label>
         <label>Availability<select value={form.availability} onChange={e=>update('availability',e.target.value)}>
           <option>Weekdays</option><option>Weekends</option><option>Flexible</option>
         </select></label>
       </div>
       <label>Skills / domain
         <input required value={form.skills} onChange={e=>update('skills',e.target.value)} placeholder="Teaching, Design, Social Work"/>
         <small style={{display:'block',color:'#7b899a',fontWeight:400,marginTop:5}}>Enter skills separated by commas.</small>
       </label>
     </> : <>
       <label>Organisation name<input required value={form.organisation} onChange={e=>update('organisation',e.target.value)} placeholder="NGO name"/></label>
       <label>Focus domain<input value={form.domain} onChange={e=>update('domain',e.target.value)} placeholder="Education, Environment, Health"/></label>
     </>}

     <label><input type="checkbox" required style={{width:'auto',display:'inline-block',marginRight:6}}/> I agree to the demo terms.</label>
     {error && <div style={{background:'#fff0f0',color:'#b42318',padding:'10px',borderRadius:8,fontSize:12}}>{error}</div>}
     <button className="btn btn-primary btn-block">Create account →</button>
   </form>
 </AuthShell>
}
function Sidebar({ngo=false,active=''}){ 
 const current=JSON.parse(localStorage.getItem('volunteerlink_current_user')||'null');
 const volunteerName=current?.role==='volunteer'?current.name:'Ananya Sharma';
 const ngoName=current?.role==='ngo'?(current.organisation||current.name):'Seva Foundation';
 const displayName=ngo?ngoName:volunteerName;
 const initials=(displayName||'User').split(' ').map(x=>x[0]).join('').slice(0,2).toUpperCase();

 const items=ngo
 ?[['/ngo-dashboard','⌂','Dashboard'],['/requirements','＋','Post Requirements'],['/ngo-requirements','▤','My Requirements'],['/ngo-interested','◎','Interested Volunteers'],['/ngo-assignments','✓','Assignments'],['/history','◷','History & Reports']]
 :[['/volunteer-dashboard','⌂','Dashboard'],['/volunteer-profile','◉','My Profile'],['/opportunities','◎','Recommended Opportunities'],['/volunteer-accepted','✓','My Accepted'],['/volunteer-assignments','▣','My Assignments'],['/history','◷','Participation History']];

 const logout=()=>{localStorage.removeItem('volunteerlink_current_user');go('/');};

 return <aside className="sidebar">
   <Brand/>
   <div className="user-mini">
     <div className={'avatar '+(ngo?'org':'')}>{initials}</div>
     <div><b>{displayName}</b><small>{ngo?'Organisation Admin':'Volunteer'}</small></div>
   </div>
   <nav>{items.map(i=><Link key={i[0]} to={i[0]} className={active===i[0]?'active':''}>{i[1]} <span>{i[2]}</span></Link>)}</nav>
   <button onClick={logout} className="logout" style={{border:0,background:'transparent',color:'inherit',textAlign:'left',cursor:'pointer'}}>↪ <span>Logout</span></button>
 </aside>
}
function Layout({ngo=false,active,children}){ return <div className="app-body"><Sidebar ngo={ngo} active={active}/><main className="main">{children}</main></div> }
function Header({eyebrow,title,text,button}){ return <header className="header"><div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{text}</p></div>{button}</header> }

function VolunteerDashboard(){
 const user=JSON.parse(localStorage.getItem('volunteerlink_current_user')||'null');
 const name=user?.name||'Volunteer';
 const skills=(user?.skills||[]).map(s=>s.toLowerCase());
 const scored=opportunities.map(o=>{
   const matched=o.skills.filter(s=>skills.includes(s.toLowerCase())).length;
   const score=skills.length ? Math.max(55,Math.round((matched/o.skills.length)*100)) : o.score;
   return {...o,score};
 }).sort((a,b)=>b.score-a.score);

 return <Layout active="/volunteer-dashboard">
   <Header eyebrow="VOLUNTEER PORTAL" title={`Good evening, ${name} 👋`} text="Discover opportunities that fit your skills and availability." button={<Link to="/opportunities" className="btn btn-primary">View recommendations →</Link>}/>
   <div className="content">
     <section className="panel">
       <div className="panel-head"><div><h2>Top recommendations</h2><p>Based on your skills + availability</p></div><Link to="/opportunities">View all</Link></div>
       <div className="list">
         {scored.slice(0,2).map(o=><div className="item" key={o.id}>
           <div className="avatar">{o.ngo.slice(0,2).toUpperCase()}</div>
           <div><b>{o.title}</b><small>{o.ngo} • {o.location} • {o.date} • {o.time}</small></div>
           <div className="right"><b className="green">{o.score}%</b><small>Match</small></div>
         </div>)}
       </div>
     </section>
     <section className="panel">
       <div className="panel-head"><div><h2>Your skills</h2><p>Used to personalize recommendations</p></div><Link to="/volunteer-profile">Edit</Link></div>
       <div className="tags">{(user?.skills?.length?user.skills:['Add skills in your profile']).map(s=><span className="tag" key={s}>{s}</span>)}</div>
       <p className="muted" style={{marginTop:18}}>Availability: <b>{user?.availability||'Not set'}</b></p>
       <p className="muted">Location: <b>{user?.location||'Not set'}</b></p>
     </section>
   </div>
 </Layout>
}
function VolunteerProfile(){
 const user=JSON.parse(localStorage.getItem('volunteerlink_current_user')||'null');
 const name=user?.name||'Volunteer';
 const initials=name.split(' ').map(x=>x[0]).join('').slice(0,2).toUpperCase();
 return <Layout active="/volunteer-profile">
   <Header eyebrow="MY PROFILE" title="Volunteer Profile" text="Your profile and skills are used for opportunity matching."/>
   <div className="profile-grid">
     <section className="panel">
       <div className="profile-cover"></div>
       <div className="profile-center">
         <div className="avatar avatar-lg">{initials}</div>
         <h2>{name}</h2>
         <p>Volunteer • {user?.location||'Location not set'} • Available {user?.availability?.toLowerCase()||'as set'}</p>
         <div className="profile-stats">
           <span><b>0</b><small>Assignments</small></span>
           <span><b>0</b><small>Hours</small></span>
           <span><b>—</b><small>Rating</small></span>
         </div>
       </div>
     </section>
     <section className="panel">
       <h2>Profile details</h2>
       <div className="form">
         <label>Full name<input value={user?.name||''} readOnly/></label>
         <label>Email<input value={user?.email||''} readOnly/></label>
         <label>Location<input value={user?.location||''} readOnly/></label>
         <label>Availability<select value={user?.availability||'Weekdays'} readOnly onChange={()=>{}}><option>Weekdays</option><option>Weekends</option><option>Flexible</option></select></label>
       </div>
       <h3>Skills & domain</h3>
       <div className="tags">{(user?.skills||[]).map(s=><span className="tag" key={s}>{s}</span>)}</div>
     </section>
   </div>
 </Layout>
}
function Opportunities(){
 const user=JSON.parse(localStorage.getItem('volunteerlink_current_user')||'null');
 const skills=(user?.skills||[]).map(s=>s.toLowerCase());
 const [accepted,setAccepted]=useState(()=>JSON.parse(localStorage.getItem('volunteerlink_interests')||'[]'));
 const [query,setQuery]=useState('');

 const scored=opportunities.map(o=>{
   const matched=o.skills.filter(s=>skills.includes(s.toLowerCase())).length;
   const score=skills.length ? Math.max(55,Math.round((matched/o.skills.length)*100)) : o.score;
   return {...o,score};
 }).filter(o=>o.title.toLowerCase().includes(query.toLowerCase())||o.ngo.toLowerCase().includes(query.toLowerCase()))
 .sort((a,b)=>b.score-a.score);

 const accept=(id)=>{
   const next=[...new Set([...accepted,id])];
   setAccepted(next);
   localStorage.setItem('volunteerlink_interests',JSON.stringify(next));
 };

 return <Layout active="/opportunities">
   <Header eyebrow="RECOMMENDED OPPORTUNITIES" title="Opportunities for you" text="Matches are based on your skills, domain, availability and location."/>
   <div className="toolbar">
     <div className="search">🔎<input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search opportunities"/></div>
     <select><option>All domains</option><option>Education</option><option>Environment</option></select>
     <select><option>Best match</option><option>Latest</option></select>
   </div>
   <div className="grid4">
     {scored.map(o=><article className="card" key={o.id}>
       <span className="badge badge-green">{o.score}% match</span>
       <h3 style={{marginTop:12}}>{o.title}</h3>
       <p>{o.ngo}</p>
       <p style={{fontSize:12,marginTop:8}}>📍 {o.location}<br/>📅 {o.date}<br/>⏰ {o.time}</p>
       <div className="tags">{o.skills.map(s=><span className="tag" key={s}>{s}</span>)}</div>
       <button className="btn btn-primary btn-block" onClick={()=>accept(o.id)}>
         {accepted.includes(o.id)?'Interested ✓':'I’m Interested'}
       </button>
     </article>)}
   </div>
 </Layout>
}
function Accepted(){return <Layout active="/volunteer-accepted"><Header eyebrow="VOLUNTEER RESPONSES" title="My Accepted Opportunities" text="These are accepted by you and await the organisation's final decision."/><section className="panel"><div className="list">{opportunities.slice(0,2).map(o=><div className="item" key={o.id}><div className="avatar">{o.ngo.slice(0,2).toUpperCase()}</div><div><b>{o.title}</b><small>{o.ngo} • {o.location} • {o.date} • {o.time}</small></div><span className="badge badge-yellow">Awaiting NGO selection</span></div>)}</div></section></Layout>}
function VolunteerAssignments(){return <Layout active="/volunteer-assignments"><Header eyebrow="MY ASSIGNMENTS" title="Confirmed Assignments" text="Tasks selected and confirmed by organisations."/><section className="panel"><div className="item"><div className="avatar">UT</div><div><b>Community Teaching Drive</b><small>Udaan Education Trust • Pune • 18 Sep 2026 • 9 AM–1 PM</small><small>Support school students through a community teaching session.</small></div><span className="badge badge-green">Confirmed</span></div></section></Layout>}
function History(){return <Layout active="/history"><Header eyebrow="PARTICIPATION HISTORY" title="History & Reports" text="Track completed participation and volunteer activity."/><div className="metric-grid"><div className="metric"><span>Assignments</span><b>12</b></div><div className="metric"><span>Completed</span><b>10</b></div><div className="metric"><span>Volunteer hours</span><b>42</b></div><div className="metric"><span>Rating</span><b>4.9</b></div></div><section className="panel"><div className="history-row"><div className="history-icon">✓</div><div><b>Community Teaching Drive</b><small>Udaan Education Trust • 18 Aug 2026 • 6 hours</small></div><span className="badge badge-green">Completed</span></div><div className="history-row"><div className="history-icon">✓</div><div><b>Digital Literacy Workshop</b><small>TechForAll NGO • 03 Aug 2026 • 7 hours</small></div><span className="badge badge-green">Completed</span></div></section></Layout>}

function NgoDashboard(){return <Layout ngo active="/ngo-dashboard"><Header eyebrow="ORGANISATION PORTAL" title="Good evening, Seva Foundation 👋" text="Manage requirements, review volunteers and confirm assignments." button={<Link to="/requirements" className="btn btn-primary">Post requirement →</Link>}/><div className="metric-grid"><div className="metric"><span>Active requirements</span><b>4</b></div><div className="metric"><span>Interested volunteers</span><b>18</b></div><div className="metric"><span>Assignments</span><b>18</b></div><div className="metric"><span>Completed</span><b>14</b></div></div><div className="content"><section className="panel"><div className="panel-head"><div><h2>Recent requirements</h2><p>Your active volunteer needs</p></div><Link to="/ngo-requirements">View all</Link></div><div className="list">{['Community Teaching Drive','Digital Awareness Campaign','Tree Plantation Support'].map((x,i)=><div className="item" key={x}><div><b>{x}</b><small>{i===0?'4 needed • 3 accepted • Pune':'6 needed • accepting responses'}</small></div><span className="badge badge-blue">Active</span></div>)}</div></section><section className="panel"><div className="panel-head"><div><h2>Pending selection</h2><p>Volunteers waiting for review</p></div></div><div className="list"><div className="item"><div className="avatar">AS</div><div><b>Ananya Sharma</b><small>96% match • Teaching • Pune</small></div><Link to="/ngo-interested" className="action">Review</Link></div><div className="item"><div className="avatar">KS</div><div><b>Kabir Shah</b><small>88% match • Teaching • Pune</small></div><Link to="/ngo-interested" className="action">Review</Link></div></div></section></div></Layout>}
function Requirements(){const [posted,setPosted]=useState(false);return <Layout ngo active="/requirements"><Header eyebrow="POST REQUIREMENT" title="Create a volunteer requirement" text="Describe the task so the matching system can find suitable volunteers."/><section className="panel" style={{maxWidth:850}}><div className="two"><label>Requirement title<input placeholder="Community Teaching Drive"/></label><label>Volunteers needed<input type="number" defaultValue="4"/></label></div><div className="two"><label>Domain<select><option>Education</option><option>Environment</option><option>Health</option></select></label><label>Location<input placeholder="Pune"/></label></div><div className="two"><label>Date<input type="date"/></label><label>Time<input type="text" placeholder="9 AM – 1 PM"/></label></div><label>Required skills<input placeholder="Teaching, Communication"/></label><label>Task description<textarea rows="5" placeholder="Describe the volunteer activity..."></textarea></label><button className="btn btn-primary" onClick={()=>setPosted(true)}>{posted?'Requirement posted ✓':'Post requirement →'}</button>{posted&&<span className="badge badge-green" style={{marginLeft:10}}>Saved for demo</span>}</section></Layout>}
function MyRequirements(){return <Layout ngo active="/ngo-requirements"><Header eyebrow="MY REQUIREMENTS" title="Requirements" text="Manage requirements posted by your organisation."/><section className="panel"><table className="table"><thead><tr><th>Requirement</th><th>Needed</th><th>Accepted</th><th>Status</th></tr></thead><tbody>{[['Community Teaching Drive','4','3'],['Digital Awareness Campaign','6','4'],['Tree Plantation Support','5','2']].map(r=><tr key={r[0]}><td><b>{r[0]}</b></td><td>{r[1]}</td><td>{r[2]}</td><td><span className="badge badge-blue">Active</span></td></tr>)}</tbody></table></section></Layout>}
function Interested(){const [assigned,setAssigned]=useState('');return <Layout ngo active="/ngo-interested"><Header eyebrow="VOLUNTEER SELECTION" title="Interested Volunteers" text="Review volunteers who accepted your requirement."/><section className="panel" style={{marginBottom:16}}><b>Community Teaching Drive</b><p>4 needed • 3 volunteers accepted • Pune • 18 Sep 2026 • 9 AM–1 PM</p></section><div className="match-grid"><aside className="panel filters"><h3>Compare</h3><label>Skill<select><option>Teaching</option><option>Communication</option></select></label><label>Sort<select><option>Best fit</option><option>Experience</option><option>Match score</option></select></label></aside><section>{applicants.map(a=><article className="match-card" key={a.name}><div className="match-top"><div className="avatar">{a.initials}</div><div><h3>{a.name}</h3><p>{a.location} • {a.availability} • {a.assignments} previous assignments</p></div><div className="big-score">{a.score}%</div></div><div className="tags">{a.skills.map(s=><span className="tag" key={s}>✓ {s}</span>)}<span className="tag">{a.assignments} assignments</span><span className="tag">{a.hours} hours</span></div><p><b>Previous experience:</b> {a.experience}</p><div className="actions"><Link to="/volunteer-view" className="btn btn-soft">View full profile</Link><button className="btn btn-primary" onClick={()=>setAssigned(a.name)}>Select & Assign</button></div></article>)}{assigned&&<div className="toast show">{assigned} selected. Final assignment created.</div>}</section></div></Layout>}
function VolunteerView(){return <Layout ngo active="/ngo-interested"><Header eyebrow="VOLUNTEER PROFILE REVIEW" title="Ananya Sharma" text="Volunteer • Pune • Available weekdays" button={<Link to="/ngo-interested" className="btn btn-soft">← Back to applicants</Link>}/><section className="panel"><div className="profile-center"><div className="avatar avatar-lg">AS</div><h1>Ananya Sharma</h1><p>Volunteer • Pune • Available weekdays</p><div className="profile-stats"><span><b>12</b><small>Previous assignments</small></span><span><b>42</b><small>Hours contributed</small></span><span><b>4.9</b><small>Rating</small></span></div></div><hr style={{border:0,borderTop:'1px solid #edf1f5',margin:'20px 0'}}/><h2>Skills & domain</h2><div className="tags">{applicants[0].skills.concat(['Education']).map(s=><span className="tag" key={s}>{s}</span>)}</div><h2 style={{marginTop:25}}>Previous assignments</h2><div className="list">{['Community Teaching Drive','Digital Literacy Workshop','School Support Programme'].map(x=><div className="item" key={x}><div><b>{x}</b><small>Completed • 6 hours</small></div><span className="badge badge-green">Completed</span></div>)}</div><button className="btn btn-primary" style={{marginTop:22}} onClick={()=>go('/ngo-assignments')}>Select this volunteer</button></section></Layout>}
function NgoAssignments(){return <Layout ngo active="/ngo-assignments"><Header eyebrow="ASSIGNMENT MANAGEMENT" title="Final Assignments" text="Confirmed tasks sent to selected volunteers."/><section className="panel"><div className="item"><div className="avatar">AS</div><div><b>Ananya Sharma</b><small>Community Teaching Drive • Udaan Education Trust</small><small>📅 18 Sep 2026 • ⏰ 9 AM–1 PM • 📍 Pune</small><small>Task: Support school students through a community teaching session.</small></div><span className="badge badge-green">Assigned</span></div></section></Layout>}

function App(){
 const [path,setPath]=useState(window.location.hash.slice(1)||'/')
 window.onhashchange=()=>setPath(window.location.hash.slice(1)||'/')
 const current=JSON.parse(localStorage.getItem('volunteerlink_current_user')||'null')
 const protectedVolunteer=['/volunteer-dashboard','/volunteer-profile','/opportunities','/volunteer-accepted','/volunteer-assignments','/history']
 const protectedNgo=['/ngo-dashboard','/requirements','/ngo-requirements','/ngo-interested','/ngo-assignments']
 if(protectedVolunteer.includes(path) && (!current || current.role!=='volunteer')) return <Login/>
 if(protectedNgo.includes(path) && (!current || current.role!=='ngo')) return <Login/>
 const pages={'/':<Home/>,'/login':<Login/>,'/register':<Register/>,'/volunteer-dashboard':<VolunteerDashboard/>,'/volunteer-profile':<VolunteerProfile/>,'/opportunities':<Opportunities/>,'/volunteer-accepted':<Accepted/>,'/volunteer-assignments':<VolunteerAssignments/>,'/history':<History/>,'/ngo-dashboard':<NgoDashboard/>,'/requirements':<Requirements/>,'/ngo-requirements':<MyRequirements/>,'/ngo-interested':<Interested/>,'/volunteer-view':<VolunteerView/>,'/ngo-assignments':<NgoAssignments/>}
 return pages[path] || <Home/>
}

export default App
