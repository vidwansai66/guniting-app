import { useState, useMemo } from 'react';
import { Globe, MapPin, Phone, MessageCircle, ArrowLeft, PlusCircle, Trash2, Edit2, User, CheckCircle2, HardHat, ShieldCheck, Tractor, AlertTriangle, Zap } from 'lucide-react';
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

  // --- UI COMPONENTS ---
  const TopHeader = () => (
    <header className="bg-primary p-4 shadow-sm relative z-10 w-full mb-4 rounded-b-lg">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-3">
          <div className="bg-black text-primary p-2 rounded-lg">
            <HardHat size={28} />
          </div>
          <div>
            <h1 className="text-xl m-0 tracking-tight text-left" style={{ color: '#000' }}>Guniting Express {currentUser?.role === 'admin' ? '- Admin' : ''}</h1>
            <p className="text-xs m-0 font-bold opacity-90 text-left" style={{ color: '#000' }}>Fast Machine Booking for Construction Contractors</p>
          </div>
        </div>
        {currentUser && (
          <button onClick={() => { logout(); setScreen('login'); }} className="btn btn-secondary w-auto py-2 px-3 shadow-sm text-xs border-none">
            {text.logout}
          </button>
        )}
      </div>
    </header>
  );

  const Footer = () => (
    <footer className="bg-white border-t p-6 mt-8 rounded-t-lg">
      <div className="text-center mb-6">
        <h3 className="font-bold mb-2 text-lg">Need Help?</h3>
        <p className="text-secondary font-bold text-lg mb-2 flex justify-center items-center gap-2">
          <Phone fill="currentColor" size={18} /> Support: +91 98765 43210
        </p>
      </div>
      <div className="flex flex-col gap-3 text-sm text-secondary font-semibold items-center justify-center">
        <span className="flex items-center gap-2"><ShieldCheck size={18} className="text-success" /> Trusted by Local Contractors</span>
        <span className="flex items-center gap-2"><Zap size={18} className="text-primary" /> Fast Response & Simple App</span>
      </div>
    </footer>
  );

  // --- RENDERING HELPERS ---

  if (screen === 'language') {
    return (
      <div className="flex flex-col min-h-[100vh]">
        <TopHeader />
        <main className="justify-center items-center flex-1">
          <div className="card w-full text-center py-10 shadow-md">
            <HardHat size={48} className="mx-auto mb-6 text-primary" />
            <h1 className="mb-8">{t.hi.selectLang} / {t.en.selectLang}</h1>
            <div className="flex flex-col gap-4">
              <button className="btn btn-primary text-xl py-4" onClick={() => { setLang('hi'); setScreen('login'); }}>हिंदी</button>
              <button className="btn btn-outline text-xl py-4 border-2" onClick={() => { setLang('en'); setScreen('login'); }}>English</button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (screen === 'login') {
    return (
      <div className="flex flex-col min-h-screen">
        <TopHeader />
        <main className="justify-center px-4 animate-fade-in flex-1">
          <div className="card shadow-md py-8">
            <h1 className="mb-6 text-center">{text.login}</h1>
            <div className="form-group">
              <label>{text.phoneNum}</label>
              <input type="tel" className="form-control text-lg" value={phoneInput} onChange={e => setPhoneInput(e.target.value)} placeholder="10-digit number" />
            </div>
            <button className="btn btn-primary mt-4 py-4 text-lg" onClick={handleLoginSubmit}>{text.login} / {text.reg}</button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (screen === 'otp') {
    return (
      <div className="flex flex-col min-h-screen">
        <TopHeader />
        <main className="justify-center px-4 animate-fade-in flex-1">
          <div className="card shadow-md py-8">
            <h1 className="mb-6 text-center">{text.otp}</h1>
            <p className="text-center text-sm text-secondary mb-6">(Use 1234 for testing)</p>
            <div className="form-group">
              <input type="number" className="form-control text-center text-3xl font-bold tracking-widest py-4" value={otpInput} onChange={e => setOtpInput(e.target.value)} placeholder="----" />
            </div>
            <button className="btn btn-primary py-4 text-lg" onClick={handleOtpSubmit}>{text.verify}</button>
            <button className="btn btn-outline mt-4" onClick={() => setScreen('login')}>{text.back}</button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (screen === 'register') {
    return (
      <div className="flex flex-col min-h-screen">
        <TopHeader />
        <main className="justify-center px-4 animate-fade-in flex-1">
          <div className="card shadow-md py-8">
            <h1 className="mb-6 text-center">{text.reg}</h1>
            <div className="form-group">
              <label>{text.name}</label>
              <input type="text" className="form-control" value={regName} onChange={e => setRegName(e.target.value)} placeholder="Enter your full name" />
            </div>
            <div className="form-group">
              <label>{text.role}</label>
              <select className="form-control font-bold" value={regRole} onChange={e => setRegRole(e.target.value)}>
                <option value="contractor">{text.contractor}</option>
                <option value="owner">{text.owner}</option>
                <option value="worker">{text.worker}</option>
              </select>
            </div>
            <button className="btn btn-primary py-4 mt-6 text-lg" onClick={handleRegisterSubmit}>{text.reg}</button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // --- DASHBOARDS ---
  if (!currentUser) return null;

  return (
    <div className="flex flex-col min-h-screen">
      <TopHeader />

      {screen === 'dashboard' && currentUser.role === 'contractor' && (
        <main className="px-4 animate-fade-in flex-1 mt-2">
          <div className="mb-6">
            <h2 className="text-2xl">Hello, {currentUser.name}</h2>
            <p className="text-secondary font-semibold">What do you need today?</p>
          </div>

          <div className="flex flex-col gap-4">
            <button className="card shadow-md flex justify-between items-center w-full text-left hover:border-black transition-colors" onClick={() => { setTargetType('machine'); setScreen('listings'); }} style={{ padding: '24px', margin: 0 }}>
              <div>
                <h3 className="text-xl font-bold m-0 mb-1">{text.availMachines}</h3>
                <p className="text-sm text-secondary m-0">Find pumps, mixers, etc.</p>
              </div>
              <div className="bg-primary p-3 rounded-full text-black">
                <Tractor size={28} />
              </div>
            </button>

            <button className="card shadow-md flex justify-between items-center w-full text-left hover:border-black transition-colors" onClick={() => { setTargetType('worker'); setScreen('listings'); }} style={{ padding: '24px', margin: 0 }}>
              <div>
                <h3 className="text-lg font-bold m-0 mb-1">{text.availWorkers}</h3>
                <p className="text-sm text-secondary m-0">Skilled labor & operators</p>
              </div>
              <div className="bg-surface border p-3 rounded-full text-black">
                <User size={28} />
              </div>
            </button>

            <button className="card shadow-sm flex justify-between items-center w-full text-left bg-black text-white mt-4" onClick={() => alert('Emergency feature coming soon!')} style={{ padding: '20px', margin: 0 }}>
              <div>
                <h3 className="text-lg font-bold m-0 mb-1">Emergency Service</h3>
                <p className="text-xs text-gray-300 m-0">Urgent machine breakdown</p>
              </div>
              <AlertTriangle size={24} className="text-primary" />
            </button>
          </div>
        </main>
      )}

      {screen === 'listings' && currentUser.role === 'contractor' && (
        <main className="px-4 animate-fade-in flex-col flex-1 mt-2">
          <div className="flex items-center gap-4 mb-6">
            <button onClick={() => setScreen('dashboard')} className="btn btn-outline w-auto py-2 px-3 shadow-sm border-2">
              <ArrowLeft size={18} strokeWidth={3} />
            </button>
            <h2 className="m-0 flex-1">{targetType === 'machine' ? text.availMachines : text.availWorkers}</h2>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
            <label className="block text-sm font-bold mb-2 text-secondary">Available Near You</label>
            <div className="flex items-center gap-2">
              <MapPin size={20} className="text-primary" />
              <select className="form-control py-2 shadow-sm border-2 font-bold flex-1" value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)}>
                <option value="all">Everywhere</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Pune">Pune</option>
                <option value="Thane">Thane</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {targetType === 'machine' && machines.filter(m => locationFilter === 'all' || m.location === locationFilter).map(m => {
              const owner = users.find(u => u.id === m.owner_id);
              return (
                <div key={m.id} className="card shadow-md relative overflow-hidden">
                  <div className={`absolute top-0 left-0 w-1.5 h-full ${m.availability_status ? 'bg-success' : 'bg-error'}`}></div>
                  <div className="pl-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-bold m-0">{m.machine_type}</h3>
                      <span className={`badge ${m.availability_status ? 'badge-success' : 'badge-error'}`}>
                        {m.availability_status ? text.available : text.busy}
                      </span>
                    </div>

                    <p className="flex items-center gap-1.5 text-secondary font-semibold mb-3">
                      <MapPin size={16} />{m.location}
                    </p>

                    <div className="bg-background border rounded-lg p-3 mb-4 inline-block">
                      <p className="text-xs text-secondary m-0 mb-1">{text.price}</p>
                      <p className="font-bold text-lg m-0 text-black">{m.price_per_day}</p>
                    </div>

                    <div className="flex gap-3">
                      <a href={`tel:${owner?.phone}`} onClick={() => logRequest('machine', m.id)} className="btn btn-primary flex-1 py-3 text-sm" disabled={!m.availability_status}>
                        <Phone size={18} fill="currentColor" /> {text.call}
                      </a>
                      <a href={`https://wa.me/${owner?.phone}`} onClick={() => logRequest('machine', m.id)} className="btn btn-outline flex-1 py-3 text-sm" disabled={!m.availability_status} style={{ borderColor: '#16a34a', color: '#16a34a', backgroundColor: '#dcfce7' }}>
                        <MessageCircle size={18} fill="currentColor" /> WhatsApp
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}

            {targetType === 'worker' && workers.filter(w => locationFilter === 'all' || w.location === locationFilter).map(w => {
              const u = users.find(u => u.id === w.user_id);
              return (
                <div key={w.id} className="card shadow-md relative overflow-hidden">
                  <div className={`absolute top-0 left-0 w-1.5 h-full ${w.availability_status ? 'bg-success' : 'bg-error'}`}></div>
                  <div className="pl-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-bold m-0">{w.skill_type || 'Worker'}</h3>
                      <span className={`badge ${w.availability_status ? 'badge-success' : 'badge-error'}`}>
                        {w.availability_status ? text.available : text.busy}
                      </span>
                    </div>

                    <div className="flex gap-4 text-sm font-semibold text-secondary mb-3">
                      <span className="flex items-center gap-1"><MapPin size={14} />{w.location}</span>
                      <span className="flex items-center gap-1">Exp: {w.experience_years} yrs</span>
                    </div>

                    <div className="bg-background border rounded-lg p-3 mb-4 inline-block">
                      <p className="text-xs text-secondary m-0 mb-1">{text.price}</p>
                      <p className="font-bold text-lg m-0 text-black">{w.daily_rate}</p>
                    </div>

                    <div className="flex gap-3">
                      <a href={`tel:${u?.phone}`} onClick={() => logRequest('worker', w.id)} className="btn btn-primary flex-1 py-3 text-sm" disabled={!w.availability_status}>
                        <Phone size={18} fill="currentColor" /> {text.call}
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}

            {((targetType === 'machine' && machines.length === 0) || (targetType === 'worker' && workers.length === 0)) && (
              <div className="text-center bg-white border p-8 rounded-lg">
                <p className="text-secondary font-bold text-lg m-0">No results found for this location.</p>
              </div>
            )}
          </div>
        </main>
      )}

      {/* OWNER DASHBOARD */}
      {screen === 'dashboard' && currentUser.role === 'owner' && (
        <main className="px-4 animate-fade-in flex-col flex-1 mt-2">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl m-0">{text.myMachines}</h2>
            <button className="btn btn-primary w-auto py-2.5 px-4 shadow text-sm rounded-full" onClick={() => setScreen('add-machine')}>
              <PlusCircle size={18} strokeWidth={3} /> {text.addMachine}
            </button>
          </div>

          <div className="flex flex-col gap-4">
            {machines.filter(m => m.owner_id === currentUser.id).map(m => (
              <div key={m.id} className="card shadow-md relative overflow-hidden">
                <div className={`absolute top-0 left-0 w-1.5 h-full ${m.availability_status ? 'bg-success' : 'bg-error'}`}></div>
                <div className="pl-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg m-0">{m.machine_type}</h3>
                    <button
                      className={`badge ${m.availability_status ? 'badge-success' : 'badge-error'} shadow-sm`}
                      style={{ border: 'none', cursor: 'pointer' }}
                      onClick={() => updateMachine(m.id, { availability_status: !m.availability_status })}
                    >
                      {m.availability_status ? text.available : text.busy}
                    </button>
                  </div>

                  <p className="text-sm font-semibold text-secondary mb-3"><MapPin size={14} className="inline mr-1 mb-0.5" />{m.location}</p>

                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-xs text-secondary m-0 mb-1">{text.price}</p>
                      <p className="font-bold text-lg m-0 text-black">{m.price_per_day}</p>
                    </div>
                    <button className="btn btn-outline border-error text-error w-auto py-2 px-3 text-sm shadow-sm hover:bg-error hover:text-white" onClick={() => deleteMachine(m.id)}>
                      <Trash2 size={16} /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {machines.filter(m => m.owner_id === currentUser.id).length === 0 && (
              <div className="text-center bg-white border p-8 rounded-lg">
                <Tractor size={48} className="mx-auto text-secondary mb-4 opacity-50" />
                <p className="font-bold text-lg m-0 mb-2">No machines listed yet.</p>
                <p className="text-secondary m-0">Click '{text.addMachine}' above to get started.</p>
              </div>
            )}
          </div>
        </main>
      )}

      {/* ADD MACHINE FORM */}
      {screen === 'add-machine' && currentUser.role === 'owner' && (
        <main className="px-4 animate-fade-in flex-col flex-1 mt-2">
          <div className="flex items-center gap-4 mb-6">
            <button onClick={() => setScreen('dashboard')} className="btn btn-outline w-auto py-2 px-3 shadow-sm border-2">
              <ArrowLeft size={18} strokeWidth={3} />
            </button>
            <h2 className="m-0 flex-1">New Machine</h2>
          </div>

          <div className="card shadow-md">
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
              <div className="form-group"><label>Machine Type</label><input name="type" required className="form-control" placeholder="e.g. Line Pump, Transit Mixer" /></div>
              <div className="form-group"><label>City / Area</label><input name="location" required className="form-control" placeholder="e.g. Mumbai, Pune" /></div>
              <div className="form-group"><label>Price per Day</label><input name="price" required className="form-control" placeholder="e.g. ₹10,000" /></div>
              <button type="submit" className="btn btn-primary py-4 mt-2 text-lg shadow-md">{text.addMachine}</button>
            </form>
          </div>
        </main>
      )}

      {/* WORKER DASHBOARD */}
      {screen === 'dashboard' && currentUser.role === 'worker' && (
        <main className="px-4 animate-fade-in flex-1 mt-2">
          <h2 className="mb-6 text-2xl">{text.profile}</h2>
          {workers.filter(w => w.user_id === currentUser.id).map(w => (
            <div key={w.id} className="card shadow-md">
              <div className="flex justify-between items-center bg-background -mx-5 -mt-5 mb-6 p-4 rounded-t-lg border-b">
                <span className="font-bold text-lg">My Status</span>
                <button
                  className={`badge ${w.availability_status ? 'badge-success' : 'badge-error'} px-4 py-2 text-sm shadow-sm transition-transform hover:scale-105 active:scale-95`}
                  style={{ border: 'none', cursor: 'pointer' }}
                  onClick={() => updateWorkerProfile({ availability_status: !w.availability_status })}
                >
                  <span className={`w-2 h-2 rounded-full ${w.availability_status ? 'bg-success' : 'bg-error'} mr-1`}></span>
                  {w.availability_status ? "Available for Work" : "Currently Busy"}
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
                alert('Profile saved successfully!');
              }}>
                <div className="form-group"><label>Primary Skill</label><input name="skill" defaultValue={w.skill_type} className="form-control" placeholder="e.g. Nozzleman, Helper" required /></div>
                <div className="form-group"><label>Experience (Years)</label><input type="number" name="exp" defaultValue={w.experience_years} className="form-control" placeholder="e.g. 5" required /></div>
                <div className="form-group"><label>City / Location</label><input name="loc" defaultValue={w.location} className="form-control" placeholder="e.g. Pune" required /></div>
                <div className="form-group"><label>Expected Daily Rate</label><input name="rate" defaultValue={w.daily_rate} className="form-control" placeholder="e.g. ₹1,000" required /></div>
                <button type="submit" className="btn btn-primary py-4 mt-4 text-lg shadow-md">Save Profile</button>
              </form>
            </div>
          ))}
        </main>
      )}

      {/* ADMIN DASHBOARD */}
      {screen === 'dashboard' && currentUser.role === 'admin' && (
        <main className="px-4 py-4 animate-fade-in flex-col gap-6 flex-1">
          <div className="mb-2">
            <h2 className="text-2xl m-0">Admin Panel</h2>
            <p className="text-secondary font-semibold">Manage platform users</p>
          </div>

          <div className="card shadow-md p-0 overflow-hidden">
            <div className="bg-background p-4 border-b">
              <h3 className="m-0 font-bold">Registered Users</h3>
            </div>
            <div className="table-container">
              <table className="w-full text-left bg-white">
                <thead>
                  <tr>
                    <th>User Details</th>
                    <th>Role</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id}>
                      <td>
                        <div className="font-bold mb-1">{u.name}</div>
                        <div className="text-xs text-secondary font-semibold flex items-center gap-1"><Phone size={12} />{u.phone}</div>
                      </td>
                      <td>
                        <span className="tag capitalize">{u.role}</span>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" checked={u.isActive} onChange={() => deactivateUser(u.id)} />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-success"></div>
                          </label>
                          <span className={`text-xs font-bold ${u.isActive ? 'text-success' : 'text-error'}`}>
                            {u.isActive ? 'Active' : 'Banned'}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      )}

      <Footer />
    </div>
  );
}

export default App;
