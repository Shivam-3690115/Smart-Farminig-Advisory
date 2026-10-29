import React, { useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import {
  AlertTriangle, ArrowUpRight, BarChart3, Bell, CalendarDays, Check, CheckCircle2,
  ChevronDown, CloudRain, Clock3, Droplets, Home, Info, Leaf, LogOut, Menu,
  Bug, Camera, Calculator, FileText, IndianRupee, MessageCircle, Mic, Plus, Search,
  Eye, EyeOff, Settings, Sprout, Store, Sun, Tractor, TrendingUp, X
} from 'lucide-react'
import './styles.css'

const configuredApiBase = import.meta.env.VITE_API_URL?.replace(/\/$/, '')
const apiBase = configuredApiBase || `${window.location.protocol}//${window.location.hostname}:8080/api`
const weather = []
const initialTasks = []
const advisories = []
const initialNotifications = []

const languageText = {
  English: {
    workspace: 'Workspace',
    notifications: 'Notifications',
    overview: 'Overview',
    myCrops: 'My crops',
    advisories: 'Advisories',
    irrigation: 'Irrigation',
    farmTasks: 'Farm tasks',
    insights: 'Insights',
    settings: 'Settings',
    greeting: 'Good morning',
    viewInsights: 'View insights',
    seeAll: 'See all',
    viewAll: 'View all',
    farmAtGlance: 'Farm at a glance',
  },
  Hindi: {
    workspace: 'कार्यक्षेत्र',
    notifications: 'सूचनाएँ',
    overview: 'अवलोकन',
    myCrops: 'मेरी फसलें',
    advisories: 'सलाह',
    irrigation: 'सिंचाई',
    farmTasks: 'खेती कार्य',
    insights: 'इनसाइट्स',
    settings: 'सेटिंग्स',
    greeting: 'शुभ सुबह',
    viewInsights: 'इनसाइट्स देखें',
    seeAll: 'सभी देखें',
    viewAll: 'सभी देखें',
    farmAtGlance: 'खेती का सारांश',
  },
  Marathi: {
    workspace: 'कार्यक्षेत्र',
    notifications: 'अधिसूचना',
    overview: 'विहंगावलोकन',
    myCrops: 'माझ्या पिके',
    advisories: 'सल्ले',
    irrigation: 'सिंचन',
    farmTasks: 'शेत काम',
    insights: 'माहिती',
    settings: 'सेटिंग्ज',
    greeting: 'शुभ सकाळ',
    viewInsights: 'माहिती पहा',
    seeAll: 'सर्व पहा',
    viewAll: 'सर्व पहा',
    farmAtGlance: 'शेताचा आढावा',
  },
}

function App() {
  const [loggedIn, setLoggedIn] = useState(false)
  const [active, setActive] = useState('Overview')
  const [tasks, setTasks] = useState([])
  const [toast, setToast] = useState('')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [newTask, setNewTask] = useState('')
  const [profile, setProfile] = useState(null)
  const [notifications, setNotifications] = useState([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [uiLanguage, setUiLanguage] = useState('English')
  const text = languageText[uiLanguage] || languageText.English
  const [crops, setCrops] = useState([])
  const [showCropModal, setShowCropModal] = useState(false)
  const [cropForm, setCropForm] = useState({ name: '', variety: '', stage: 'Seedling' })

  useEffect(() => {
    const savedProfile = localStorage.getItem('rootwise-profile')
    const savedLanguage = localStorage.getItem('rootwise-language')
    if (savedProfile) {
      try {
        const parsedProfile = JSON.parse(savedProfile)
        setProfile(parsedProfile)
        setLoggedIn(true)
      } catch (error) {
        localStorage.removeItem('rootwise-profile')
      }
    }
    if (savedLanguage) setUiLanguage(savedLanguage)
    fetch(`${apiBase}/dashboard?email=${encodeURIComponent(savedProfile ? JSON.parse(savedProfile).email : '')}`)
      .then((response) => response.ok ? response.json() : null)
      .then((data) => {
        if (data?.farmer) {
          setProfile(data.farmer)
          localStorage.setItem('rootwise-profile', JSON.stringify(data.farmer))
        }
      })
      .catch(() => {})
  }, [])

  const toggleTask = (id) => setTasks(tasks.map((task) => task.id === id ? { ...task, done: !task.done } : task))
  const notify = (message) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 2800)
  }
  const addTask = (event) => {
    event.preventDefault()
    if (!newTask.trim()) return
    setTasks([{ id: Date.now(), title: newTask, meta: 'Today · Added just now', type: 'Custom task', done: false }, ...tasks])
    setNewTask('')
    setShowModal(false)
    notify('Task added to your farm plan')
  }

  const handleLogin = (account) => {
    setProfile(account)
    setLoggedIn(true)
    localStorage.setItem('rootwise-profile', JSON.stringify(account))
    if (account?.preferredLanguage) {
      setUiLanguage(account.preferredLanguage)
      localStorage.setItem('rootwise-language', account.preferredLanguage)
    }
  }

  const handleLogout = () => {
    setLoggedIn(false)
    setProfile(null)
    localStorage.removeItem('rootwise-token')
    localStorage.removeItem('rootwise-profile')
  }

  const handleLanguageChange = (language) => {
    setUiLanguage(language)
    localStorage.setItem('rootwise-language', language)
  }

  if (!loggedIn) return <LoginPage onLogin={handleLogin} />

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
        <div className="brand"><span className="brand-mark"><Sprout size={21} /></span><span>rootwise</span></div>
        <div className="profile-card">
          <div className="avatar">{initials(profile?.name)}</div>
          <div><strong>{profile?.name || 'Farmer'}</strong><span>{profile?.farmName || 'Set up your farm'}</span></div>
        </div>
        <nav>
          <p className="nav-label">{text.workspace}</p>
          {[
            ['Overview', text.overview, Home], ['My crops', text.myCrops, Leaf], ['Advisories', text.advisories, MessageCircle],
            ['Irrigation', text.irrigation, Droplets], ['Farm tasks', text.farmTasks, Tractor], ['Insights', text.insights, BarChart3],
            ['Crop lab', 'Crop lab', Calculator], ['Fertilizer', 'Fertilizer', Sprout],
            ['Weather desk', 'Weather desk', Sun], ['Mandi rates', 'Mandi rates', Store],
            ['Farm economics', 'Farm economics', IndianRupee], ['Kisan Mitra', 'Kisan Mitra', MessageCircle],
           
          ].map(([key, label, Icon]) => <button key={key} className={active === key ? 'nav-item active' : 'nav-item'} onClick={() => { setActive(key); setMobileOpen(false); setShowNotifications(false) }}><Icon size={18} /><span>{label}</span>{key === 'Advisories' && <i className="nav-dot" />}</button>)}
        </nav>
        <div className="sidebar-bottom">
          <button className={active === 'Settings' ? 'nav-item active' : 'nav-item'} onClick={() => setActive('Settings')}><Settings size={18} /><span>{text.settings}</span></button>
          <div className="help-card"><div className="help-icon"><MessageCircle size={16} /></div><strong>Need some help?</strong><span>Talk to an agronomist</span><button onClick={() => notify('Agronomist request received')}>Get support <ArrowUpRight size={14} /></button></div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <button className="mobile-menu" onClick={() => setMobileOpen(!mobileOpen)}><Menu /></button>
          <div className="breadcrumb"><span>{text.workspace}</span><b>/</b><strong>{active}</strong></div>
          <div className="top-actions"><div className="search-box"><Search size={16} /><input placeholder="Search your farm..." /></div><button className="icon-btn notification" aria-label="Open notifications" onClick={() => { setActive('Notifications'); setShowNotifications(false); setNotifications(notifications.map(item => ({ ...item, unread: false }))) }}><Bell size={19} />{notifications.some(item => item.unread) && <i />}</button><div className="top-avatar">{initials(profile?.name)}</div></div>
        </header>
        {showNotifications && <NotificationPanel notifications={notifications} onRead={(id) => setNotifications(notifications.map(item => item.id === id ? { ...item, unread: false } : item))} onReadAll={() => setNotifications(notifications.map(item => ({ ...item, unread: false })))} />}

        <div className="page">
          {active !== 'Overview' && <SectionPage active={active} tasks={tasks} toggleTask={toggleTask} advisories={advisories} notifications={notifications} crops={crops} setCrops={setCrops} profile={profile} setProfile={setProfile} onAddTask={() => setShowModal(true)} onAddCrop={() => setShowCropModal(true)} notify={notify} />}
          {active === 'Overview' && <>
          <section className="welcome-row">
            <div><p className="eyebrow">THURSDAY, 22 AUGUST 2024 <span className="live-dot" /> LIVE ADVISORIES</p><h1>{text.greeting}, {profile?.name || 'Farmer'} <span>🌾</span></h1><p className="subheading">Here’s what your farm is telling you today.</p></div>
            <button className="primary-btn" onClick={() => setShowModal(true)}><Plus size={18} /> Add farm task</button>
          </section>

          <section className="stats-grid">
            <StatCard icon={Sprout} label="Active crops" value="0" detail="From your saved farm data" />
            <StatCard icon={Droplets} label="Soil moisture" value="—" detail="Add a soil reading" />
            <StatCard icon={TrendingUp} label="Water saved" value="—" detail="No irrigation records" />
            <StatCard icon={AlertTriangle} label="Open advisories" value="0" detail="No advisories returned" />
          </section>

          <section className="content-grid">
            <div className="left-column">
              <div className="section-heading"><div><p className="eyebrow">FIELD PULSE</p><h2>Farm at a glance</h2></div><button className="text-btn" onClick={() => setActive('Insights')}>View insights <ArrowUpRight size={15} /></button></div>
              <div className="field-card">
                <div className="field-card-top"><div><span className="field-status"><i /> Awaiting farm data</span><h3>{profile?.farmName || 'Farm location not set'}</h3><p>{profile?.acres || 0} acres · {profile?.location || 'Location not set'}</p></div><button className="more-btn">•••</button></div>
                <div className="field-visual"><EmptyData message="Soil, water, and field metrics will appear after they are saved in the database." /></div>
              </div>

              <div className="section-heading advisory-heading"><div><p className="eyebrow">PERSONALIZED FOR YOUR CROPS</p><h2>Today's advisories</h2></div><button className="text-btn" onClick={() => setActive('Advisories')}>See all <ArrowUpRight size={15} /></button></div>
              <div className="advisory-list">{advisories.map(({ title, text, tag, color, icon: Icon }) => <article className={`advisory-card ${color}`} key={title}><div className="advisory-icon"><Icon size={19} /></div><div className="advisory-copy"><span className="tag">{tag}</span><h3>{title}</h3><p>{text}</p><button onClick={() => notify('Advisory marked as reviewed')}>Review recommendation <ArrowUpRight size={14} /></button></div></article>)}</div>
            </div>

            <div className="right-column">
              <div className="section-heading"><div><p className="eyebrow">LOCAL CONDITIONS</p><h2>Weather forecast</h2></div><button className="more-btn">•••</button></div>
              <WeatherLookup /><div className="weather-card"><div className="current-weather"><div><span>Nashik, MH <ChevronDown size={14} /></span><strong>29°</strong><small>Partly cloudy · Feels like 31°</small></div><Sun size={48} strokeWidth={1.5} /></div><div className="weather-strip">{weather.map(({ day, icon: Icon, temp, rain, tone }) => <div className={day === 'Today' ? 'weather-day selected' : 'weather-day'} key={day}><span>{day}</span><Icon className={tone} size={20} /><strong>{temp}</strong><small><Droplets size={11} />{rain}</small></div>)}</div><div className="weather-foot"><span><WindIcon /> Wind 12 km/h</span><span>Humidity 64%</span><button onClick={() => notify('Weather details refreshed')}>Refresh <ArrowUpRight size={13} /></button></div></div>

              <div className="section-heading task-heading"><div><p className="eyebrow">YOUR PLAN</p><h2>Upcoming tasks</h2></div><button className="text-btn" onClick={() => setActive('Farm tasks')}>View all <ArrowUpRight size={15} /></button></div>
              <div className="tasks-card">{tasks.slice(0, 3).map(task => <div className={task.done ? 'task done' : 'task'} key={task.id}><button className="check-btn" onClick={() => toggleTask(task.id)}>{task.done && <Check size={14} />}</button><div><strong>{task.title}</strong><span>{task.meta}</span></div><span className="task-type">{task.type}</span></div>)}<button className="add-task-btn" onClick={() => setShowModal(true)}><Plus size={16} /> Add another task</button></div>

              <div className="tip-card"><div className="tip-sun"><Sun size={20} /></div><div><span>ROOTWISE TIP OF THE DAY</span><p>Water your crops early morning to reduce evaporation by up to 30%.</p></div><button onClick={() => notify('Tip saved to your knowledge hub')}><ArrowUpRight size={16} /></button></div>
            </div>
          </section>
          </>}
        </div>
      </main>
      {toast && <div className="toast"><Check size={17} /> {toast}</div>}
      {showModal && <div className="modal-backdrop" onClick={() => setShowModal(false)}><div className="modal" onClick={event => event.stopPropagation()}><button className="modal-close" onClick={() => setShowModal(false)}><X size={18} /></button><p className="eyebrow">FARM PLAN</p><h2>Add a farm task</h2><p className="modal-copy">Keep your field work organized and never miss an important crop-care step.</p><form onSubmit={addTask}><label>Task name<input value={newTask} onChange={event => setNewTask(event.target.value)} placeholder="e.g. Check drip lines" autoFocus /></label><div className="modal-actions"><button type="button" className="secondary-btn" onClick={() => setShowModal(false)}>Cancel</button><button type="submit" className="primary-btn">Add task</button></div></form></div></div>}
      {showCropModal && <CropModal form={cropForm} setForm={setCropForm} onClose={() => setShowCropModal(false)} onSave={() => { setCrops([...crops, { ...cropForm, days: '0 days', color: 'green' }]); setCropForm({ name: '', variety: '', stage: 'Seedling' }); setShowCropModal(false); notify('Crop added to your farm') }} />}
      <button className="logout-fab" onClick={handleLogout}><LogOut size={14} /> Log out</button>
    </div>
  )
}

function LoginPage({ onLogin }) {
  const [mode, setMode] = useState('login')
  const [name, setName] = useState('')
  const [residentialAddress, setResidentialAddress] = useState('')
  const [acres, setAcres] = useState('')
  const [farmLocation, setFarmLocation] = useState('')
  const [farmingType, setFarmingType] = useState('Mixed farming')
  const [landType, setLandType] = useState('Black soil')
  const [preferredLanguage, setPreferredLanguage] = useState('English')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [resetToken, setResetToken] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const submit = async (event) => {
    event.preventDefault()
    setError('')
    if (!email.trim() || (mode !== 'forgot' && !password.trim()) || (mode === 'register' && (!name.trim() || !residentialAddress.trim() || !acres || !farmLocation.trim()))) return setError('Complete all required fields to continue.')
    setBusy(true)
    try {
      if (mode === 'forgot') {
        const response = await fetch(`${apiBase}/auth/request-password-reset`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) })
        const data = await response.json()
        if (!response.ok) throw new Error(data.error || 'Unable to prepare password reset.')
        setResetToken(data.resetToken || '')
        setMode('reset')
        setError(data.resetToken ? 'Development reset token created. Enter it below.' : data.message)
        return
      }
      if (mode === 'reset') {
        const response = await fetch(`${apiBase}/auth/reset-password`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token: resetToken, password }) })
        const data = await response.json()
        if (!response.ok) throw new Error(data.error || 'Unable to reset password.')
        setMode('login')
        setPassword('')
        setResetToken('')
        setError(data.message)
        return
      }
      const response = await fetch(`${apiBase}/auth/${mode === 'register' ? 'register' : 'login'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mode === 'register' ? { name, email, password, residentialAddress, acres: Number(acres), farmLocation, farmingType, landType, preferredLanguage } : { email, password }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Authentication failed.')
      localStorage.setItem('rootwise-token', data.token)
      onLogin(data.farmer)
    } catch (requestError) {
      setError(requestError.message || 'Unable to connect to the server.')
    } finally {
      setBusy(false)
    }
  }
  return <div className="login-shell"><div className="login-art"><div className="login-brand"><span className="brand-mark"><Sprout size={21} /></span>rootwise</div><div className="login-message"><p className="eyebrow">SMART FARMING ADVISORY</p><h1>Grow smarter.<br /><em>Harvest better.</em></h1><p>Practical, timely guidance for every decision you make on your farm.</p></div></div><div className="login-panel"><div className="login-form"><p className="eyebrow">{mode === 'login' ? 'WELCOME BACK' : 'JOIN ROOTWISE'}</p><h2>{mode === 'login' ? 'Your farm, at a glance.' : 'Set up your farm.'}</h2><p className="login-copy">{mode === 'login' ? "Sign in to see today's conditions, advisories, and field plan." : 'Tell us about your home, farm, soil, and language so recommendations fit you.'}</p><form onSubmit={submit}>{mode === 'register' && <><label>Full name<input required value={name} onChange={event => setName(event.target.value)} placeholder="e.g. Shivam" /></label><label>Residential address<input required value={residentialAddress} onChange={event => setResidentialAddress(event.target.value)} placeholder="Village, district, state" /></label><div className="form-grid"><label>Farm acres<input required type="number" min="0.1" step="0.1" value={acres} onChange={event => setAcres(event.target.value)} placeholder="e.g. 5.5" /></label><label>Farm location<input required value={farmLocation} onChange={event => setFarmLocation(event.target.value)} placeholder="Nashik, Maharashtra" /></label></div><div className="form-grid"><label>Farming type<select value={farmingType} onChange={event => setFarmingType(event.target.value)}><option>Mixed farming</option><option>Organic farming</option><option>Crop farming</option><option>Horticulture</option><option>Dairy farming</option></select></label><label>Land type<select value={landType} onChange={event => setLandType(event.target.value)}><option>Black soil</option><option>Red soil</option><option>White/sandy soil</option><option>Alluvial soil</option><option>Loamy soil</option></select></label></div><label>Preferred language<select value={preferredLanguage} onChange={event => setPreferredLanguage(event.target.value)}><option>English</option><option>Hindi</option><option>Marathi</option></select></label></>}<label>Email address<input type="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="you@example.com" /></label>  {mode === 'reset' && <label>Reset token<input required value={resetToken} onChange={event => setResetToken(event.target.value)} placeholder="Paste the one-time token" /></label>}<label>  Password<div className="password-field"><input type={showPassword ? 'text' : 'password'} value={password} onChange={event => setPassword(event.target.value)} placeholder="At least 8 characters" /><button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button></div></label>{error && <p className="form-error">{error}</p>}<button className="primary-btn login-btn" type="submit" disabled={busy}>{busy ? 'Please wait...' : mode === 'login' ? 'Sign in to Rootwise' : 'Create farmer account'} <ArrowUpRight size={16} /></button>  </form>{mode === 'login' && <button type="button" className="forgot-link" onClick={() => { setMode('forgot'); setError('') }}>Forgot password?</button>}<button className="auth-switch" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError('') }}>{mode === 'login' ? 'New to Rootwise? Create an account' : 'Already have an account? Sign in'}</button></div></div></div>
}

function NotificationPanel({ notifications, onRead, onReadAll }) {
  return <div className="notification-panel"><div className="notification-head"><div><p className="eyebrow">INBOX</p><h3>Notifications</h3></div><button onClick={onReadAll}>Mark all read</button></div>{notifications.map(({ id, title, text, time, unread, icon: Icon }) => <button className={unread ? 'notification-row unread' : 'notification-row'} key={id} onClick={() => onRead(id)}><span className="notification-icon"><Icon size={16} /></span><span><strong>{title}</strong><small>{text}</small><em>{time}</em></span>{unread && <i />}</button>)}</div>
}

function SectionPage({ active, tasks, toggleTask, advisories, notifications, crops, profile, setProfile, onAddTask, onAddCrop, notify }) {
  const headings = {
    'My crops': ['CROP PORTFOLIO', 'Your crops', 'Track every field from sowing to harvest.'],
    'Advisories': ['FIELD INTELLIGENCE', 'Personalized advisories', 'Recommendations based on your crops, weather, and soil.'],
    'Irrigation': ['WATER SMART', 'Irrigation center', 'Use the right amount of water at the right time.'],
    'Farm tasks': ['FIELD PLAN', 'Farm tasks', 'Plan, complete, and review your daily field work.'],
    'Insights': ['YOUR NUMBERS', 'Farm insights', 'Simple metrics that help you make better decisions.'],
    Notifications: ['INBOX', 'Notifications', 'All your farm alerts in one place.'],
    Settings: ['ACCOUNT', 'Farm settings', 'Keep your farm profile and preferences up to date.'],
    'Crop lab': ['SMART AGRONOMY', 'Crop recommendation lab', 'Match soil nutrients, soil type, and season to suitable crops.'],
    Fertilizer: ['PRECISION NUTRITION', 'Fertilizer calculator', 'Estimate nutrient deficits, commercial bags, and application timing.'],
    'Weather desk': ['AGRO-METEOROLOGY', 'Weather advisory desk', 'Plan irrigation and spraying around the five-day outlook.'],
    'Mandi rates': ['MARKET INTELLIGENCE', 'APMC mandi tracker', 'Compare indicative modal prices and arrival movement.'],
    'Farm economics': ['FARM ECONOMICS', 'Cost-benefit planner', 'Understand production cost, profit, B:C ratio, and breakeven price.'],
    'Kisan Mitra': ['FARMER SUPPORT', 'Kisan Mitra', 'Get quick answers and emergency support numbers.'],
    
  }
  if (['Crop lab', 'Fertilizer', 'Weather desk', 'Mandi rates', 'Farm economics', 'Kisan Mitra'].includes(active)) {
    const [eyebrow, title, subtitle] = headings[active]
    const modules = { 'Crop lab': <CropLab />, Fertilizer: <FertilizerCalculator />,
      'Weather desk': <WeatherDesk />, 'Mandi rates': <MandiTracker />, 'Farm economics': <EconomicsPlanner />,
      'Kisan Mitra': <KisanMitra /> }
    return <section className="section-page"><div className="section-page-head"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p>{subtitle}</p></div></div>{modules[active]}</section>
  }
  const [eyebrow, title, subtitle] = headings[active]
  return <section className="section-page"><div className="section-page-head"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p>{subtitle}</p></div>{active === 'Farm tasks' && <button className="primary-btn" onClick={onAddTask}><Plus size={17} /> Add farm task</button>}{active === 'My crops' && <button className="primary-btn" onClick={onAddCrop}><Plus size={17} /> Add crop</button>}</div>{active === 'My crops' && <div className="section-cards crop-grid">{crops.length ? crops.map(crop => <CropCard key={`${crop.name}-${crop.variety}`} {...crop} />) : <EmptyData message="No crops have been saved for this account yet." />}</div>}{active === 'Notifications' && <NotificationSection notifications={notifications} />}{active === 'Advisories' && <><PlantDoctor notify={notify} /><EmptyData message="No advisories have been returned for this account." /></>}{active === 'Irrigation' && <IrrigationPage notify={notify} profile={profile} />}{active === 'Farm tasks' && <div className="tasks-card section-tasks">{tasks.length ? tasks.map(task => <div className={task.done ? 'task done' : 'task'} key={task.id}><button className="check-btn" onClick={() => toggleTask(task.id)}>{task.done && <Check size={14} />}</button><div><strong>{task.title}</strong><span>{task.meta}</span></div><span className="task-type">{task.type}</span></div>) : <EmptyData message="No tasks have been saved for this account yet." />}<button className="add-task-btn" onClick={onAddTask}><Plus size={16} /> Add another task</button></div>}{active === 'Insights' && <InsightsPage notify={notify} profile={profile} />}{active === 'Settings' && <SettingsPage notify={notify} profile={profile} setProfile={setProfile} />}</section>
}

function EmptyData({ message }) {
  return <div className="empty-card"><Info size={22} /><strong>No data returned</strong><span>{message}</span></div>
}

const cropProfiles = [
  { name: 'Soybean', soil: ['Black', 'Loamy'], season: 'Kharif', ideal: [45, 25, 40], ph: [6, 7.5] },
  { name: 'Cotton', soil: ['Black'], season: 'Kharif', ideal: [55, 25, 45], ph: [6, 8] },
  { name: 'Wheat', soil: ['Alluvial', 'Loamy'], season: 'Rabi', ideal: [60, 30, 35], ph: [6, 7.5] },
  { name: 'Chickpea', soil: ['Black', 'Red'], season: 'Rabi', ideal: [35, 25, 30], ph: [6, 8] },
  { name: 'Sugarcane', soil: ['Black', 'Alluvial'], season: 'Kharif', ideal: [70, 35, 60], ph: [6, 8] },
  { name: 'Onion', soil: ['Red', 'Loamy'], season: 'Zaid', ideal: [50, 30, 40], ph: [6, 7.5] },
]

function ModuleCard({ title, children }) {
  return <article className="module-card"><h3>{title}</h3>{children}</article>
}

function CropLab() {
  return <AiAnalysis title="Crop recommendation" queryLabel="Describe the crop recommendation request" placeholder="Example: recommend crops for black soil, pH 6.8, N 45, P 25, K 40, Kharif season" />
}

function AiAnalysis({ title, queryLabel, placeholder }) {
  const [query, setQuery] = useState('')
  const [answer, setAnswer] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const run = async () => {
    if (!query.trim()) return
    setLoading(true); setError(''); setAnswer('')
    try {
      const response = await fetch(`${apiBase}/integrations/farm-analysis`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, context: localStorage.getItem('rootwise-profile') || '' }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'The AI analysis failed.')
      setAnswer(data.answer)
    } catch (requestError) { setError(requestError.message) } finally { setLoading(false) }
  }
  return <div className="module-layout"><ModuleCard title={title}><label>{queryLabel}<textarea value={query} onChange={event => setQuery(event.target.value)} placeholder={placeholder} /></label><button className="primary-btn" onClick={run} disabled={loading}>{loading ? 'Fetching from AI...' : 'Get AI analysis'}</button>{error && <p className="helper-text error-text">{error}</p>}{answer && <div className="doctor-answer"><p>{answer}</p></div>}</ModuleCard></div>
}

function NpkRadar({ values }) {
  const points = values.map((value, index) => { const angle = (-90 + index * 120) * Math.PI / 180; const radius = Math.min(70, Math.max(15, Number(value) * 1.2)); return `${100 + Math.cos(angle) * radius},${90 + Math.sin(angle) * radius}` }).join(' ')
  return <svg className="npk-radar" viewBox="0 0 200 180" role="img" aria-label="NPK balance radar"><polygon points="100,20 170,130 30,130" fill="none" stroke="#d8e5d9" /><polygon points="100,45 145,115 55,115" fill="none" stroke="#d8e5d9" /><polygon points={points} fill="#8fbf794d" stroke="#4d8b4a" strokeWidth="3" /><text x="94" y="14">N</text><text x="174" y="138">P</text><text x="18" y="138">K</text></svg>
}

function FertilizerCalculator() {
  return <AiAnalysis title="Fertilizer search and calculation" queryLabel="Search fertilizer or describe the crop and soil data" placeholder="Example: urea recommendation for 3 acres of wheat with soil-test N 35, P 18, K 40" />
}

const diseases = [
  { crop: 'Wheat', name: 'Leaf rust', symptoms: 'Orange-brown pustules on leaves and reduced grain filling.', organic: 'Remove volunteer plants and improve field airflow.', chemical: 'Propiconazole 1 ml/L; observe a 30-day withholding period.' },
  { crop: 'Cotton', name: 'Bollworm', symptoms: 'Bore holes in squares and bolls, with frass near entry points.', organic: 'Use pheromone traps and neem seed kernel extract.', chemical: 'Use an officially registered emamectin product at label rate.' },
  { crop: 'Soybean', name: 'Anthracnose', symptoms: 'Dark sunken lesions on stems, pods, and leaves.', organic: 'Use clean seed and Trichoderma seed treatment.', chemical: 'Use a registered fungicide only after diagnosis and label check.' },
  { crop: 'Onion', name: 'Purple blotch', symptoms: 'Purple concentric lesions with yellow margins on leaves.', organic: 'Avoid overhead irrigation and remove infected debris.', chemical: 'Mancozeb 2 g/L as per label; respect harvest interval.' },
]

function DiseaseGuide() {
  const [query, setQuery] = useState('')
  const matches = diseases.filter(item => `${item.crop} ${item.name} ${item.symptoms}`.toLowerCase().includes(query.toLowerCase()))
  return <ModuleCard title="Search by crop, disease, or symptom"><label className="wide-input"><Search size={16} /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Try “purple”, “cotton”, or “pustules”" /></label><div className="disease-grid">{matches.map(item => <article className="disease-card" key={item.name}><span className="tag">{item.crop}</span><h3>{item.name}</h3><p><b>Symptoms:</b> {item.symptoms}</p><p><b>Organic / biological:</b> {item.organic}</p><p><b>Chemical:</b> {item.chemical}</p></article>)}</div>{!matches.length && <p className="empty-state">No matching guide found. Upload a clear plant photo or consult a local agronomist.</p>}</ModuleCard>
}

function WeatherDesk() {
  const [location, setLocation] = useState('Nashik, Maharashtra')
  const [weatherData, setWeatherData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchWeather = async (place) => {
    const city = (place || 'Nashik, Maharashtra').trim()
    if (!city) return
    setLoading(true)
    setError('')
    try {
      const response = await fetch(`${apiBase}/integrations/weather?location=${encodeURIComponent(city)}`)
      if (!response.ok) throw new Error('Unable to fetch weather for that location.')
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Unable to fetch weather for that location.')
      setWeatherData(data)
    } catch (requestError) {
      setError(requestError.message || 'Weather lookup failed.')
      setWeatherData(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWeather(location)
  }, [])

  const safeWeather = weatherData
  const warning = safeWeather && (safeWeather.wind > 15 || safeWeather.rain > 60)

  return <div className="module-layout"><ModuleCard title="Farm weather"><div className="weather-search"><Search size={15} /><input value={location} onChange={e => setLocation(e.target.value)} /><button className="secondary-btn" onClick={() => fetchWeather(location)}>{loading ? 'Loading...' : 'Search'}</button></div>{error && <p className="helper-text error-text">{error}</p>}{safeWeather ? <><div className="weather-metrics"><div><strong>{safeWeather.temp}°C</strong><span>Temperature</span></div><div><strong>{safeWeather.humidity}%</strong><span>Humidity</span></div><div><strong>{safeWeather.wind} km/h</strong><span>Wind speed</span></div><div><strong>{safeWeather.rain}%</strong><span>Rain chance</span></div></div><div className={warning ? 'farm-alert warning' : 'farm-alert'}>{warning ? 'Avoid pesticide spraying today because of wind/rain risk.' : 'Good window for field inspection and carefully timed spraying today.'}</div></> : <EmptyData message="Search a location to load live weather from OpenWeather." />}</ModuleCard>{safeWeather && <ModuleCard title={`Five-day outlook · ${safeWeather.city}`}><div className="forecast-grid">{safeWeather.forecast.map(day => <div className="forecast-item" key={`${safeWeather.city}-${day.day}`}><b>{day.day}</b><Sun size={22} /><strong>{day.temp}°</strong><span>{day.rain}% rain</span><small>{day.rain > 50 ? 'Delay spray' : day.temp > 30 ? 'Irrigate early' : 'Good for field work'}</small></div>)}</div></ModuleCard>}</div>
}

function MandiTracker() {
  const [state, setState] = useState('Maharashtra')
  const [commodity, setCommodity] = useState('')
  const [records, setRecords] = useState([])
  const [meta, setMeta] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showDemo, setShowDemo] = useState(true)
  const demoRecords = [
    { id: 'demo-pune-onion', commodity: { name: 'Onion' }, market: { name: 'Lasalgaon' }, prices: { min: 1800, modal: 2200, max: 2600 } },
    { id: 'demo-nashik-grape', commodity: { name: 'Grapes' }, market: { name: 'Nashik' }, prices: { min: 4200, modal: 5000, max: 5800 } },
    { id: 'demo-akola-soybean', commodity: { name: 'Soybean' }, market: { name: 'Akola' }, prices: { min: 4300, modal: 4700, max: 5100 } },
  ]

  const search = async () => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams({ state, limit: '12' })
      if (commodity.trim()) params.set('commodity', commodity.trim())
      const response = await fetch(`${apiBase}/integrations/apmc/latest?${params}`)
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Unable to load live mandi rates.')
      setRecords(Array.isArray(data.data) ? data.data : [])
      setMeta(data.meta || null)
    } catch (requestError) {
      setRecords([])
      setMeta(null)
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { search() }, [])

  const visibleRecords = [...records, ...(showDemo ? demoRecords : [])]
  return <div className="module-layout"><ModuleCard title="APMC mandi rates"><div className="weather-search"><Search size={15} /><input value={state} onChange={event => setState(event.target.value)} placeholder="State" /><input value={commodity} onChange={event => setCommodity(event.target.value)} placeholder="Commodity (optional)" /><button className="secondary-btn" onClick={search}>{loading ? 'Loading...' : 'Search'}</button></div><button className="secondary-btn demo-toggle" onClick={() => setShowDemo(!showDemo)}>{showDemo ? 'Hide academic demo data' : 'Show academic demo data'}</button>{error && <p className="helper-text error-text">{error}</p>}{visibleRecords.length > 0 ? <><div className="market-table">{visibleRecords.map(record => <div className="market-row" key={record.id}><div><strong>{record.commodity?.name || 'Unknown commodity'}</strong><span>{record.market?.name || 'Unknown market'}</span></div><strong>₹{record.prices?.modal ?? '—'}<small> / quintal</small></strong><span>Min ₹{record.prices?.min ?? '—'} · Max ₹{record.prices?.max ?? '—'}<br />{record.id?.startsWith('demo-') ? 'Academic demo record' : 'Live provider record'}</span></div>)}</div>{meta && <p className="helper-text">Live provider records: {meta.total ?? meta.count ?? records.length}. Source: {meta.source || 'MandiBhavAajKa'}</p>} {showDemo && <p className="helper-text">Sample values are for classroom demonstration only and must not be used for selling decisions.</p>}</> : (!loading && <EmptyData message="No live or sample mandi records matched this search." />)}</ModuleCard></div>
}

function EconomicsPlanner() {
  return <AiAnalysis title="Farm economics calculator" queryLabel="Enter actual farm economics data" placeholder="Example: 3 acres, expected yield 12 quintals/acre, expected sale price, seed cost, fertilizer cost, labour, machinery, irrigation, transport" />
}

function KisanMitra() {
  const [question, setQuestion] = useState('')
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState([])
  const send = async (event) => {
    event.preventDefault()
    if (!question.trim() || loading) return
    const text = question.trim()
    setMessages((current) => [...current, { from: 'user', text }])
    setQuestion('')
    setLoading(true)
    try {
      const response = await fetch(`${apiBase}/integrations/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: text }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Kisan Mitra is unavailable.')
      setMessages((current) => [...current, { from: 'bot', text: data.answer }])
    } catch (error) {
      setMessages((current) => [...current, { from: 'bot', text: error.message || 'Kisan Mitra is unavailable.' }])
    } finally {
      setLoading(false)
    }
  }
  return <div className="module-layout"><ModuleCard title="Ask Kisan Mitra"><div className="chat-box">{messages.map((message, index) => <p className={message.from} key={`${message.from}-${index}`}>{message.text}</p>)}</div><form className="chat-form" onSubmit={send}><input value={question} onChange={e => setQuestion(e.target.value)} placeholder="How much fertilizer should I use?" /><button className="primary-btn" type="submit" disabled={loading}>{loading ? 'Thinking...' : 'Send'}</button></form></ModuleCard><ModuleCard title="Emergency farmer support"><div className="helpline-list"><a href="tel:1551"><strong>1551</strong><span>Kisan Call Centre</span></a><a href="tel:18001801551"><strong>1800-180-1551</strong><span>Farmer support helpline</span></a><a href="tel:112"><strong>112</strong><span>Emergency services</span></a></div></ModuleCard></div>
}

function CepReport() {
  return ;//<ModuleCard title="Smart Farming Advisory System · SEM 5 CEP"><div className="report-copy"><h2>Title page</h2><p><strong>Title:</strong> Smart Farming Advisory System for Farmers</p><p><strong>Programme:</strong> Bachelor of Science (Information Technology) · Semester 5</p><p><strong>Academic year:</strong> 2026–27 · <strong>Mentor:</strong> Prof. Archana Patil</p><h2>Certificate and declaration</h2><p>This report is submitted as a Community Engagement Project. The student confirms that the work is original and that field observations, interviews, secondary sources, and clearly labelled demonstration records are reported honestly.</p><h2>Acknowledgement</h2><p>I express my gratitude to the institute, faculty mentor, farmers, and community participants who contributed observations and feedback for this project.</p><h2>Abstract</h2><p>This project develops a farmer-oriented digital advisory system that combines crop planning, nutrient guidance, weather awareness, live APMC information, economics, and Kisan Mitra support. The system responds to community needs identified through farmer interaction and secondary research. Live market records are obtained from the configured APMC provider; academic sample records are separately labelled for demonstration.</p><h2>Chapter 1: Introduction</h2><p>The purpose is to connect information-technology learning with a practical agricultural problem. The project focuses on accessible decision support for crop choice, fertilizer planning, field operations, market awareness, and farmer support. Its scope is advisory and educational; pesticide use, prices, and agronomic decisions must be verified with local professionals.</p><h2>Chapter 2: Literature review</h2><p>The study refers to University of Mumbai CEP guidelines under NEP 2020, official agricultural data sources, weather services, and APMC market information. These sources highlight the importance of community interaction, responsible data use, local context, and connecting classroom theory with real-life socio-economic issues.</p><h2>Chapter 3: Methodology</h2><p>Methods include community-oriented observation, requirement discussions, secondary survey, software prototyping, API integration, database-backed farmer profiles, and functional testing. The approach separates verified live data from academic demonstration values and avoids presenting fabricated records as current market facts.</p><h2>Chapter 4: Community interactions, observations and analysis</h2><p>Farmers commonly need simple regional information, clear language, timely weather advice, input guidance, and market comparisons. The prototype addresses these needs through onboarding, multilingual-ready navigation, weather search, live APMC search, AI-assisted support, and printable academic documentation. The sample mandi cards demonstrate interface behavior only; live records remain the source for operational use.</p><h2>Chapter 5: Conclusion and recommendations</h2><p>The project demonstrates how a full-stack system can make agricultural information easier to access while retaining human and institutional verification. Recommended future work includes more farmer interviews, verified advisor directories, persistent crop records, regional language coverage, offline support, and validated government data partnerships.</p><h2>List of figures and screenshot evidence</h2><ol><li>Figure 1: Overview and farm-at-a-glance dashboard.</li><li>Figure 2: My crops portfolio.</li><li>Figure 3: Crop recommendation lab.</li><li>Figure 4: Fertilizer search and calculation.</li><li>Figure 5: Weather advisory desk and five-day forecast.</li><li>Figure 6: Live APMC mandi tracker with source and price range.</li><li>Figure 7: Farm economics calculator.</li><li>Figure 8: Kisan Mitra chatbot and emergency support.</li><li>Figure 9: Advisories and plant assistant.</li><li>Figure 10: Irrigation and water planning.</li><li>Figure 11: Farm tasks and notifications.</li><li>Figure 12: Settings and language preferences.</li><li>Figure 13: This CEP report and print/PDF view.</li></ol><p>These screenshots are captured from the deployed application for the report appendix. Live API values are identified as live; academic APMC sample cards are identified as demo records.</p><h2>References</h2><ul><li>University of Mumbai, Guidelines for Community Engagement Projects for Undergraduate Students, NEP 2020, Academic Year 2025–26.</li><li>Community Engagement Project Format, School of Applied Sciences, B.Sc. Information Technology, Academic Year 2026–27.</li><li>MandiBhavAajKa API documentation and AGMARKNET provenance metadata.</li><li>OpenWeather and OpenAI provider documentation.</li></ul><h2>Appendices</h2><p>Appendix A: farmer interaction notes. Appendix B: guide interaction diary. Appendix C: feedback form. Appendix D: screenshot evidence and live/demo data distinction.</p></div><button className="primary-btn print-btn" onClick={() => window.print()}><FileText size={17} /> Print / save PDF summary</button></ModuleCard>
}

function CropCard({ name, variety, stage, days, color }) {
  return <article className="crop-card"><div className={`crop-art ${color}`}><Sprout size={34} /></div><div className="crop-card-body"><span className="tag">{stage}</span><h3>{name}</h3><p>{variety} · {days} after sowing</p><div className="crop-progress"><i style={{ width: name === 'Onion' ? '72%' : name === 'Tomato' ? '58%' : '35%' }} /></div><small>Crop health <b>Good</b></small></div></article>
}

function initials(name) {
  return (name || 'Farmer').trim().split(/\s+/).map(part => part[0]).join('').slice(0, 2).toUpperCase()
}

function NotificationSection({ notifications }) {
  return <div className="notification-section-list">{notifications.map(({ id, title, text, time, icon: Icon }) => <article className="notification-section-row" key={id || title}><span className="notification-icon"><Icon size={17} /></span><div><strong>{title}</strong><p>{text}</p><small>{time}</small></div></article>)}</div>
}

function WeatherLookup() {
  const [query, setQuery] = useState('')
  const [location, setLocation] = useState('Nashik, Maharashtra')
  return <div className="weather-lookup"><Search size={15} /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search another location..." /><button onClick={() => query.trim() && setLocation(query.trim())}>Search</button><small>{location}</small></div>
}

function PlantDoctor({ notify }) {
  const [symptoms, setSymptoms] = useState('')
  const [recording, setRecording] = useState(false)
  const [photo, setPhoto] = useState('')
  const [imageDataUrl, setImageDataUrl] = useState('')
  const [answer, setAnswer] = useState('')
  const [loading, setLoading] = useState(false)
  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])
  const speechRecognitionRef = useRef(null)

  const analyze = async () => {
    if (!symptoms && !imageDataUrl) return
    setLoading(true)
    try {
      const response = await fetch(`${apiBase}/integrations/plant-advice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symptoms, imageDataUrl }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'AI diagnosis is unavailable right now.')
      setAnswer(data.answer)
      notify('Plant advisory generated')
    } catch (error) {
      setAnswer(error.message || 'The AI diagnosis is unavailable. Consult a local agronomist before applying treatment.')
      notify('Plant advisory could not be generated')
    } finally {
      setLoading(false)
    }
  }

  const toggleRecording = async () => {
    if (recording) {
      speechRecognitionRef.current?.stop()
      mediaRecorderRef.current?.stop()
      setRecording(false)
      return
    }
    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition()
        recognition.lang = 'en-IN'
        recognition.continuous = true
        recognition.interimResults = false
        recognition.onresult = (event) => {
          const transcript = Array.from(event.results)
            .slice(event.resultIndex)
            .map((result) => result[0].transcript)
            .join(' ')
          if (transcript) setSymptoms((current) => current ? `${current} ${transcript}` : transcript)
        }
        recognition.onerror = () => {
          setRecording(false)
          notify('Speech recognition failed; please type the symptoms')
        }
        recognition.onend = () => setRecording(false)
        speechRecognitionRef.current = recognition
        recognition.start()
        setRecording(true)
        return
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      mediaRecorderRef.current = recorder
      chunksRef.current = []
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data)
      }
      recorder.onstop = () => {
        new Blob(chunksRef.current, { type: 'audio/webm' })
        stream.getTracks().forEach((track) => track.stop())
        notify('Audio captured; this browser does not support speech-to-text, so type the symptoms before analysis')
      }
      recorder.start()
      setRecording(true)
    } catch (error) {
      setAnswer('Microphone access is unavailable. Please type the symptoms manually.')
      notify('Microphone permission required')
    }
  }

  const selectPhoto = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    setPhoto(file.name)
    const reader = new FileReader()
    reader.onload = () => setImageDataUrl(String(reader.result || ''))
    reader.readAsDataURL(file)
  }
  return <div className="plant-doctor"><div><p className="eyebrow">AI CROP ASSISTANT</p><h2>Ask what your plant needs</h2><p>Type symptoms, record your voice, or upload a plant photo. Rootwise will suggest the next safe step.</p></div><textarea value={symptoms} onChange={event => setSymptoms(event.target.value)} placeholder="Describe yellow leaves, spots, insects, crop age..." /><div className="doctor-actions"><button className={recording ? 'secondary-btn recording' : 'secondary-btn'} onClick={toggleRecording}><Mic size={15} /> {recording ? 'Stop recording' : 'Speak symptoms'}</button><label className="secondary-btn"><Camera size={15} /> Take / upload photo<input type="file" accept="image/*" onChange={selectPhoto} hidden /></label><button className="primary-btn" onClick={analyze} disabled={loading}>{loading ? 'Analyzing...' : 'Analyze plant'} <ArrowUpRight size={15} /></button></div>{photo && <small className="file-name">Photo selected: {photo}</small>}{answer && <div className="doctor-answer"><strong>Suggested next step</strong><p>{answer}</p><small>Use only products approved for your crop and region. This assistant is a first screening, not a substitute for a certified agronomist.</small></div>}</div>
}

function CropModal({ form, setForm, onClose, onSave }) {
  return <div className="modal-backdrop" onClick={onClose}><div className="modal" onClick={event => event.stopPropagation()}><button className="modal-close" onClick={onClose}><X size={18} /></button><p className="eyebrow">CROP PORTFOLIO</p><h2>Add a crop</h2><p className="modal-copy">Add the crop you want Rootwise to monitor and advise.</p><form onSubmit={event => { event.preventDefault(); if (form.name.trim()) onSave() }}><label>Crop name<input required value={form.name} onChange={event => setForm({ ...form, name: event.target.value })} placeholder="e.g. Wheat" autoFocus /></label><label>Variety<input required value={form.variety} onChange={event => setForm({ ...form, variety: event.target.value })} placeholder="e.g. HD-2967" /></label><label>Growth stage<select value={form.stage} onChange={event => setForm({ ...form, stage: event.target.value })}><option>Seedling</option><option>Vegetative</option><option>Flowering</option><option>Harvesting</option></select></label><div className="modal-actions"><button type="button" className="secondary-btn" onClick={onClose}>Cancel</button><button type="submit" className="primary-btn">Save crop</button></div></form></div></div>
}

function IrrigationPage() {
  return <AiAnalysis title="AI irrigation plan" queryLabel="Enter current soil moisture, crop, area, and recent rain data" placeholder="Example: tomato, 2 acres, soil moisture 42%, no rain in 5 days" />
}

function InsightsPage() {
  return <AiAnalysis title="AI farm insights" queryLabel="Enter the farmer's measured data for analysis" placeholder="Example: 4 acres, crop stage, soil test values, yield, costs, irrigation logs, and recent weather" />
}

function SettingsPage({ notify, profile, setProfile }) {
  const [form, setForm] = useState({
    name: profile?.name || '',
    farmLocation: profile?.location || '',
    preferredLanguage: profile?.preferredLanguage || 'English',
  })
  useEffect(() => setForm({ name: profile?.name || '', farmLocation: profile?.location || '', preferredLanguage: profile?.preferredLanguage || 'English' }), [profile])

  const save = async () => {
    const response = await fetch(`${apiBase}/auth/profile`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, email: profile?.email }) })
    const data = await response.json()
    if (!response.ok) return notify(data.error || 'Settings could not be saved')
    setProfile(data.farmer)
    localStorage.setItem('rootwise-profile', JSON.stringify(data.farmer))
    localStorage.setItem('rootwise-language', form.preferredLanguage)
    notify('Farm settings saved')
  }
  return <div className="settings-card"><label>Farmer name<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label><label>Farm location<input value={form.farmLocation} onChange={(event) => setForm({ ...form, farmLocation: event.target.value })} /></label><label>Preferred language<select value={form.preferredLanguage} onChange={(event) => setForm({ ...form, preferredLanguage: event.target.value })}><option>English</option><option>Hindi</option><option>Marathi</option></select></label><button className="primary-btn" onClick={save}><Check size={16} /> Save changes</button></div>
}

function StatCard({ icon: Icon, label, value, detail, positive, warning }) {
  return <div className="stat-card"><div className={`stat-icon ${warning ? 'warning' : ''}`}><Icon size={19} /></div><div><span>{label}</span><strong>{value}</strong><small className={warning ? 'warning-text' : positive ? 'positive' : ''}>{positive && <TrendingUp size={12} />}{warning && <AlertTriangle size={12} />}{detail}</small></div></div>
}

function WindIcon() { return <span className="wind-icon">≈</span> }

createRoot(document.getElementById('root')).render(<App />)
