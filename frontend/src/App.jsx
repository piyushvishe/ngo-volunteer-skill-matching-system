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
    ratings: 'volunteerlink_ratings',
}

const DOMAINS = [
    'Education',
    'Healthcare',
    'Environment',
    'Community Development',
    'Animal Welfare',
    'Disaster Relief',
    'Women & Child Welfare',
    'Senior Citizen Support',
    'Fundraising',
    'Other',
]

const SKILL_GROUPS = {
    healthcare: ['healthcare', 'health', 'medical', 'first aid', 'patient care', 'patient assistance', 'health screening', 'health checkup', 'medical assistance', 'nursing', 'nursing assistance', 'clinic', 'doctor'],
    education: ['teaching', 'teacher', 'tutor', 'tutoring', 'education', 'mentoring', 'academic', 'classroom', 'training'],
    communication: ['communication', 'public speaking', 'speaking', 'counselling', 'counseling', 'interpersonal', 'coordination', 'outreach'],
    design: ['design', 'graphic design', 'ui', 'ux', 'ui/ux', 'illustration', 'photoshop', 'canva', 'creative'],
    technology: ['technology', 'tech', 'computer', 'programming', 'coding', 'software', 'web', 'data', 'it', 'digital'],
    socialWork: ['social work', 'social service', 'community service', 'community outreach', 'volunteering', 'ngo', 'community development'],
    fundraising: ['fundraising', 'fund raising', 'donation', 'donor', 'campaign', 'event management', 'event planning'],
    environment: ['environment', 'environmental', 'tree plantation', 'recycling', 'waste management', 'sustainability', 'conservation'],
}

function normalizeText(value = '') {
    return String(value).toLowerCase().trim()
}

function getLocationParts(person = {}) {
    if (person.city || person.area || person.street) {
        return {
            city: person.city || '',
            area: person.area || '',
            street: person.street || '',
        }
    }

    const parts = String(person.location || '').split(',').map((x) => x.trim()).filter(Boolean)
    return {
        city: parts[0] || '',
        area: parts[1] || '',
        street: parts.slice(2).join(', ') || '',
    }
}

function formatLocation(person = {}) {
    const { city, area, street } = getLocationParts(person)
    return [city, area, street].filter(Boolean).join(', ') || person.location || 'Location not set'
}

function getDayType(date) {
    if (!date) return ''
    const day = new Date(`${date}T00:00:00`).getDay()
    return day === 0 || day === 6 ? 'weekends' : 'weekdays'
}

function parseTimePart(value) {
    const match = String(value || '').trim().toLowerCase().match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/)
    if (!match) return null

    let hour = Number(match[1])
    const minute = Number(match[2] || 0)
    const period = match[3]

    if (period === 'pm' && hour < 12) hour += 12
    if (period === 'am' && hour === 12) hour = 0

    return { hour, minute }
}

function getAssignmentEndDateTime(assignment) {
    if (!assignment?.date || !assignment?.time) return null

    const timeParts = String(assignment.time)
        .replace(/[–—]/g, '-')
        .split('-')
        .map((part) => part.trim())

    if (timeParts.length < 2) return null

    const start = parseTimePart(timeParts[0])
    const end = parseTimePart(timeParts[1])
    if (!start || !end) return null

    // If the end time has no AM/PM, use the start period where possible.
    if (!/[ap]m/i.test(timeParts[1]) && /[ap]m/i.test(timeParts[0])) {
        const period = timeParts[0].toLowerCase().includes('pm') ? 'pm' : 'am'
        if (period === 'pm' && end.hour < 12) end.hour += 12
        if (period === 'am' && end.hour === 12) end.hour = 0
    }

    const endDate = new Date(`${assignment.date}T00:00:00`)
    if (Number.isNaN(endDate.getTime())) return null
    endDate.setHours(end.hour, end.minute, 0, 0)
    return endDate
}

function getAssignmentHours(assignment) {
    if (!assignment?.time) return 0

    const timeParts = String(assignment.time)
        .replace(/[–—]/g, '-')
        .split('-')
        .map((part) => part.trim())

    if (timeParts.length < 2) return 0
    const start = parseTimePart(timeParts[0])
    const end = parseTimePart(timeParts[1])
    if (!start || !end) return 0

    let startMinutes = start.hour * 60 + start.minute
    let endMinutes = end.hour * 60 + end.minute

    if (!/[ap]m/i.test(timeParts[1]) && /[ap]m/i.test(timeParts[0])) {
        const period = timeParts[0].toLowerCase().includes('pm') ? 'pm' : 'am'
        if (period === 'pm' && end.hour < 12) endMinutes += 12 * 60
        if (period === 'am' && end.hour === 12) endMinutes = 0
    }

    if (endMinutes < startMinutes) endMinutes += 12 * 60
    return Number(((endMinutes - startMinutes) / 60).toFixed(2))
}

function skillsAreRelated(skillA, skillB) {
    const a = normalizeText(skillA)
    const b = normalizeText(skillB)
    if (!a || !b) return false
    if (a === b || a.includes(b) || b.includes(a)) return true

    return Object.values(SKILL_GROUPS).some((group) =>
        group.some((keyword) => a.includes(keyword)) &&
        group.some((keyword) => b.includes(keyword))
    )
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

function getRatings() {
    return readStorage(STORAGE.ratings, [])
}

function getVolunteerAverageRating(volunteerId) {
    const ratings = getRatings().filter(
        (rating) => String(rating.volunteerId) === String(volunteerId)
    )
    if (!ratings.length) return null
    const average = ratings.reduce(
        (sum, rating) => sum + Number(rating.rating || 0), 0
    ) / ratings.length
    return Number(average.toFixed(1))
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

    const submit = (e) => {
        e.preventDefault()
        setError('')

        const users = getUsers()
        const user = users.find(
            (u) =>
                u.email.toLowerCase() === email.trim().toLowerCase() &&
                u.password === password &&
                u.role === role,
        )

        if (!user) {
            setError('Invalid email, password, or account type.')
            return
        }

        writeStorage(STORAGE.currentUser, user)
        go(role === 'ngo' ? '/ngo-dashboard' : '/volunteer-dashboard')
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
        city: '',
        area: '',
        street: '',
        availability: 'Weekdays',
        skills: '',
        organisation: '',
        domain: '',
        domains: [],
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
            city: form.city.trim(),
            area: form.area.trim(),
            street: form.street.trim(),
            location: [form.city.trim(), form.area.trim(), form.street.trim()].filter(Boolean).join(', '),
            availability: form.availability,
            skills:
                role === 'volunteer'
                    ? form.skills.split(',').map((s) => s.trim()).filter(Boolean)
                    : [],
            organisation: role === 'ngo' ? form.organisation.trim() : '',
            domain: role === 'ngo' ? (form.domains[0] || '') : form.domain.trim(),
            domains: role === 'ngo' ? form.domains : [form.domain].filter(Boolean),
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
                        <label>
                            Domain
                            <select required value={form.domain} onChange={(e) => update('domain', e.target.value)}>
                                <option value="">Select domain</option>
                                {DOMAINS.map((domain) => <option key={domain} value={domain}>{domain}</option>)}
                            </select>
                        </label>

                        <div className="two">
                            <label>City<input required value={form.city} onChange={(e) => update('city', e.target.value)} placeholder="Mumbai" /></label>
                            <label>Area<input required value={form.area} onChange={(e) => update('area', e.target.value)} placeholder="Dadar" /></label>
                        </div>

                        <div className="two">
                            <label>Street / Road / Locality<input value={form.street} onChange={(e) => update('street', e.target.value)} placeholder="Senapati Bapat Marg" /></label>
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
                            Skills
                            <input
                                required
                                value={form.skills}
                                onChange={(e) => update('skills', e.target.value)}
                                placeholder="Teaching, Communication, First Aid"
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
                            Focus domains
                            <div className="tags" style={{ marginTop: 10, gap: 8 }}>
                                {DOMAINS.map((domain) => (
                                    <label key={domain} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', border: '1px solid #dbe3ef', borderRadius: 10, background: form.domains.includes(domain) ? '#eef5ff' : '#fff', cursor: 'pointer' }}>
                                        <input
                                            type="checkbox"
                                            checked={form.domains.includes(domain)}
                                            onChange={(e) => {
                                                const next = e.target.checked
                                                    ? [...form.domains, domain]
                                                    : form.domains.filter((d) => d !== domain)
                                                update('domains', next)
                                            }}
                                        />
                                        {domain}
                                    </label>
                                ))}
                            </div>
                            <small className="field-help">Select all domains your organisation works in.</small>
                            <input type="text" tabIndex="-1" required value={form.domains.length ? form.domains.join(', ') : ''} onChange={() => {}} style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', height: 1 }} aria-label="Selected focus domains" />
                        </label>
                    </>
                )}

                <label
                    className="checkbox-label"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-start',
                        gap: 10,
                        cursor: 'pointer',
                        marginTop: 8,
                    }}
                >
                    <input
                        type="checkbox"
                        required
                        style={{
                            width: 18,
                            height: 18,
                            margin: 0,
                            flex: '0 0 auto',
                        }}
                    />
                    <span>I agree to use the VolunteerLink platform.</span>
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
    const requiredSkills = requirement?.skills || []
    const volunteerSkills = volunteer?.skills || []

    // Skills = 50% (flexible/related skill matching)
    let matchedSkills = 0
    requiredSkills.forEach((requiredSkill) => {
        if (volunteerSkills.some((volunteerSkill) => skillsAreRelated(requiredSkill, volunteerSkill))) {
            matchedSkills += 1
        }
    })
    const skillScore = requiredSkills.length
        ? Math.round((matchedSkills / requiredSkills.length) * 50)
        : 0

    // Domain = 25% (both users select from the same dropdown)
    const domainScore =
        normalizeText(requirement?.domain) &&
        normalizeText(requirement?.domain) === normalizeText(volunteer?.domain)
            ? 25
            : 0

    // City = 15%. Area/street are for precise information, not strict matching.
    const requirementLocation = getLocationParts(requirement)
    const volunteerLocation = getLocationParts(volunteer)
    const cityScore =
        requirementLocation.city &&
        volunteerLocation.city &&
        normalizeText(requirementLocation.city) === normalizeText(volunteerLocation.city)
            ? 15
            : 0

    // Availability = 10%. Compare the volunteer's availability with the requirement date.
    const availability = normalizeText(volunteer?.availability)
    const dayType = getDayType(requirement?.date)
    let availabilityScore = 0

    if (availability === 'flexible' || !dayType) {
        availabilityScore = 10
    } else if (availability === dayType) {
        availabilityScore = 10
    }

    return Math.min(100, skillScore + domainScore + cityScore + availabilityScore)
}

function VolunteerDashboard() {
    const user = getCurrentUser()
    const assignments = getAssignments()

    // Show only requirements that are still available to this volunteer.
    // Hide requirements that are already full or already assigned to this volunteer.
    const requirements = getRequirements().filter((r) => {
        if (r.status === 'closed') return false

        const requirementAssignments = assignments.filter(
            (a) => String(a.requirementId) === String(r.id)
        )

        const assignedCount = requirementAssignments.length
        const volunteersNeeded = Math.max(1, Number(r.volunteersNeeded) || 1)

        if (assignedCount >= volunteersNeeded) return false

        const alreadyAssigned = requirementAssignments.some(
            (a) => String(a.volunteerId) === String(user?.id)
        )

        return !alreadyAssigned
    })

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
                                        <small>{o.ngoName} • {formatLocation(o)} • {o.date}</small>
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
                    <p className="muted" style={{ marginTop: 18 }}>Focus domains: <b>{(user?.domains || (user?.domain ? [user.domain] : [])).join(', ') || 'Not set'}</b></p>
                    <p className="muted">Availability: <b>{user?.availability || 'Not set'}</b></p>
                    <p className="muted">Location: <b>{formatLocation(user)}</b></p>
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
        domain: user?.domain || '',
        city: user?.city || getLocationParts(user).city,
        area: user?.area || getLocationParts(user).area,
        street: user?.street || getLocationParts(user).street,
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
            domain: user?.domain || '',
            city: user?.city || getLocationParts(user).city,
            area: user?.area || getLocationParts(user).area,
            street: user?.street || getLocationParts(user).street,
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
            domain: form.domain,
            city: form.city.trim(),
            area: form.area.trim(),
            street: form.street.trim(),
            location: [form.city.trim(), form.area.trim(), form.street.trim()].filter(Boolean).join(', '),
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
            domain: user?.domain || '',
            city: user?.city || getLocationParts(user).city,
            area: user?.area || getLocationParts(user).area,
            street: user?.street || getLocationParts(user).street,
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
                        <p>Volunteer • {formatLocation(user)} • Available {user?.availability || 'not set'}</p>
                        <div className="profile-stats">
                            <span><b>{getAssignments().filter((a) => a.volunteerId === user?.id).length}</b><small>Assignments</small></span>
                            <span><b>{getHistory().filter((h) => h.volunteerId === user?.id).reduce((sum, h) => sum + Number(h.hours || 0), 0)}</b><small>Hours</small></span>
                            <span><b>{getVolunteerAverageRating(user?.id) ?? '—'}{getVolunteerAverageRating(user?.id) ? ' ⭐' : ''}</b><small>Rating</small></span>
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
                        <label>Domain
                            {editing ? (
                                <select value={form.domain || ''} onChange={(e) => update('domain', e.target.value)}>
                                    <option value="">Select domain</option>
                                    {DOMAINS.map((domain) => <option key={domain} value={domain}>{domain}</option>)}
                                </select>
                            ) : <input value={user?.domain || 'Not set'} readOnly />}
                        </label>
                        <label>Phone<input value={form.phone} readOnly={!editing} onChange={(e) => update('phone', e.target.value)} /></label>
                        <div className="two">
                            <label>City<input value={form.city} readOnly={!editing} onChange={(e) => update('city', e.target.value)} /></label>
                            <label>Area<input value={form.area} readOnly={!editing} onChange={(e) => update('area', e.target.value)} /></label>
                        </div>
                        <label>Street / Road / Locality<input value={form.street} readOnly={!editing} onChange={(e) => update('street', e.target.value)} /></label>
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

    const assignments = getAssignments()

    const scored = requirements
        .filter((r) => r.status !== 'closed')
        .filter((r) => {
            const requirementAssignments = assignments.filter(
                (a) => a.requirementId === r.id
            )

            const assignedCount = requirementAssignments.length
            const volunteersNeeded = Math.max(1, Number(r.volunteersNeeded) || 1)

            // Hide an opportunity once all required volunteer slots are filled.
            if (assignedCount >= volunteersNeeded) return false

            // Also hide it for this volunteer once they have already been assigned.
            const alreadyAssignedToCurrentVolunteer = requirementAssignments.some(
                (a) => String(a.volunteerId) === String(user?.id)
            )

            return !alreadyAssignedToCurrentVolunteer
        })
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

    const domains = DOMAINS

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
                                    📍 {formatLocation(r)}<br />
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
    const responded = interests.map((interest) => ({
        interest,
        requirement: requirements.find((r) => r.id === interest.requirementId),
    })).filter((item) => item.requirement)

    return (
        <Layout active="/volunteer-accepted">
            <Header eyebrow="VOLUNTEER RESPONSES" title="My Accepted Opportunities" text="Requirements where you have expressed interest and can see the NGO selection status." />
            <section className="panel">
                {responded.length === 0 ? <EmptyState title="No responses yet" text="Express interest in an opportunity and it will appear here." /> : (
                    <div className="list">
                        {responded.map(({ interest, requirement }) => {
                            const assigned = interest.status === 'assigned' || getAssignments().some((a) => a.requirementId === requirement.id && a.volunteerId === user.id)
                            return (
                                <div className="item" key={interest.id}>
                                    <div className="avatar">{requirement.ngoName.slice(0, 2).toUpperCase()}</div>
                                    <div><b>{requirement.title}</b><small>{requirement.ngoName} • {formatLocation(requirement)} • {requirement.date} • {requirement.time}</small></div>
                                    <span className={assigned ? 'badge badge-green' : 'badge badge-yellow'}>
                                        {assigned ? 'Selected by NGO ✓' : 'Awaiting NGO selection'}
                                    </span>
                                </div>
                            )
                        })}
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
        setAssignments(
            allAssignments.filter(
                (assignment) =>
                    String(assignment.volunteerId) ===
                    String(currentUser.id)
            )
        )
    }

    const [assignments, setAssignments] = useState(() => {
        if (!user) return []
        return getAssignments().filter(
            (assignment) =>
                String(assignment.volunteerId) === String(user.id)
        )
    })

    useEffect(() => {
        loadAssignments()
        window.addEventListener('volunteerlink-data-change', loadAssignments)
        window.addEventListener('storage', loadAssignments)

        return () => {
            window.removeEventListener('volunteerlink-data-change', loadAssignments)
            window.removeEventListener('storage', loadAssignments)
        }
    }, [])

    const completeAssignment = (assignment) => {
        const endDateTime = getAssignmentEndDateTime(assignment)
        if (!endDateTime || new Date() < endDateTime) return

        const confirmed = window.confirm(
            'Have you completed this activity?\n\nClick OK only if you actually participated in the activity. The assignment will be added to Participation History.'
        )
        if (!confirmed) return

        const allAssignments = getAssignments().map((a) =>
            a.id === assignment.id
                ? { ...a, status: 'completed', completedAt: new Date().toISOString() }
                : a
        )
        writeStorage(STORAGE.assignments, allAssignments)

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
                volunteerName: assignment.volunteerName,
                date: assignment.date,
                time: assignment.time,
                location: assignment.location,
                hours: getAssignmentHours(assignment),
                status: 'completed',
                createdAt: new Date().toISOString(),
            })
            writeStorage(STORAGE.history, history)
        }

        setAssignments(
            allAssignments.filter(
                (a) => String(a.volunteerId) === String(user.id)
            )
        )
    }

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
                        {assignments.map((assignment) => {
                            const endDateTime = getAssignmentEndDateTime(assignment)
                            const canComplete = Boolean(
                                endDateTime && new Date() >= endDateTime
                            )
                            const completed = assignment.status === 'completed'

                            return (
                                <div className="item" key={assignment.id}>
                                    <div className="avatar">
                                        {(assignment.ngoName || 'NG')
                                            .slice(0, 2)
                                            .toUpperCase()}
                                    </div>

                                    <div>
                                        <b>{assignment.requirementTitle}</b>
                                        <small>
                                            {assignment.ngoName}
                                            {' • '}
                                            {formatLocation(assignment)}
                                        </small>
                                        <small>
                                            📅 {assignment.date}
                                            {' • '}
                                            ⏰ {assignment.time}
                                        </small>
                                        <small>{assignment.description}</small>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
                                        <span className={completed ? 'badge badge-green' : 'badge badge-blue'}>
                                            {completed ? 'Completed' : 'Confirmed'}
                                        </span>

                                        {!completed && (
                                            <button
                                                className="action"
                                                disabled={!canComplete}
                                                onClick={() => completeAssignment(assignment)}
                                                title={
                                                    canComplete
                                                        ? 'Mark this activity as completed'
                                                        : 'This button becomes available after the activity end time'
                                                }
                                                style={{
                                                    opacity: canComplete ? 1 : 0.5,
                                                    cursor: canComplete ? 'pointer' : 'not-allowed',
                                                }}
                                            >
                                                {canComplete ? 'Mark as Completed' : 'Available after activity'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </section>
        </Layout>
    )
}

function History() {
    const user = getCurrentUser()
    const isNgo = user?.role === 'ngo'
    const [history, setHistory] = useState(() =>
        getHistory().filter((h) => isNgo ? h.ngoId === user.id : h.volunteerId === user.id)
    )
    const [ratings, setRatings] = useState(getRatings)
    const [ratingValues, setRatingValues] = useState({})

    useEffect(() => {
        const refresh = () => {
            setHistory(
                getHistory().filter((h) =>
                    isNgo ? h.ngoId === user.id : h.volunteerId === user.id
                )
            )
            setRatings(getRatings())
        }
        window.addEventListener('volunteerlink-data-change', refresh)
        window.addEventListener('storage', refresh)
        return () => {
            window.removeEventListener('volunteerlink-data-change', refresh)
            window.removeEventListener('storage', refresh)
        }
    }, [isNgo, user?.id])

    const completedHours = history.reduce(
        (sum, h) => sum + Number(h.hours || 0), 0
    )

    const submitRating = (historyItem) => {
        const value = Number(ratingValues[historyItem.assignmentId] || 0)
        if (value < 1 || value > 5) {
            alert('Please select a rating from 1 to 5 stars.')
            return
        }

        const existing = getRatings().find(
            (rating) =>
                String(rating.assignmentId) === String(historyItem.assignmentId) &&
                String(rating.ngoId) === String(user.id)
        )
        if (existing) return

        const nextRatings = [
            ...getRatings(),
            {
                id: makeId('rating'),
                assignmentId: historyItem.assignmentId,
                requirementId: historyItem.requirementId,
                volunteerId: historyItem.volunteerId,
                ngoId: user.id,
                rating: value,
                createdAt: new Date().toISOString(),
            },
        ]

        writeStorage(STORAGE.ratings, nextRatings)
        setRatings(nextRatings)
    }

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
                {history.length === 0 ? (
                    <EmptyState title="No history yet" text="Completed participation records will appear here." />
                ) : (
                    <div className="list">
                        {history.map((h) => {
                            const existingRating = ratings.find(
                                (rating) =>
                                    String(rating.assignmentId) === String(h.assignmentId) &&
                                    String(rating.ngoId) === String(user.id)
                            )

                            return (
                                <div className="history-row" key={h.id}>
                                    <div className="history-icon">✓</div>
                                    <div style={{ flex: 1 }}>
                                        <b>{h.requirementTitle}</b>
                                        <small>{h.ngoName} • {h.date} • {h.hours || 0} hours</small>

                                        {isNgo && (
                                            <small style={{ marginTop: 6 }}>
                                                Volunteer: <b>{
                                                h.volunteerName ||
                                                getVolunteers().find(
                                                    (v) => String(v.id) === String(h.volunteerId)
                                                )?.name ||
                                                'Volunteer'
                                            }</b>
                                            </small>
                                        )}

                                        {isNgo && (
                                            <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                                                {existingRating ? (
                                                    <span className="badge badge-green">
                                                        Rated {existingRating.rating}/5 ⭐
                                                    </span>
                                                ) : (
                                                    <>
                                                        <select
                                                            value={ratingValues[h.assignmentId] || ''}
                                                            onChange={(e) =>
                                                                setRatingValues((prev) => ({
                                                                    ...prev,
                                                                    [h.assignmentId]: e.target.value,
                                                                }))
                                                            }
                                                            style={{ width: 120 }}
                                                        >
                                                            <option value="">Rate volunteer</option>
                                                            <option value="1">1 ⭐</option>
                                                            <option value="2">2 ⭐</option>
                                                            <option value="3">3 ⭐</option>
                                                            <option value="4">4 ⭐</option>
                                                            <option value="5">5 ⭐</option>
                                                        </select>
                                                        <button type="button" className="action" onClick={() => submitRating(h)}>
                                                            Submit Rating
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <span className="badge badge-green">{h.status}</span>
                                </div>
                            )
                        })}
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
                            {requirements.slice(0, 5).map((r) => <div className="item" key={r.id}><div><b>{r.title}</b><small>{formatLocation(r)} • {r.date} • {r.volunteersNeeded} needed</small></div><span className="badge badge-blue">{r.status}</span></div>)}
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

function formatTimeInput(value) {
    if (!value) return ''
    const [hourText, minuteText] = value.split(':')
    let hour = Number(hourText)
    const minute = minuteText || '00'
    const period = hour >= 12 ? 'PM' : 'AM'
    hour = hour % 12 || 12
    return `${hour}:${minute} ${period}`
}

function Requirements() {
    const user = getCurrentUser()
    const [form, setForm] = useState({
        title: '',
        volunteersNeeded: 1,
        domain: '',
        city: '',
        area: '',
        street: '',
        date: '',
        startTime: '',
        endTime: '',
        skills: '',
        description: '',
    })
    const [message, setMessage] = useState('')

    const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))

    const submit = (e) => {
        e.preventDefault()

        if (!form.startTime || !form.endTime) {
            setMessage('Please select both start time and end time.')
            return
        }

        if (form.endTime <= form.startTime) {
            setMessage('End time must be later than start time.')
            return
        }

        const formattedTime = `${formatTimeInput(form.startTime)} - ${formatTimeInput(form.endTime)}`

        const requirement = {
            id: makeId('requirement'),
            ngoId: user.id,
            ngoName: user.organisation || user.name,
            title: form.title.trim(),
            volunteersNeeded: Number(form.volunteersNeeded),
            domain: form.domain,
            city: form.city.trim(),
            area: form.area.trim(),
            street: form.street.trim(),
            location: [form.city.trim(), form.area.trim(), form.street.trim()].filter(Boolean).join(', '),
            date: form.date,
            time: formattedTime,
            skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean),
            description: form.description.trim(),
            status: 'active',
            createdAt: new Date().toISOString(),
        }

        writeStorage(STORAGE.requirements, [...getRequirements(), requirement])
        setForm({ title: '', volunteersNeeded: 1, domain: '', city: '', area: '', street: '', date: '', startTime: '', endTime: '', skills: '', description: '' })
        setMessage('Requirement posted successfully.')
    }

    return (
        <Layout ngo active="/requirements">
            <Header eyebrow="POST REQUIREMENT" title="Create a volunteer requirement" text="Describe the actual task so volunteers can find it and respond." />
            <form className="panel form" style={{ maxWidth: 850 }} onSubmit={submit}>
                <div className="two">
                    <label>Requirement title<input required value={form.title} onChange={(e) => update('title', e.target.value)} /></label>
                    <label>Volunteers needed<input required type="number" min="1" value={form.volunteersNeeded} onChange={(e) => update('volunteersNeeded', e.target.value)} /></label>
                </div>
                <div className="two">
                    <label>Domain<select required value={form.domain} onChange={(e) => update('domain', e.target.value)}>
                        <option value="">Select domain</option>
                        {DOMAINS.map((domain) => <option key={domain} value={domain}>{domain}</option>)}
                    </select></label>
                    <label>City<input required value={form.city} onChange={(e) => update('city', e.target.value)} placeholder="Mumbai" /></label>
                </div>
                <div className="two">
                    <label>Area<input required value={form.area} onChange={(e) => update('area', e.target.value)} placeholder="Dadar" /></label>
                    <label>Street / Road / Venue<input value={form.street} onChange={(e) => update('street', e.target.value)} placeholder="Senapati Bapat Marg" /></label>
                </div>
                <div className="two">
                    <label>Date<input required type="date" value={form.date} onChange={(e) => update('date', e.target.value)} /></label>
                    <div className="two">
                        <label>Start time<input required type="time" value={form.startTime} onChange={(e) => update('startTime', e.target.value)} /></label>
                        <label>End time<input required type="time" value={form.endTime} onChange={(e) => update('endTime', e.target.value)} /></label>
                    </div>
                    <p className="muted" style={{ marginTop: '-8px' }}>Select the exact start and end time for the activity.</p>
                </div>
                <label>Required skills<input required value={form.skills} onChange={(e) => update('skills', e.target.value)} placeholder="Teaching, Communication" /></label>
                <label>Task description<textarea required rows="5" value={form.description} onChange={(e) => update('description', e.target.value)} /></label>
                <button className="btn btn-primary">Post requirement →</button>
                {message && <span className="badge badge-green">{message}</span>}
            </form>
        </Layout>
    )
}

function MyRequirements() {
    const user = getCurrentUser()
    const [requirements, setRequirements] = useState(getRequirements().filter((r) => r.ngoId === user?.id))

    const closeRequirement = (id) => {
        const all = getRequirements().map((r) => r.id === id ? { ...r, status: 'closed' } : r)
        writeStorage(STORAGE.requirements, all)
        setRequirements(all.filter((r) => r.ngoId === user.id))
    }

    return (
        <Layout ngo active="/ngo-requirements">
            <Header eyebrow="MY REQUIREMENTS" title="Requirements" text="Manage requirements posted by your organisation." button={<Link to="/requirements" className="btn btn-primary">+ Post requirement</Link>} />
            <section className="panel">
                {requirements.length === 0 ? <EmptyState title="No requirements yet" text="Post a requirement to start receiving volunteer responses." /> : (
                    <table className="table">
                        <thead><tr><th>Requirement</th><th>Needed</th><th>Responses</th><th>Status</th><th></th></tr></thead>
                        <tbody>
                        {requirements.map((r) => {
                            const count = getInterests().filter((i) => i.requirementId === r.id).length
                            return <tr key={r.id}><td><b>{r.title}</b><small>{formatLocation(r)} • {r.date}</small></td><td>{r.volunteersNeeded}</td><td>{count}</td><td><span className="badge badge-blue">{r.status}</span></td><td>{r.status !== 'closed' && <button className="action" onClick={() => closeRequirement(r.id)}>Close</button>}</td></tr>
                        })}
                        </tbody>
                    </table>
                )}
            </section>
        </Layout>
    )
}

function MyRequirements() {
    const user = getCurrentUser()

    const [requirements, setRequirements] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const loadRequirements = async () => {
        try {
            setLoading(true)
            setError('')

            const response = await fetch(
                'http://localhost:8080/api/requirements',
                {
                    method: 'GET',
                    credentials: 'include',
                }
            )

            if (!response.ok) {
                const message = await response.text()
                setError(message || 'Failed to load requirements.')
                return
            }

            const data = await response.json()

            const myRequirements = data.filter(
                (requirement) =>
                    Number(requirement?.ngo?.user?.id) ===
                    Number(user?.id)
            )

            setRequirements(myRequirements)

        } catch (error) {
            console.error('Load requirements error:', error)
            setError('Unable to connect to the backend.')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadRequirements()
    }, [])

    if (loading) {
        return (
            <Layout ngo active="/ngo-requirements">
                <Header
                    eyebrow="MY REQUIREMENTS"
                    title="Requirements"
                    text="Manage requirements posted by your organisation."
                />

                <section className="panel">
                    <p>Loading requirements...</p>
                </section>
            </Layout>
        )
    }

    return (
        <Layout ngo active="/ngo-requirements">

            <Header
                eyebrow="MY REQUIREMENTS"
                title="Requirements"
                text="Manage requirements posted by your organisation."
                button={
                    <Link
                        to="/requirements"
                        className="btn btn-primary"
                    >
                        + Post requirement
                    </Link>
                }
            />

            {error && (
                <section className="panel">
                    <div className="form-error">
                        {error}
                    </div>
                </section>
            )}

            <section className="panel">

                {requirements.length === 0 ? (

                    <EmptyState
                        title="No requirements yet"
                        text="Post a requirement to start receiving volunteer responses."
                    />

                ) : (

                    <table className="table">

                        <thead>
                        <tr>
                            <th>Requirement</th>
                            <th>Needed</th>
                            <th>Status</th>
                        </tr>
                        </thead>

                        <tbody>

                        {requirements.map((r) => (

                            <tr key={r.id}>

                                <td>
                                    <b>{r.title}</b>
                                    <small>
                                        {r.location} • {r.date}
                                    </small>
                                </td>

                                <td>
                                    {r.volunteersNeeded}
                                </td>

                                <td>
                                        <span className="badge badge-blue">
                                            {r.status}
                                        </span>
                                </td>

                            </tr>

                        ))}

                        </tbody>

                    </table>

                )}

            </section>

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
        const requirementAssignments = assignments.filter(
            (a) => String(a.requirementId) === String(req.id)
        )
        const volunteersNeeded = Math.max(1, Number(req.volunteersNeeded) || 1)

        // Never allow the NGO to assign more volunteers than requested.
        if (requirementAssignments.length >= volunteersNeeded) {
            alert(`This requirement already has all ${volunteersNeeded} volunteer(s) assigned.`)
            return
        }

        if (
            requirementAssignments.some(
                (a) => String(a.volunteerId) === String(volunteer.id)
            )
        ) {
            return
        }

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

        // Mark this volunteer's response as selected by the NGO.
        const updatedInterests = getInterests().map((interest) =>
            interest.requirementId === req.id && interest.volunteerId === volunteer.id
                ? { ...interest, status: 'assigned', assignedAt: new Date().toISOString() }
                : interest
        )
        writeStorage(STORAGE.interests, updatedInterests)

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
                        {requirement && (
                            <p>
                                {Math.max(
                                    0,
                                    Number(requirement.volunteersNeeded || 1) -
                                    getAssignments().filter(
                                        (a) => String(a.requirementId) === String(requirement.id)
                                    ).length
                                )} volunteer(s) still needed • {formatLocation(requirement)} • {requirement.date} • {requirement.time}
                            </p>
                        )}
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
                                const requirementAssignments = getAssignments().filter(
                                    (a) => String(a.requirementId) === String(requirement.id)
                                )
                                const volunteersNeeded = Math.max(
                                    1,
                                    Number(requirement.volunteersNeeded) || 1
                                )
                                const alreadyAssigned = requirementAssignments.some(
                                    (a) => String(a.volunteerId) === String(volunteer.id)
                                )
                                const requirementFull =
                                    requirementAssignments.length >= volunteersNeeded

                                return (
                                    <article className="match-card" key={interest.id}>
                                        <div className="match-top">
                                            <div className="avatar">{initials}</div>
                                            <div><h3>{volunteer.name}</h3><p>{formatLocation(volunteer)} • {volunteer.availability}</p><p>{volunteer.email} • {volunteer.phone}</p></div>
                                            <div className="big-score">{score}%</div>
                                        </div>
                                        <div className="tags">{(volunteer.skills || []).map((s) => <span className="tag" key={s}>✓ {s}</span>)}</div>
                                        <div className="actions">
                                            <Link to={`/volunteer-view?id=${volunteer.id}`} className="btn btn-soft">View full profile</Link>
                                            <button
                                                className="btn btn-primary"
                                                disabled={alreadyAssigned || requirementFull}
                                                onClick={() => assign(volunteer, requirement)}
                                            >
                                                {alreadyAssigned
                                                    ? 'Assigned ✓'
                                                    : requirementFull
                                                        ? 'Requirement Full'
                                                        : 'Select & Assign'}
                                            </button>
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
            <Header eyebrow="VOLUNTEER PROFILE REVIEW" title={volunteer.name} text={`Volunteer • ${formatLocation(volunteer)} • ${volunteer.availability || 'Availability not set'}`} button={<Link to="/ngo-interested" className="btn btn-soft">← Back</Link>} />
            <section className="panel">
                <div className="profile-center">
                    <div className="avatar avatar-lg">{initials}</div>
                    <h1>{volunteer.name}</h1>
                    <p>{volunteer.email} • {volunteer.phone}</p>
                    <div className="profile-stats">
                        <span><b>{getAssignments().filter((a) => a.volunteerId === volunteer.id).length}</b><small>Assignments</small></span>
                        <span><b>{assignments.reduce((sum, h) => sum + Number(h.hours || 0), 0)}</b><small>Hours</small></span>
                        <span><b>{getVolunteerAverageRating(volunteer.id) ?? '—'}{getVolunteerAverageRating(volunteer.id) ? ' ⭐' : ''}</b><small>Rating</small></span>
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
    const loadAssignments = () =>
        getAssignments().filter((a) => a.ngoId === user?.id)

    const [list, setList] = useState(loadAssignments)

    useEffect(() => {
        const refresh = () => setList(loadAssignments())
        window.addEventListener('volunteerlink-data-change', refresh)
        window.addEventListener('storage', refresh)
        return () => {
            window.removeEventListener('volunteerlink-data-change', refresh)
            window.removeEventListener('storage', refresh)
        }
    }, [])

    return (
        <Layout ngo active="/ngo-assignments">
            <Header
                eyebrow="ASSIGNMENT MANAGEMENT"
                title="Final Assignments"
                text="Confirmed tasks selected by your organisation."
            />
            <section className="panel">
                {list.length === 0 ? (
                    <EmptyState
                        title="No assignments yet"
                        text="Select a volunteer from the responses to create an assignment."
                    />
                ) : (
                    <div className="list">
                        {list.map((a) => (
                            <div className="item" key={a.id}>
                                <div className="avatar">
                                    {(a.volunteerName || 'VO')
                                        .slice(0, 2)
                                        .toUpperCase()}
                                </div>
                                <div>
                                    <b>{a.volunteerName}</b>
                                    <small>
                                        {a.requirementTitle} • {formatLocation(a)}
                                    </small>
                                    <small>
                                        📅 {a.date} • ⏰ {a.time}
                                    </small>
                                    <small>{a.description}</small>
                                </div>
                                <span className={`badge ${a.status === 'completed' ? 'badge-green' : 'badge-blue'}`}>
                                    {a.status === 'completed' ? 'Completed' : 'Assigned'}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
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

