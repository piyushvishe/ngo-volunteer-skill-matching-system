
import { useEffect, useState } from 'react'

/* =========================================================
   FRONTEND DATA LAYER
   ---------------------------------------------------------
   This file has NO hard-coded volunteers, NGOs, requirements,
   assignments or history records.

   For the current frontend-only stage, localStorage acts as the
   temporary data store. When Spring Boot + MySQL are connected,
   these helper functions can be replaced by API calls without
   changing the UI flow.
   ========================================================= */

const STORAGE = {
    users: 'volunteerlink_users',
    currentUser: 'volunteerlink_current_user',
    requirements: 'volunteerlink_requirements',
    interests: 'volunteerlink_interests',
    assignments: 'volunteerlink_assignments',
    history: 'volunteerlink_history',
}

function readStorage(key, fallback = []) {
    try {
        const value = localStorage.getItem(key)
        return value ? JSON.parse(value) : fallback
    } catch {
        return fallback
    }
}

function writeStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value))

    // Tell the current React app that data changed
    window.dispatchEvent(
        new CustomEvent('volunteerlink-data-change')
    )
}
function getCurrentUser() {
    return readStorage(STORAGE.currentUser, null)
}

function getUsers() {
    return readStorage(STORAGE.users, [])
}

function getVolunteers() {
    return getUsers().filter((user) => user.role === 'volunteer')
}

function getRequirements() {
    return readStorage(STORAGE.requirements, [])
}

function getInterests() {
    return readStorage(STORAGE.interests, [])
}

function getAssignments() {
    return readStorage(STORAGE.assignments, [])
}

function getHistory() {
    return readStorage(STORAGE.history, [])
}

function makeId(prefix) {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function go(path) {
    window.location.hash = path
}

function Link({ to, children, className = '', ...props }) {
    return (
        <a href={`#${to}`} className={className} {...props}>
            {children}
        </a>
    )
}

function Brand({ dark = false }) {
    return (
        <Link
            to="/"
            className="brand"
            style={dark ? { color: '#fff' } : {}}
        >
            <span className="brand-mark">🤝</span>
            <span>
        Volunteer<span>Link</span>
      </span>
        </Link>
    )
}

function Home() {
    return (
        <>
            <header className="topbar">
                <Brand />
                <nav className="nav">
                    <a href="#flow">How it works</a>
                    <a href="#modules">Modules</a>
                    <Link to="/login" className="btn btn-outline">Login</Link>
                    <Link to="/register" className="btn btn-primary">Get Started</Link>
                </nav>
            </header>

            <section className="hero">
                <div>
                    <span className="eyebrow">NGO VOLUNTEER–SKILL MATCHING SYSTEM</span>
                    <h1>
                        Right volunteer.
                        <br />
                        <span>Right NGO.</span>
                        <br />
                        Right time.
                    </h1>
                    <p>
                        A community platform where organisations post requirements,
                        volunteers receive recommendations, and NGOs select volunteers
                        based on their profiles and responses.
                    </p>
                    <div className="hero-actions">
                        <Link to="/register" className="btn btn-primary">Join the platform →</Link>
                        <a href="#flow" className="btn btn-soft">See the workflow</a>
                    </div>
                </div>

                <div className="hero-visual">
                    <div className="demo-window">
                        <div className="demo-head">
                            <b>VolunteerLink</b>
                            <span>Live platform</span>
                        </div>
                        <div className="demo-match">
                            <b>Connect volunteers with NGO requirements</b>
                            <small>Register → create profile → match → respond → assign</small>
                            <p>All application data is created by users.</p>
                            <Link to="/register" className="btn btn-primary btn-block">
                                Create account
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <section id="flow" className="section">
                <div className="section-head">
                    <span className="eyebrow">END-TO-END WORKFLOW</span>
                    <h2>Two-sided matching and assignment</h2>
                    <p>
                        NGOs create requirements. Volunteers maintain their profiles and
                        respond to suitable opportunities. NGOs then review and assign.
                    </p>
                </div>

                <div className="grid4">
                    {[
                        ['01', 'Organisation posts', 'Skills, domain, date, time, location, availability and task details.'],
                        ['02', 'Volunteer responds', 'Requirements are matched against the volunteer profile and the volunteer can express interest.'],
                        ['03', 'NGO reviews', 'The organisation sees volunteers who responded to its requirement and reviews their profiles.'],
                        ['04', 'Final assignment', 'The selected volunteer receives a confirmed assignment.'],
                    ].map((x) => (
                        <div className="card" key={x[0]}>
                            <div className="stepnum">{x[0]}</div>
                            <h3>{x[1]}</h3>
                            <p>{x[2]}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section id="modules" className="section" style={{ background: '#eef4fa' }}>
                <div className="section-head">
                    <span className="eyebrow">CORE MODULES</span>
                    <h2>Built around the project scope</h2>
                </div>
                <div className="grid4">
                    {[
                        ['👤', 'Volunteer Profile', 'Skills, location, availability and profile information.'],
                        ['🏢', 'Requirements', 'NGOs create and manage volunteer requirements.'],
                        ['🎯', 'Matching', 'Requirements are compared with volunteer skills and availability.'],
                        ['📋', 'Assignments & History', 'Tracks accepted responses and confirmed participation.'],
                    ].map((x) => (
                        <div className="card" key={x[1]}>
                            <h3>{x[0]} {x[1]}</h3>
                            <p>{x[2]}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="cta">
                <span className="eyebrow">VOLUNTEERLINK</span>
                <h2>From opportunity to meaningful participation.</h2>
                <p>Register as a volunteer or organisation to start using the system.</p>
                <Link to="/register" className="btn btn-primary">Start →</Link>
            </section>

            <footer className="footer">VolunteerLink • NGO Volunteer–Skill Matching System</footer>
        </>
    )
}

function AuthShell({ children, wide = false }) {
    return (
        <div className="auth">
            <div className="auth-shell" style={wide ? { maxWidth: 720 } : {}}>
                <div className="auth-top">
                    <Brand dark />
                    <Link to="/">← Home</Link>
                </div>
                {children}
            </div>
        </div>
    )
}

function Login() {
    const [role, setRole] = useState('volunteer')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')

    const submit = async (e) => {
        e.preventDefault()
        setError('')

        try {
            const response = await fetch('http://localhost:8080/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    email: email.trim(),
                    password: password,
                }),
            })

            if (!response.ok) {
                const message = await response.text()
                setError(message || 'Invalid email or password.')
                return
            }

            const user = await response.json()

            // Store the backend login response for the existing frontend UI.
            writeStorage(STORAGE.currentUser, {
                ...user,
                role: user.role?.toLowerCase(),
            })

            go(user.role?.toLowerCase() === 'ngo'
                ? '/ngo-dashboard'
                : '/volunteer-dashboard')
        } catch (error) {
            console.error('Login error:', error)
            setError('Unable to connect to the backend.')
        }
    }

    return (
        <AuthShell>
            <div className="auth-card">
                <div className="auth-info">
                    <span className="eyebrow">WELCOME BACK</span>
                    <h1>Continue your community journey.</h1>
                    <p>
                        Volunteers discover opportunities. Organisations review responses
                        and manage assignments.
                    </p>
                </div>

                <form className="form" onSubmit={submit}>
                    <h2>Sign in</h2>
                    <p className="muted">Use the account you created on VolunteerLink.</p>

                    <label>
                        Email
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                        />
                    </label>

                    <label>
                        Password
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                        />
                    </label>

                    <label>
                        Login as
                        <select value={role} onChange={(e) => setRole(e.target.value)}>
                            <option value="volunteer">Volunteer</option>
                            <option value="ngo">Organisation / NGO</option>
                        </select>
                    </label>

                    {error && <div className="form-error">{error}</div>}

                    <button className="btn btn-primary btn-block">Sign in →</button>

                    <p style={{ textAlign: 'center', marginTop: 18, fontSize: 12 }}>
                        New here?{' '}
                        <Link to="/register" style={{ color: '#2563eb', fontWeight: 700 }}>
                            Create account
                        </Link>
                    </p>
                </form>
            </div>
        </AuthShell>
    )
}

function Register() {
    const [role, setRole] = useState('volunteer')
    const [form, setForm] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        location: '',
        availability: 'Weekdays',
        skills: '',
        organisation: '',
        domain: '',
    })
    const [error, setError] = useState('')

    const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))

    const submit = (e) => {
        e.preventDefault()
        setError('')

        const users = getUsers()
        const email = form.email.trim().toLowerCase()

        if (users.some((u) => u.email.toLowerCase() === email)) {
            setError('An account with this email already exists. Please login.')
            return
        }

        const user = {
            id: makeId('user'),
            role,
            name: form.name.trim(),
            email,
            phone: form.phone.trim(),
            password: form.password,
            location: form.location.trim(),
            availability: form.availability,
            skills:
                role === 'volunteer'
                    ? form.skills.split(',').map((s) => s.trim()).filter(Boolean)
                    : [],
            organisation: role === 'ngo' ? form.organisation.trim() : '',
            domain: role === 'ngo' ? form.domain.trim() : '',
            createdAt: new Date().toISOString(),
        }

        users.push(user)
        writeStorage(STORAGE.users, users)
        alert('Account created successfully. Please login.')
        go('/login')
    }

    return (
        <AuthShell wide>
            <form className="form" style={{ borderRadius: 20, background: '#fff' }} onSubmit={submit}>
                <span className="eyebrow">CREATE ACCOUNT</span>
                <h1>Join VolunteerLink</h1>
                <p className="muted">Create an account based on how you will use the platform.</p>

                <div className="role-picker">
                    <button
                        type="button"
                        className={`role ${role === 'volunteer' ? 'active' : ''}`}
                        onClick={() => setRole('volunteer')}
                    >
                        <b>👤 Volunteer</b>
                        <small>Find and respond to opportunities</small>
                    </button>
                    <button
                        type="button"
                        className={`role ${role === 'ngo' ? 'active' : ''}`}
                        onClick={() => setRole('ngo')}
                    >
                        <b>🏢 Organisation / NGO</b>
                        <small>Post requirements and select volunteers</small>
                    </button>
                </div>

                <div className="two">
                    <label>
                        Full name
                        <input required value={form.name} onChange={(e) => update('name', e.target.value)} />
                    </label>
                    <label>
                        Email
                        <input type="email" required value={form.email} onChange={(e) => update('email', e.target.value)} />
                    </label>
                </div>

                <label>
                    Phone
                    <input required value={form.phone} onChange={(e) => update('phone', e.target.value)} />
                </label>

                <label>
                    Password
                    <input type="password" required minLength="4" value={form.password} onChange={(e) => update('password', e.target.value)} />
                </label>

                {role === 'volunteer' ? (
                    <>
                        <div className="two">
                            <label>
                                Location
                                <input required value={form.location} onChange={(e) => update('location', e.target.value)} placeholder="Mumbai" />
                            </label>
                            <label>
                                Availability
                                <select value={form.availability} onChange={(e) => update('availability', e.target.value)}>
                                    <option>Weekdays</option>
                                    <option>Weekends</option>
                                    <option>Flexible</option>
                                </select>
                            </label>
                        </div>

                        <label>
                            Skills / domain
                            <input
                                required
                                value={form.skills}
                                onChange={(e) => update('skills', e.target.value)}
                                placeholder="Teaching, Design, Social Work"
                            />
                            <small className="field-help">Enter multiple skills separated by commas.</small>
                        </label>
                    </>
                ) : (
                    <>
                        <label>
                            Organisation name
                            <input required value={form.organisation} onChange={(e) => update('organisation', e.target.value)} />
                        </label>
                        <label>
                            Focus domain
                            <input value={form.domain} onChange={(e) => update('domain', e.target.value)} placeholder="Education, Environment, Health" />
                        </label>
                    </>
                )}

                <label className="checkbox-label">
                    <input type="checkbox" required />
                    I agree to use the VolunteerLink platform.
                </label>

                {error && <div className="form-error">{error}</div>}

                <button className="btn btn-primary btn-block">Create account →</button>
            </form>
        </AuthShell>
    )
}

function Sidebar({ ngo = false, active = '' }) {
    const current = getCurrentUser()

    const displayName = ngo
        ? current?.organisation || current?.name || 'Organisation'
        : current?.name || 'Volunteer'

    const initials = displayName
        .split(' ')
        .map((x) => x[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()

    const items = ngo
        ? [
            ['/ngo-dashboard', '⌂', 'Dashboard'],
            ['/requirements', '＋', 'Post Requirements'],
            ['/ngo-requirements', '▤', 'My Requirements'],
            ['/ngo-interested', '◎', 'Interested Volunteers'],
            ['/ngo-assignments', '✓', 'Assignments'],
            ['/history', '◷', 'History & Reports'],
        ]
        : [
            ['/volunteer-dashboard', '⌂', 'Dashboard'],
            ['/volunteer-profile', '◉', 'My Profile'],
            ['/opportunities', '◎', 'Recommended Opportunities'],
            ['/volunteer-accepted', '✓', 'My Accepted'],
            ['/volunteer-assignments', '▣', 'My Assignments'],
            ['/history', '◷', 'Participation History'],
        ]

    const logout = () => {
        localStorage.removeItem(STORAGE.currentUser)
        go('/')
    }

    return (
        <aside className="sidebar">
            <Brand />
            <div className="user-mini">
                <div className={`avatar ${ngo ? 'org' : ''}`}>{initials}</div>
                <div>
                    <b>{displayName}</b>
                    <small>{ngo ? 'Organisation Admin' : 'Volunteer'}</small>
                </div>
            </div>

            <nav>
                {items.map((item) => (
                    <Link key={item[0]} to={item[0]} className={active === item[0] ? 'active' : ''}>
                        {item[1]} <span>{item[2]}</span>
                    </Link>
                ))}
            </nav>

            <button onClick={logout} className="logout">↪ <span>Logout</span></button>
        </aside>
    )
}

function Layout({ ngo = false, active, children }) {
    return (
        <div className="app-body">
            <Sidebar ngo={ngo} active={active} />
            <main className="main">{children}</main>
        </div>
    )
}

function Header({ eyebrow, title, text, button }) {
    return (
        <header className="header">
            <div>
                <span className="eyebrow">{eyebrow}</span>
                <h1>{title}</h1>
                <p>{text}</p>
            </div>
            {button}
        </header>
    )
}

function calculateMatch(requirement, volunteer) {
    const volunteerSkills = (volunteer?.skills || []).map((s) => s.toLowerCase().trim())
    const requiredSkills = (requirement?.skills || []).map((s) => s.toLowerCase().trim())

    const matchedSkills = requiredSkills.filter((skill) => volunteerSkills.includes(skill))
    const skillScore = requiredSkills.length
        ? Math.round((matchedSkills.length / requiredSkills.length) * 70)
        : 0

    const availabilityMatch =
        requirement.availability && volunteer.availability &&
        requirement.availability.toLowerCase() === volunteer.availability.toLowerCase()
            ? 15
            : 0

    const locationMatch =
        requirement.location && volunteer.location &&
        requirement.location.toLowerCase() === volunteer.location.toLowerCase()
            ? 15
            : 0

    return Math.min(100, skillScore + availabilityMatch + locationMatch)
}

function VolunteerDashboard() {
    const user = getCurrentUser()
    const requirements = getRequirements().filter((r) => r.status !== 'closed')

    const scored = requirements
        .map((requirement) => ({
            ...requirement,
            score: calculateMatch(requirement, user),
        }))
        .sort((a, b) => b.score - a.score)

    return (
        <Layout active="/volunteer-dashboard">
            <Header
                eyebrow="VOLUNTEER PORTAL"
                title={`Welcome, ${user?.name || 'Volunteer'} 👋`}
                text="Discover opportunities that fit your skills and availability."
                button={<Link to="/opportunities" className="btn btn-primary">View recommendations →</Link>}
            />

            <div className="metric-grid">
                <div className="metric"><span>Available opportunities</span><b>{requirements.length}</b></div>
                <div className="metric"><span>My responses</span><b>{getInterests().filter((i) => i.volunteerId === user?.id).length}</b></div>
                <div className="metric"><span>Assignments</span><b>{getAssignments().filter((a) => a.volunteerId === user?.id).length}</b></div>
                <div className="metric"><span>Completed</span><b>{getHistory().filter((h) => h.volunteerId === user?.id).length}</b></div>
            </div>

            <div className="content">
                <section className="panel">
                    <div className="panel-head">
                        <div>
                            <h2>Recommended opportunities</h2>
                            <p>Calculated from your profile.</p>
                        </div>
                        <Link to="/opportunities">View all</Link>
                    </div>

                    {scored.length === 0 ? (
                        <EmptyState title="No opportunities available yet" text="NGOs will appear here after they post requirements." />
                    ) : (
                        <div className="list">
                            {scored.slice(0, 3).map((o) => (
                                <div className="item" key={o.id}>
                                    <div className="avatar">{(o.ngoName || 'NG').slice(0, 2).toUpperCase()}</div>
                                    <div>
                                        <b>{o.title}</b>
                                        <small>{o.ngoName} • {o.location} • {o.date}</small>
                                    </div>
                                    <div className="right">
                                        <b className="green">{o.score}%</b>
                                        <small>Match</small>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                <section className="panel">
                    <div className="panel-head">
                        <div>
                            <h2>Your profile</h2>
                            <p>Used for matching.</p>
                        </div>
                        <Link to="/volunteer-profile">Edit</Link>
                    </div>
                    <div className="tags">
                        {(user?.skills || []).length ? user.skills.map((s) => <span className="tag" key={s}>{s}</span>) : <span className="muted">No skills added.</span>}
                    </div>
                    <p className="muted" style={{ marginTop: 18 }}>Availability: <b>{user?.availability || 'Not set'}</b></p>
                    <p className="muted">Location: <b>{user?.location || 'Not set'}</b></p>
                </section>
            </div>
        </Layout>
    )
}

function EmptyState({ title, text }) {
    return (
        <div className="empty-state">
            <h3>{title}</h3>
            <p className="muted">{text}</p>
        </div>
    )
}

function VolunteerProfile() {
    const [user, setUser] = useState(getCurrentUser)
    const [editing, setEditing] = useState(false)
    const [form, setForm] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        location: user?.location || '',
        availability: user?.availability || 'Weekdays',
        skills: Array.isArray(user?.skills) ? user.skills.join(', ') : '',
    })

    const initials = (user?.name || 'Volunteer')
        .split(' ').map((x) => x[0]).join('').slice(0, 2).toUpperCase()

    const startEditing = () => {
        setForm({
            name: user?.name || '',
            email: user?.email || '',
            phone: user?.phone || '',
            location: user?.location || '',
            availability: user?.availability || 'Weekdays',
            skills: Array.isArray(user?.skills) ? user.skills.join(', ') : '',
        })
        setEditing(true)
    }

    const saveProfile = () => {
        const updatedUser = {
            ...user,
            name: form.name.trim(),
            phone: form.phone.trim(),
            location: form.location.trim(),
            availability: form.availability,
            skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean),
        }

        const users = getUsers().map((u) => u.id === updatedUser.id ? updatedUser : u)
        writeStorage(STORAGE.users, users)
        writeStorage(STORAGE.currentUser, updatedUser)
        setUser(updatedUser)
        setEditing(false)
    }

    const cancelEditing = () => {
        setForm({
            name: user?.name || '',
            email: user?.email || '',
            phone: user?.phone || '',
            location: user?.location || '',
            availability: user?.availability || 'Weekdays',
            skills: Array.isArray(user?.skills) ? user.skills.join(', ') : '',
        })
        setEditing(false)
    }

    const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))

    return (
        <Layout active="/volunteer-profile">
            <Header eyebrow="MY PROFILE" title="Volunteer Profile" text="Your profile information is used for opportunity matching." />

            <div className="profile-grid">
                <section className="panel">
                    <div className="profile-cover"></div>
                    <div className="profile-center">
                        <div className="avatar avatar-lg">{initials}</div>
                        <h2>{user?.name}</h2>
                        <p>Volunteer • {user?.location || 'Location not set'} • Available {user?.availability || 'not set'}</p>
                        <div className="profile-stats">
                            <span><b>{getAssignments().filter((a) => a.volunteerId === user?.id).length}</b><small>Assignments</small></span>
                            <span><b>{getHistory().filter((h) => h.volunteerId === user?.id).reduce((sum, h) => sum + Number(h.hours || 0), 0)}</b><small>Hours</small></span>
                            <span><b>—</b><small>Rating</small></span>
                        </div>
                    </div>
                </section>

                <section className="panel">
                    <div className="panel-head">
                        <div><h2>Profile details</h2></div>
                        {!editing && <button className="btn btn-primary" onClick={startEditing}>Edit Profile</button>}
                    </div>

                    <div className="form">
                        <label>Full name<input value={form.name} readOnly={!editing} onChange={(e) => update('name', e.target.value)} /></label>
                        <label>Email<input value={form.email} readOnly style={{ background: '#f3f4f6', cursor: 'not-allowed' }} /></label>
                        <label>Phone<input value={form.phone} readOnly={!editing} onChange={(e) => update('phone', e.target.value)} /></label>
                        <label>Location<input value={form.location} readOnly={!editing} onChange={(e) => update('location', e.target.value)} /></label>
                        <label>
                            Availability
                            {editing ? (
                                <select value={form.availability} onChange={(e) => update('availability', e.target.value)}>
                                    <option>Weekdays</option><option>Weekends</option><option>Flexible</option>
                                </select>
                            ) : <input value={form.availability} readOnly />}
                        </label>
                        <label>
                            Skills / Domain
                            <input value={form.skills} readOnly={!editing} onChange={(e) => update('skills', e.target.value)} placeholder="Teaching, Communication, Java" />
                            {editing && <small className="field-help">Enter multiple skills separated by commas.</small>}
                        </label>
                    </div>

                    {!editing && <div className="tags" style={{ marginTop: 20 }}>{(user?.skills || []).length ? user.skills.map((s) => <span className="tag" key={s}>{s}</span>) : <span className="muted">No skills added.</span>}</div>}

                    {editing && (
                        <div style={{ display: 'flex', gap: 10, marginTop: 25 }}>
                            <button className="btn btn-primary" onClick={saveProfile}>Save Changes</button>
                            <button className="btn btn-soft" onClick={cancelEditing}>Cancel</button>
                        </div>
                    )}
                </section>
            </div>
        </Layout>
    )
}

function Opportunities() {
    const user = getCurrentUser()
    const [requirements, setRequirements] = useState(getRequirements)
    const [query, setQuery] = useState('')
    const [domain, setDomain] = useState('all')
    const [sort, setSort] = useState('match')
    const interests = getInterests()

    const scored = requirements
        .filter((r) => r.status !== 'closed')
        .map((r) => ({ ...r, score: calculateMatch(r, user) }))
        .filter((r) => {
            const q = query.toLowerCase()
            const matchesQuery = !q || r.title.toLowerCase().includes(q) || r.ngoName.toLowerCase().includes(q) || (r.domain || '').toLowerCase().includes(q)
            const matchesDomain = domain === 'all' || r.domain === domain
            return matchesQuery && matchesDomain
        })
        .sort((a, b) => sort === 'latest' ? new Date(b.createdAt) - new Date(a.createdAt) : b.score - a.score)

    const respond = (requirement) => {
        const existing = getInterests()
        if (existing.some((i) => i.requirementId === requirement.id && i.volunteerId === user.id)) return

        existing.push({
            id: makeId('interest'),
            requirementId: requirement.id,
            volunteerId: user.id,
            ngoId: requirement.ngoId,
            status: 'interested',
            createdAt: new Date().toISOString(),
        })
        writeStorage(STORAGE.interests, existing)
        setRequirements(getRequirements())
    }

    const domains = [...new Set(requirements.map((r) => r.domain).filter(Boolean))]

    return (
        <Layout active="/opportunities">
            <Header eyebrow="OPPORTUNITIES" title="Opportunities for you" text="Requirements posted by registered organisations and matched to your profile." />

            <div className="toolbar">
                <div className="search">🔎<input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search opportunities" /></div>
                <select value={domain} onChange={(e) => setDomain(e.target.value)}><option value="all">All domains</option>{domains.map((d) => <option key={d} value={d}>{d}</option>)}</select>
                <select value={sort} onChange={(e) => setSort(e.target.value)}><option value="match">Best match</option><option value="latest">Latest</option></select>
            </div>

            {scored.length === 0 ? (
                <section className="panel"><EmptyState title="No opportunities found" text="There are no NGO requirements matching the current filters." /></section>
            ) : (
                <div className="grid4">
                    {scored.map((r) => {
                        const interested = interests.some((i) => i.requirementId === r.id && i.volunteerId === user.id)
                        return (
                            <article className="card" key={r.id}>
                                <span className="badge badge-green">{r.score}% match</span>
                                <h3 style={{ marginTop: 12 }}>{r.title}</h3>
                                <p>{r.ngoName}</p>
                                <p style={{ fontSize: 12, marginTop: 8 }}>
                                    📍 {r.location}<br />
                                    📅 {r.date}<br />
                                    ⏰ {r.time}<br />
                                    👥 {r.volunteersNeeded} volunteer{Number(r.volunteersNeeded) === 1 ? '' : 's'} needed
                                </p>
                                <div className="tags">{(r.skills || []).map((s) => <span className="tag" key={s}>{s}</span>)}</div>
                                <p>{r.description}</p>
                                <button className="btn btn-primary btn-block" disabled={interested} onClick={() => respond(r)}>
                                    {interested ? 'Interested ✓' : 'I’m Interested'}
                                </button>
                            </article>
                        )
                    })}
                </div>
            )}
        </Layout>
    )
}

function Accepted() {
    const user = getCurrentUser()
    const interests = getInterests().filter((i) => i.volunteerId === user?.id)
    const requirements = getRequirements()
    const responded = interests.map((i) => requirements.find((r) => r.id === i.requirementId)).filter(Boolean)

    return (
        <Layout active="/volunteer-accepted">
            <Header eyebrow="VOLUNTEER RESPONSES" title="My Accepted Opportunities" text="Requirements where you have expressed interest and are awaiting NGO selection." />
            <section className="panel">
                {responded.length === 0 ? <EmptyState title="No responses yet" text="Express interest in an opportunity and it will appear here." /> : (
                    <div className="list">
                        {responded.map((r) => (
                            <div className="item" key={r.id}>
                                <div className="avatar">{r.ngoName.slice(0, 2).toUpperCase()}</div>
                                <div><b>{r.title}</b><small>{r.ngoName} • {r.location} • {r.date} • {r.time}</small></div>
                                <span className="badge badge-yellow">Awaiting NGO selection</span>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </Layout>
    )
}

function VolunteerAssignments() {
    const user = getCurrentUser()

    const loadAssignments = () => {
        const currentUser = getCurrentUser()

        if (!currentUser) {
            setAssignments([])
            return
        }

        const allAssignments = getAssignments()

        const userAssignments = allAssignments.filter(
            (assignment) =>
                String(assignment.volunteerId) ===
                String(currentUser.id)
        )

        setAssignments(userAssignments)
    }

    const [assignments, setAssignments] = useState(() => {
        if (!user) return []

        return getAssignments().filter(
            (assignment) =>
                String(assignment.volunteerId) ===
                String(user.id)
        )
    })

    useEffect(() => {
        // Load immediately
        loadAssignments()

        // Same-tab updates
        window.addEventListener(
            'volunteerlink-data-change',
            loadAssignments
        )

        // Other-tab updates
        window.addEventListener(
            'storage',
            loadAssignments
        )

        return () => {
            window.removeEventListener(
                'volunteerlink-data-change',
                loadAssignments
            )

            window.removeEventListener(
                'storage',
                loadAssignments
            )
        }
    }, [])

    return (
        <Layout active="/volunteer-assignments">
            <Header
                eyebrow="MY ASSIGNMENTS"
                title="Confirmed Assignments"
                text="Tasks selected and confirmed by organisations."
            />

            <section className="panel">
                {assignments.length === 0 ? (
                    <EmptyState
                        title="No assignments yet"
                        text="When an NGO selects you, the confirmed assignment will appear here."
                    />
                ) : (
                    <div className="list">
                        {assignments.map((assignment) => (
                            <div
                                className="item"
                                key={assignment.id}
                            >
                                <div className="avatar">
                                    {(assignment.ngoName || 'NG')
                                        .slice(0, 2)
                                        .toUpperCase()}
                                </div>

                                <div>
                                    <b>
                                        {assignment.requirementTitle}
                                    </b>

                                    <small>
                                        {assignment.ngoName}
                                        {' • '}
                                        {assignment.location}
                                    </small>

                                    <small>
                                        📅 {assignment.date}
                                        {' • '}
                                        ⏰ {assignment.time}
                                    </small>

                                    <small>
                                        {assignment.description}
                                    </small>
                                </div>

                                <span
                                    className={
                                        assignment.status === 'completed'
                                            ? 'badge badge-green'
                                            : 'badge badge-blue'
                                    }
                                >
                                    {assignment.status === 'completed'
                                        ? 'Completed'
                                        : 'Confirmed'}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </Layout>
    )
}
function History() {
    const user = getCurrentUser()
    const isNgo = user?.role === 'ngo'
    const history = getHistory().filter((h) => isNgo ? h.ngoId === user.id : h.volunteerId === user.id)

    const completedHours = history.reduce((sum, h) => sum + Number(h.hours || 0), 0)

    return (
        <Layout ngo={isNgo} active="/history">
            <Header eyebrow="HISTORY & REPORTS" title="History & Reports" text="Track completed participation and activity from actual system records." />

            <div className="metric-grid">
                <div className="metric"><span>Records</span><b>{history.length}</b></div>
                <div className="metric"><span>Completed</span><b>{history.filter((h) => h.status === 'completed').length}</b></div>
                <div className="metric"><span>Hours</span><b>{completedHours}</b></div>
                <div className="metric"><span>Status</span><b>{history.length ? 'Active' : '—'}</b></div>
            </div>

            <section className="panel">
                {history.length === 0 ? <EmptyState title="No history yet" text="Completed participation records will appear here." /> : (
                    <div className="list">
                        {history.map((h) => (
                            <div className="history-row" key={h.id}>
                                <div className="history-icon">✓</div>
                                <div><b>{h.requirementTitle}</b><small>{h.ngoName} • {h.date} • {h.hours || 0} hours</small></div>
                                <span className="badge badge-green">{h.status}</span>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </Layout>
    )
}

function NgoDashboard() {
    const user = getCurrentUser()
    const requirements = getRequirements().filter((r) => r.ngoId === user?.id)
    const interests = getInterests().filter((i) => i.ngoId === user?.id)
    const assignments = getAssignments().filter((a) => a.ngoId === user?.id)
    const completed = getHistory().filter((h) => h.ngoId === user?.id)

    return (
        <Layout ngo active="/ngo-dashboard">
            <Header
                eyebrow="ORGANISATION PORTAL"
                title={`Welcome, ${user?.organisation || user?.name || 'Organisation'} 👋`}
                text="Manage your requirements, review volunteer responses and confirm assignments."
                button={<Link to="/requirements" className="btn btn-primary">Post requirement →</Link>}
            />

            <div className="metric-grid">
                <div className="metric"><span>Active requirements</span><b>{requirements.filter((r) => r.status !== 'closed').length}</b></div>
                <div className="metric"><span>Interested volunteers</span><b>{interests.length}</b></div>
                <div className="metric"><span>Assignments</span><b>{assignments.length}</b></div>
                <div className="metric"><span>Completed</span><b>{completed.length}</b></div>
            </div>

            <div className="content">
                <section className="panel">
                    <div className="panel-head"><div><h2>My requirements</h2><p>Requirements created by your organisation.</p></div><Link to="/ngo-requirements">View all</Link></div>
                    {requirements.length === 0 ? <EmptyState title="No requirements posted" text="Create your first volunteer requirement." /> : (
                        <div className="list">
                            {requirements.slice(0, 5).map((r) => <div className="item" key={r.id}><div><b>{r.title}</b><small>{r.location} • {r.date} • {r.volunteersNeeded} needed</small></div><span className="badge badge-blue">{r.status}</span></div>)}
                        </div>
                    )}
                </section>

                <section className="panel">
                    <div className="panel-head"><div><h2>Volunteer responses</h2><p>People who expressed interest in your requirements.</p></div><Link to="/ngo-interested">Review</Link></div>
                    {interests.length === 0 ? <EmptyState title="No responses yet" text="Volunteer responses will appear here when they express interest." /> : <div className="list"><div className="item"><div><b>{interests.length} response{interests.length === 1 ? '' : 's'}</b><small>Open Interested Volunteers to review profiles.</small></div><Link to="/ngo-interested" className="action">Review</Link></div></div>}
                </section>
            </div>
        </Layout>
    )
}
function Requirements() {
    const user = getCurrentUser()

    const [form, setForm] = useState({
        title: '',
        volunteersNeeded: 1,
        domain: '',
        location: '',
        date: '',
        time: '',
        availability: 'Flexible',
        skills: '',
        description: '',
    })

    const [message, setMessage] = useState('')

    const update = (key, value) => {
        setForm((prev) => ({
            ...prev,
            [key]: value,
        }))
    }

    const submit = async (e) => {
        e.preventDefault()
        setMessage('')

        try {
            const response = await fetch(
                'http://localhost:8080/api/requirements',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify({
                        title: form.title.trim(),
                        volunteersNeeded: Number(form.volunteersNeeded),
                        domain: form.domain.trim(),
                        location: form.location.trim(),
                        date: form.date,
                        time: form.time.trim(),
                        taskDescription: form.description.trim(),
                        status: 'OPEN',
                    }),
                }
            )

            if (!response.ok) {
                const errorMessage = await response.text()

                setMessage(
                    errorMessage || 'Failed to post requirement.'
                )

                return
            }

            await response.json()

            setForm({
                title: '',
                volunteersNeeded: 1,
                domain: '',
                location: '',
                date: '',
                time: '',
                availability: 'Flexible',
                skills: '',
                description: '',
            })

            setMessage('Requirement posted successfully.')

        } catch (error) {
            console.error('Requirement error:', error)

            setMessage(
                'Unable to connect to the backend.'
            )
        }
    }

    return (
        <Layout ngo active="/requirements">

            <Header
                eyebrow="POST REQUIREMENT"
                title="Create a volunteer requirement"
                text="Describe the actual task so volunteers can find it and respond."
            />

            <form
                className="panel form"
                style={{ maxWidth: 850 }}
                onSubmit={submit}
            >

                <div className="two">

                    <label>
                        Requirement title

                        <input
                            required
                            value={form.title}
                            onChange={(e) =>
                                update('title', e.target.value)
                            }
                        />
                    </label>

                    <label>
                        Volunteers needed

                        <input
                            required
                            type="number"
                            min="1"
                            value={form.volunteersNeeded}
                            onChange={(e) =>
                                update(
                                    'volunteersNeeded',
                                    e.target.value
                                )
                            }
                        />
                    </label>

                </div>

                <div className="two">

                    <label>
                        Domain

                        <input
                            required
                            value={form.domain}
                            onChange={(e) =>
                                update('domain', e.target.value)
                            }
                            placeholder="Education"
                        />
                    </label>

                    <label>
                        Location

                        <input
                            required
                            value={form.location}
                            onChange={(e) =>
                                update('location', e.target.value)
                            }
                        />
                    </label>

                </div>

                <div className="two">

                    <label>
                        Date

                        <input
                            required
                            type="date"
                            value={form.date}
                            onChange={(e) =>
                                update('date', e.target.value)
                            }
                        />
                    </label>

                    <label>
                        Time

                        <input
                            required
                            value={form.time}
                            onChange={(e) =>
                                update('time', e.target.value)
                            }
                            placeholder="9 AM - 1 PM"
                        />
                    </label>

                </div>

                <label>
                    Availability

                    <select
                        value={form.availability}
                        onChange={(e) =>
                            update(
                                'availability',
                                e.target.value
                            )
                        }
                    >
                        <option>Weekdays</option>
                        <option>Weekends</option>
                        <option>Flexible</option>
                    </select>
                </label>

                <label>
                    Required skills

                    <input
                        required
                        value={form.skills}
                        onChange={(e) =>
                            update('skills', e.target.value)
                        }
                        placeholder="Teaching, Communication"
                    />
                </label>

                <label>
                    Task description

                    <textarea
                        required
                        rows="5"
                        value={form.description}
                        onChange={(e) =>
                            update(
                                'description',
                                e.target.value
                            )
                        }
                    />
                </label>

                <button className="btn btn-primary">
                    Post requirement →
                </button>

                {message && (
                    <span className="badge badge-green">
                        {message}
                    </span>
                )}

            </form>

        </Layout>
    )
}

function Interested() {
    const user = getCurrentUser()
    const requirements = getRequirements().filter((r) => r.ngoId === user?.id)
    const [selectedRequirementId, setSelectedRequirementId] = useState(requirements[0]?.id || '')
    const [volunteers, setVolunteers] = useState(getVolunteers())
    const [assigned, setAssigned] = useState('')

    const interests = getInterests().filter((i) => i.ngoId === user?.id && (!selectedRequirementId || i.requirementId === selectedRequirementId))
    const requirement = requirements.find((r) => r.id === selectedRequirementId)

    const refresh = () => setVolunteers(getVolunteers())

    const assign = (volunteer, req) => {
        if (!req) return
        const assignments = getAssignments()
        if (assignments.some((a) => a.requirementId === req.id && a.volunteerId === volunteer.id)) return

        assignments.push({
            id: makeId('assignment'),
            requirementId: req.id,
            volunteerId: volunteer.id,
            ngoId: user.id,
            volunteerName: volunteer.name,
            ngoName: user.organisation || user.name,
            requirementTitle: req.title,
            location: req.location,
            date: req.date,
            time: req.time,
            description: req.description,
            status: 'assigned',
            createdAt: new Date().toISOString(),
        })
        writeStorage(STORAGE.assignments, assignments)
        setAssigned(volunteer.name)
    }

    return (
        <Layout ngo active="/ngo-interested">
            <Header eyebrow="VOLUNTEER SELECTION" title="Interested Volunteers" text="Review real registered volunteers who responded to your requirements." />

            {requirements.length === 0 ? (
                <section className="panel"><EmptyState title="No requirements posted" text="Post a requirement first. Volunteer responses will be linked to that requirement." /></section>
            ) : (
                <>
                    <section className="panel" style={{ marginBottom: 16 }}>
                        <label>
                            Requirement
                            <select value={selectedRequirementId} onChange={(e) => setSelectedRequirementId(e.target.value)}>
                                {requirements.map((r) => <option key={r.id} value={r.id}>{r.title}</option>)}
                            </select>
                        </label>
                        {requirement && <p>{requirement.volunteersNeeded} needed • {requirement.location} • {requirement.date} • {requirement.time}</p>}
                    </section>

                    <section>
                        {interests.length === 0 ? (
                            <section className="panel"><EmptyState title="No volunteers have responded yet" text="When a volunteer clicks “I’m Interested” for this requirement, they will appear here." /></section>
                        ) : (
                            interests.map((interest) => {
                                const volunteer = volunteers.find((v) => v.id === interest.volunteerId)
                                if (!volunteer) return null
                                const score = calculateMatch(requirement, volunteer)
                                const initials = volunteer.name.split(' ').map((x) => x[0]).join('').slice(0, 2).toUpperCase()
                                const alreadyAssigned = getAssignments().some((a) => a.requirementId === requirement.id && a.volunteerId === volunteer.id)

                                return (
                                    <article className="match-card" key={interest.id}>
                                        <div className="match-top">
                                            <div className="avatar">{initials}</div>
                                            <div><h3>{volunteer.name}</h3><p>{volunteer.location} • {volunteer.availability}</p><p>{volunteer.email} • {volunteer.phone}</p></div>
                                            <div className="big-score">{score}%</div>
                                        </div>
                                        <div className="tags">{(volunteer.skills || []).map((s) => <span className="tag" key={s}>✓ {s}</span>)}</div>
                                        <div className="actions">
                                            <Link to={`/volunteer-view?id=${volunteer.id}`} className="btn btn-soft">View full profile</Link>
                                            <button className="btn btn-primary" disabled={alreadyAssigned} onClick={() => assign(volunteer, requirement)}>{alreadyAssigned ? 'Assigned ✓' : 'Select & Assign'}</button>
                                        </div>
                                    </article>
                                )
                            })
                        )}
                    </section>
                    {assigned && <div className="toast show">{assigned} selected. Assignment created.</div>}
                </>
            )}
            <button onClick={refresh} style={{ display: 'none' }}>refresh</button>
        </Layout>
    )
}

function VolunteerView() {
    const params = new URLSearchParams(window.location.hash.split('?')[1] || '')
    const volunteerId = params.get('id')
    const volunteer = getVolunteers().find((v) => v.id === volunteerId)

    if (!volunteer) {
        return <Layout ngo active="/ngo-interested"><Header eyebrow="VOLUNTEER PROFILE" title="Volunteer not found" text="The requested volunteer does not exist in the current data." button={<Link to="/ngo-interested" className="btn btn-soft">← Back</Link>} /><section className="panel"><EmptyState title="Volunteer not found" text="Return to Interested Volunteers and select a registered volunteer." /></section></Layout>
    }

    const initials = volunteer.name.split(' ').map((x) => x[0]).join('').slice(0, 2).toUpperCase()
    const assignments = getHistory().filter((h) => h.volunteerId === volunteer.id)

    return (
        <Layout ngo active="/ngo-interested">
            <Header eyebrow="VOLUNTEER PROFILE REVIEW" title={volunteer.name} text={`Volunteer • ${volunteer.location || 'Location not set'} • ${volunteer.availability || 'Availability not set'}`} button={<Link to="/ngo-interested" className="btn btn-soft">← Back</Link>} />
            <section className="panel">
                <div className="profile-center">
                    <div className="avatar avatar-lg">{initials}</div>
                    <h1>{volunteer.name}</h1>
                    <p>{volunteer.email} • {volunteer.phone}</p>
                    <div className="profile-stats">
                        <span><b>{getAssignments().filter((a) => a.volunteerId === volunteer.id).length}</b><small>Assignments</small></span>
                        <span><b>{assignments.reduce((sum, h) => sum + Number(h.hours || 0), 0)}</b><small>Hours</small></span>
                        <span><b>—</b><small>Rating</small></span>
                    </div>
                </div>
                <hr style={{ border: 0, borderTop: '1px solid #edf1f5', margin: '20px 0' }} />
                <h2>Skills & domain</h2>
                <div className="tags">{(volunteer.skills || []).map((s) => <span className="tag" key={s}>{s}</span>)}</div>
                <h2 style={{ marginTop: 25 }}>Previous participation</h2>
                {assignments.length === 0 ? <p className="muted">No completed participation records.</p> : <div className="list">{assignments.map((h) => <div className="item" key={h.id}><div><b>{h.requirementTitle}</b><small>{h.date} • {h.hours || 0} hours</small></div><span className="badge badge-green">Completed</span></div>)}</div>}
            </section>
        </Layout>
    )
}

function NgoAssignments() {
    const user = getCurrentUser()
    const assignments = getAssignments().filter((a) => a.ngoId === user?.id)
    const [list, setList] = useState(assignments)

    const complete = (assignment) => {
        const all = getAssignments().map((a) => a.id === assignment.id ? { ...a, status: 'completed' } : a)
        writeStorage(STORAGE.assignments, all)

        const history = getHistory()
        if (!history.some((h) => h.assignmentId === assignment.id)) {
            history.push({
                id: makeId('history'),
                assignmentId: assignment.id,
                requirementId: assignment.requirementId,
                volunteerId: assignment.volunteerId,
                ngoId: assignment.ngoId,
                requirementTitle: assignment.requirementTitle,
                ngoName: assignment.ngoName,
                date: assignment.date,
                hours: 0,
                status: 'completed',
                createdAt: new Date().toISOString(),
            })
            writeStorage(STORAGE.history, history)
        }
        setList(all.filter((a) => a.ngoId === user.id))
    }

    return (
        <Layout ngo active="/ngo-assignments">
            <Header eyebrow="ASSIGNMENT MANAGEMENT" title="Final Assignments" text="Confirmed tasks selected by your organisation." />
            <section className="panel">
                {list.length === 0 ? <EmptyState title="No assignments yet" text="Select a volunteer from the responses to create an assignment." /> : <div className="list">{list.map((a) => <div className="item" key={a.id}><div className="avatar">{a.volunteerName.slice(0, 2).toUpperCase()}</div><div><b>{a.volunteerName}</b><small>{a.requirementTitle} • {a.location}</small><small>📅 {a.date} • ⏰ {a.time}</small><small>{a.description}</small></div><span className={`badge ${a.status === 'completed' ? 'badge-green' : 'badge-blue'}`}>{a.status === 'completed' ? 'Completed' : 'Assigned'}</span>{a.status !== 'completed' && <button className="action" onClick={() => complete(a)}>Mark completed</button>}</div>)}</div>}
            </section>
        </Layout>
    )
}

function App() {
    const [path, setPath] = useState(window.location.hash.slice(1) || '/')

    useEffect(() => {
        const onHashChange = () => setPath(window.location.hash.slice(1) || '/')
        window.addEventListener('hashchange', onHashChange)
        return () => window.removeEventListener('hashchange', onHashChange)
    }, [])

    const routePath = path.split('?')[0]
    const current = getCurrentUser()

    const protectedVolunteer = [
        '/volunteer-dashboard', '/volunteer-profile', '/opportunities',
        '/volunteer-accepted', '/volunteer-assignments',
    ]

    const protectedAnyUser = ['/history']

    const protectedNgo = [
        '/ngo-dashboard', '/requirements', '/ngo-requirements',
        '/ngo-interested', '/ngo-assignments', '/volunteer-view',
    ]

    if (protectedVolunteer.includes(routePath) && (!current || current.role !== 'volunteer')) return <Login />
    if (protectedNgo.includes(routePath) && (!current || current.role !== 'ngo')) return <Login />
    if (protectedAnyUser.includes(routePath) && !current) return <Login />

    const pages = {
        '/': <Home />,
        '/login': <Login />,
        '/register': <Register />,
        '/volunteer-dashboard': <VolunteerDashboard />,
        '/volunteer-profile': <VolunteerProfile />,
        '/opportunities': <Opportunities />,
        '/volunteer-accepted': <Accepted />,
        '/volunteer-assignments': <VolunteerAssignments />,
        '/history': <History />,
        '/ngo-dashboard': <NgoDashboard />,
        '/requirements': <Requirements />,
        '/ngo-requirements': <MyRequirements />,
        '/ngo-interested': <Interested />,
        '/volunteer-view': <VolunteerView />,
        '/ngo-assignments': <NgoAssignments />,
    }

    return pages[routePath] || <Home />
}
export default App
