import { useState, useMemo } from 'react';
import { Globe, MapPin, Phone, MessageCircle, ArrowLeft, PlusCircle, Trash2, Edit2, User, CheckCircle2 } from 'lucide-react';
import { useDb } from './DbContext';
import './index.css';

function App() {
  const { users, machines, workers, contactRequests, currentUser, loginWithPhone, registerUser, logout, addMachine, updateMachine, deleteMachine, updateWorkerProfile, logRequest, deactivateUser } = useDb();

  const [lang, setLang] = useState(null);
  const [screen, setScreen] = useState('language'); // language, login, register, otp, dashboard, listings, add-machine

  // Auth Form State
  const [phoneInput, setPhoneInput] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [regName, setRegName] = useState('');
  const [regRole, setRegRole] = useState('contractor');
  const [targetType, setTargetType] = useState('machine'); // machine or worker (for contractor listings)
  const [locationFilter, setLocationFilter] = useState('all');

  // Text dictionaries (simplified for brevity, keeping Hindi core requirement)
  const t = {
    hi: { selectLang: 'भाषा चुनें', phoneNum: 'फोन नंबर', login: 'प्रवेश करें', otp: 'OTP दर्ज करें', verify: 'सत्यापित करें', reg: 'रजिस्टर करें', name: 'पूरा नाम', role: 'आप क्या हैं?', contractor: 'ठेकेदार', owner: 'मशीन मालिक', worker: 'मजदूर', availMachines: 'उपलब्ध मशीनें', availWorkers: 'उपलब्ध मजदूर', myMachines: 'मेरी मशीनें', addMachine: 'मशीन जोड़ें', requests: 'संपर्क अनुरोध', profile: 'प्रोफाइल', available: 'उपलब्ध', busy: 'व्यस्त', call: 'कॉल करें', back: 'पीछे', logout: 'लॉग आउट', price: 'किराया/दिन' },
    en: { selectLang: 'Select Language', phoneNum: 'Phone Number', login: 'Login', otp: 'Enter OTP', verify: 'Verify', reg: 'Register', name: 'Full Name', role: 'What are you?', contractor: 'Contractor', owner: 'Machine Owner', worker: 'Worker', availMachines: 'Available Machines', availWorkers: 'Available Workers', myMachines: 'My Machines', addMachine: 'Add Machine', requests: 'Contact Requests', profile: 'Profile', available: 'Available', busy: 'Busy', call: 'Call', back: 'Back', logout: 'Logout', price: 'Price/Day' }
  };

  const text = lang ? t[lang] : t.en;

  const handleLoginSubmit = () => {
    if (phoneInput.length < 4) return alert('Invalid Phone');
    setScreen('otp');
  };

  const handleOtpSubmit = () => {
    if (otpInput === '1234') { // Mock OTP validation
      const user = loginWithPhone(phoneInput);
      if (user) {
        setScreen('dashboard');
      } else {
        setScreen('register');
      }
    } else {
      alert('OTP is 1234');
    }
  };

  const handleRegisterSubmit = () => {
    if (!regName) return alert('Name required');
    registerUser({ name: regName, phone: phoneInput, role: regRole, language_preference: lang });
    setScreen('dashboard');
  };

  // --- RENDERING HELPERS ---

  if (screen === 'language') {
    return (
      <main className="justify-center items-center h-full">
        <div className="card w-full text-center py-8">
          <h1 className="mb-6">{t.hi.selectLang} / {t.en.selectLang}</h1>
          <div className="flex flex-col gap-4">
            <button className="btn btn-primary" onClick={() => { setLang('hi'); setScreen('login'); }}>हिंदी</button>
            <button className="btn btn-secondary" onClick={() => { setLang('en'); setScreen('login'); }}>English</button>
          </div>
        </div>
      </main>
    );
  }

  if (screen === 'login') {
    return (
      <main className="justify-center px-4 animate-fade-in">
        <div className="card mt-8">
          <h1 className="mb-4 text-center">{text.login}</h1>
          <div className="form-group">
            <label>{text.phoneNum}</label>
            <input type="tel" className="form-control" value={phoneInput} onChange={e => setPhoneInput(e.target.value)} placeholder="10-digit number" />
          </div>
          <button className="btn btn-primary" onClick={handleLoginSubmit}>{text.login} / {text.reg}</button>
        </div>
      </main>
    );
  }

  if (screen === 'otp') {
    return (
      <main className="justify-center px-4 animate-fade-in">
        <div className="card mt-8">
          <h1 className="mb-4 text-center">{text.otp} (1234)</h1>
          <div className="form-group">
            <input type="number" className="form-control text-center text-2xl" value={otpInput} onChange={e => setOtpInput(e.target.value)} placeholder="----" />
          </div>
          <button className="btn btn-primary" onClick={handleOtpSubmit}>{text.verify}</button>
          <button className="btn btn-outline mt-4" onClick={() => setScreen('login')}>{text.back}</button>
        </div>
      </main>
    );
  }

  if (screen === 'register') {
    return (
      <main className="justify-center px-4 animate-fade-in">
        <div className="card mt-8">
          <h1 className="mb-4 text-center">{text.reg}</h1>
          <div className="form-group">
            <label>{text.name}</label>
            <input type="text" className="form-control" value={regName} onChange={e => setRegName(e.target.value)} />
          </div>
          <div className="form-group">
            <label>{text.role}</label>
            <select className="form-control" value={regRole} onChange={e => setRegRole(e.target.value)}>
              <option value="contractor">{text.contractor}</option>
              <option value="owner">{text.owner}</option>
              <option value="worker">{text.worker}</option>
            </select>
          </div>
          <button className="btn btn-primary" onClick={handleRegisterSubmit}>{text.reg}</button>
        </div>
      </main>
    );
  }

  // --- DASHBOARDS ---
  if (!currentUser) return null;

  return (
    <>
      <header className="flex justify-between items-center p-4 border-b bg-white relative z-10">
        <h1 className="text-xl m-0 font-bold truncate">GE {currentUser.role === 'admin' ? 'Admin' : ''}</h1>
        <div className="flex gap-2">
          <button onClick={() => { logout(); setScreen('login'); }} className="btn btn-secondary" style={{ padding: '8px', width: 'auto' }}>
            {text.logout}
          </button>
        </div>
      </header>

      {screen === 'dashboard' && currentUser.role === 'contractor' && (
        <main className="justify-center gap-6 px-4 py-8 animate-fade-in">
          <h2 className="text-center mb-4">Hello, {currentUser.name}</h2>
          <button className="btn btn-primary" style={{ padding: '24px' }} onClick={() => { setTargetType('machine'); setScreen('listings'); }}>
            <Phone size={24} /> {text.availMachines}
          </button>
          <button className="btn btn-secondary" style={{ padding: '24px' }} onClick={() => { setTargetType('worker'); setScreen('listings'); }}>
            <User size={24} /> {text.availWorkers}
          </button>
        </main>
      )}

      {screen === 'listings' && currentUser.role === 'contractor' && (
        <main className="px-4 py-4 animate-fade-in flex-col h-full">
          <button onClick={() => setScreen('dashboard')} className="btn btn-outline mb-4 w-auto self-start py-2 px-4 shadow-sm">
            <ArrowLeft size={16} /> {text.back}
          </button>

          <div className="mb-4">
            <select className="form-control shadow-sm" value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)}>
              <option value="all">All Locations</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Pune">Pune</option>
              <option value="Thane">Thane</option>
            </select>
          </div>

          <div className="flex flex-col gap-4 overflow-y-auto">
            {targetType === 'machine' && machines.filter(m => m.availability_status && (locationFilter === 'all' || m.location === locationFilter)).map(m => {
              const owner = users.find(u => u.id === m.owner_id);
              return (
                <div key={m.id} className="card shadow-md">
                  <h2 className="text-lg">{m.machine_type}</h2>
                  <p className="flex items-center gap-2 text-secondary mb-2"><MapPin size={16} />{m.location}</p>
                  <p className="font-bold mb-4">{m.price_per_day}</p>
                  <div className="flex gap-2">
                    <a href={`tel:${owner?.phone}`} onClick={() => logRequest('machine', m.id)} className="btn btn-primary flex-1 py-3"><Phone size={18} /> {text.call}</a>
                    <a href={`https://wa.me/${owner?.phone}`} onClick={() => logRequest('machine', m.id)} className="btn btn-outline flex-1 py-3" style={{ borderColor: '#25d366', color: '#25d366' }}><MessageCircle size={18} /> WA</a>
                  </div>
                </div>
              );
            })}
            {targetType === 'worker' && workers.filter(w => w.availability_status && (locationFilter === 'all' || w.location === locationFilter)).map(w => {
              const u = users.find(u => u.id === w.user_id);
              return (
                <div key={w.id} className="card shadow-md">
                  <h2 className="text-lg">{w.skill_type || 'Worker'}</h2>
                  <p className="text-secondary mb-1">Exp: {w.experience_years} yrs</p>
                  <p className="flex items-center gap-2 text-secondary mb-2"><MapPin size={16} />{w.location}</p>
                  <p className="font-bold mb-4">{w.daily_rate}/day</p>
                  <div className="flex gap-2">
                    <a href={`tel:${u?.phone}`} onClick={() => logRequest('worker', w.id)} className="btn btn-primary flex-1 py-3"><Phone size={18} /> {text.call}</a>
                  </div>
                </div>
              );
            })}

            {((targetType === 'machine' && machines.length === 0) || (targetType === 'worker' && workers.length === 0)) && (
              <p className="text-center text-secondary py-8">No results found.</p>
            )}
          </div>
        </main>
      )}

      {/* OWNER DASHBOARD */}
      {screen === 'dashboard' && currentUser.role === 'owner' && (
        <main className="px-4 py-4 animate-fade-in flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl m-0">{text.myMachines}</h2>
            <button className="btn btn-primary w-auto py-2 px-4 shadow-sm text-sm" onClick={() => setScreen('add-machine')}>
              <PlusCircle size={16} /> {text.addMachine}
            </button>
          </div>

          <div className="flex flex-col gap-4">
            {machines.filter(m => m.owner_id === currentUser.id).map(m => (
              <div key={m.id} className="card shadow-md border-t-4" style={{ borderTopColor: m.availability_status ? 'var(--color-success)' : 'var(--color-error)' }}>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold m-0">{m.machine_type}</h3>
                  <button
                    className={`badge ${m.availability_status ? 'badge-success' : 'badge-error'}`}
                    style={{ border: 'none', cursor: 'pointer' }}
                    onClick={() => updateMachine(m.id, { availability_status: !m.availability_status })}
                  >
                    {m.availability_status ? text.available : text.busy}
                  </button>
                </div>
                <p className="text-sm text-secondary mb-1"><MapPin size={14} className="inline mr-1 mb-1" />{m.location}</p>
                <p className="font-bold text-sm mb-4">{m.price_per_day}</p>
                <div className="flex gap-2">
                  <button className="btn btn-danger w-auto flex-1 py-2 text-sm shadow-sm" onClick={() => deleteMachine(m.id)}>
                    <Trash2 size={14} className="mb-0.5" /> Delete
                  </button>
                </div>
              </div>
            ))}
            {machines.filter(m => m.owner_id === currentUser.id).length === 0 && (
              <p className="text-center text-sm text-secondary py-8 bg-surface rounded-lg">No machines listed yet. Click '{text.addMachine}' above.</p>
            )}
          </div>
        </main>
      )}

      {/* ADD MACHINE FORM */}
      {screen === 'add-machine' && currentUser.role === 'owner' && (
        <main className="px-4 py-4 animate-fade-in flex-col">
          <button onClick={() => setScreen('dashboard')} className="btn btn-outline mb-4 w-auto self-start py-2 px-4 shadow-sm">
            <ArrowLeft size={16} /> {text.back}
          </button>
          <div className="card shadow-md">
            <h2 className="mb-4">New Machine</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              addMachine({
                machine_type: e.target.type.value,
                location: e.target.location.value,
                price_per_day: e.target.price.value,
                availability_status: true
              });
              setScreen('dashboard');
            }}>
              <div className="form-group"><label>Type</label><input name="type" required className="form-control" placeholder="e.g. Line Pump" /></div>
              <div className="form-group"><label>Location</label><input name="location" required className="form-control" placeholder="Mumbai" /></div>
              <div className="form-group"><label>Price/Day</label><input name="price" required className="form-control" placeholder="₹10,000" /></div>
              <button type="submit" className="btn btn-primary">{text.addMachine}</button>
            </form>
          </div>
        </main>
      )}

      {/* WORKER DASHBOARD */}
      {screen === 'dashboard' && currentUser.role === 'worker' && (
        <main className="px-4 py-4 animate-fade-in">
          <h2 className="mb-4">{text.profile}</h2>
          {workers.filter(w => w.user_id === currentUser.id).map(w => (
            <div key={w.id} className="card shadow-md">
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-border">
                <span className="font-bold text-lg">Status</span>
                <button
                  className={`badge ${w.availability_status ? 'badge-success' : 'badge-error'} px-4 py-2 text-sm shadow-sm`}
                  style={{ border: 'none', cursor: 'pointer' }}
                  onClick={() => updateWorkerProfile({ availability_status: !w.availability_status })}
                >
                  {w.availability_status ? "I am Available" : "I am Busy"}
                </button>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                updateWorkerProfile({
                  skill_type: e.target.skill.value,
                  experience_years: e.target.exp.value,
                  location: e.target.loc.value,
                  daily_rate: e.target.rate.value
                });
                alert('Profile saved!');
              }}>
                <div className="form-group"><label>Skill</label><input name="skill" defaultValue={w.skill_type} className="form-control" placeholder="Nozzleman" required /></div>
                <div className="form-group"><label>Experience (Years)</label><input type="number" name="exp" defaultValue={w.experience_years} className="form-control" placeholder="5" required /></div>
                <div className="form-group"><label>Location</label><input name="loc" defaultValue={w.location} className="form-control" placeholder="Pune" required /></div>
                <div className="form-group"><label>Daily Rate</label><input name="rate" defaultValue={w.daily_rate} className="form-control" placeholder="₹1,000" required /></div>
                <button type="submit" className="btn btn-primary mt-2">Save Profile</button>
              </form>
            </div>
          ))}
        </main>
      )}

      {/* ADMIN DASHBOARD */}
      {screen === 'dashboard' && currentUser.role === 'admin' && (
        <main className="px-4 py-4 animate-fade-in flex-col gap-4">
          <h2 className="mb-2">Admin Panel</h2>
          <div className="card border-l-4 border-primary">
            <h3>Users</h3>
            <div className="overflow-x-auto mt-2">
              <table className="w-full text-left border-collapse text-sm">
                <thead><tr className="border-b"><th className="pb-2">Name</th><th className="pb-2">Role</th><th className="pb-2">Action</th></tr></thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} className="border-b last:border-0">
                      <td className="py-2">{u.name}<br /><span className="text-xs text-secondary">{u.phone}</span></td>
                      <td className="py-2">{u.role}</td>
                      <td className="py-2">
                        <button className="btn btn-danger py-1 px-2 text-xs w-auto" disabled={!u.isActive} onClick={() => deactivateUser(u.id)}>
                          {u.isActive ? 'Deactivate' : 'Inactive'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      )}

    </>
  );
}

export default App;
