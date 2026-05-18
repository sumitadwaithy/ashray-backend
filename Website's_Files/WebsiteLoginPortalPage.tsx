
import React, { useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  AlertCircle, LogOut, RefreshCw, Eye, EyeOff
} from 'lucide-react';
import { InvestorProfile } from '../components/InvestorProfile';
import { ClientProfile } from '../components/ClientProfile';

// Backend URL
const BACKEND_URL = 'https://ashray-backend-2nt7.onrender.com';

const ClientPortal: React.FC = () => {
  const { clients, investors, referrals, addReferral, addDoc, docs, pullFromCloud } = useData();
  const { t } = useLanguage();
  
  // Auth State
  const [currentClientId, setCurrentClientId] = useState<string | null>(null);
  const [authPayload, setAuthPayload] = useState<any>(null);
  const [role, setRole] = useState<'client' | 'investor' | null>(null);
  
  const currentUser = useMemo(() => {
    const localClient = clients.find(c => c.id === currentClientId);
    if (localClient) return localClient;
    const localInvestor = investors.find((i: any) => i.id === currentClientId);
    if (localInvestor) return localInvestor;
    return authPayload || null;
  }, [clients, investors, currentClientId, authPayload]);
  
  const isLoggedIn = !!currentUser;

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogout = () => { 
    setCurrentClientId(null); 
    setAuthPayload(null);
    setRole(null);
    setUsername(''); 
    setPassword(''); 
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username: username,
          password: password 
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        setRole(result.role);
        setAuthPayload(result.data);
        setCurrentClientId(result.data.id);

        // Pull from cloud on each login to get latest data
        await pullFromCloud();

        if (result.data.referrals) {
          result.data.referrals.forEach((r: any) => {
            if (!referrals.find((existing: any) => existing.id === r.id)) {
              addReferral(r);
            }
          });
        }

        if (result.data.docs) {
          result.data.docs.forEach((d: any) => addDoc(d));
        }
      } else {
        setError('Invalid ID or password.');
      }
    } catch (err) {
      setError('Connection error. Please check your internet connection.');
    } finally {
      setLoading(false);
    }
  };

  if (!isLoggedIn || !currentUser) {
    return (
      <div className="flex" style={{ minHeight: 'calc(100vh - 112px)', fontFamily: 'sans-serif' }}>
        {/* ════════════════════════════════════════
            LEFT — RED BRAND PANEL
        ════════════════════════════════════════ */}
        <div className="hidden lg:flex lg:w-[52%] relative flex-col justify-between overflow-hidden" style={{ background: '#C41E1E' }}>
          {/* Diagonal grid pattern */}
          <div style={{
            position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none',
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)
            `,
            backgroundSize: '48px 48px',
          }} />

          {/* Large circle accents */}
          <div style={{
            position: 'absolute', bottom: '-180px', right: '-180px',
            width: '520px', height: '520px', borderRadius: '50%',
            border: '1px solid rgba(255,255,255,0.08)', zIndex: 0, pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute', bottom: '-100px', right: '-100px',
            width: '360px', height: '360px', borderRadius: '50%',
            border: '1px solid rgba(255,255,255,0.1)', zIndex: 0, pointerEvents: 'none',
          }} />

          {/* Top section */}
          <div style={{ position: 'relative', zIndex: 1, padding: '56px 56px 0' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '100px', padding: '6px 14px', marginBottom: '48px',
            }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#fff' }} />
              <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 600 }}>
                Client Portal
              </span>
            </div>

            <h1 style={{
              fontFamily: "'Playfair Display', serif", fontSize: '52px', fontWeight: 700,
              color: '#fff', lineHeight: 1.1, letterSpacing: '-0.5px', margin: '0 0 24px', maxWidth: '420px',
            }}>
              Your Property.<br />
              Your Documents.<br />
              <span style={{ color: 'rgba(255,255,255,0.55)' }}>Your Dashboard.</span>
            </h1>

            <div style={{ width: '48px', height: '2px', background: 'rgba(255,255,255,0.35)', marginBottom: '24px' }} />

            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '15px', lineHeight: 1.7, maxWidth: '360px' }}>
              Access your payment history, property documents, and account details — all in one secure place.
            </p>
          </div>

          {/* Bottom stats */}
          <div style={{
            position: 'relative', zIndex: 1, padding: '40px 56px 56px',
            display: 'flex', gap: '40px', borderTop: '1px solid rgba(255,255,255,0.1)',
          }}>
            {[
              { num: '500+', label: 'Happy Clients' },
              { num: '₹200Cr+', label: 'Managed Assets' },
              { num: '15+', label: 'Years of Trust' },
            ].map(stat => (
              <div key={stat.label}>
                <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '26px', fontWeight: 700, color: '#fff', margin: 0, lineHeight: 1 }}>
                  {stat.num}
                </p>
                <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '11px', margin: '6px 0 0', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ════════════════════════════════════════
            RIGHT — FORM PANEL
        ════════════════════════════════════════ */}
        <div className="w-full lg:w-[48%] flex flex-col justify-center items-center" style={{ background: '#FAFAFA', padding: '48px 32px' }}>
          {/* Mobile brand */}
          <div className="lg:hidden mb-10 text-center">
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '28px', fontWeight: 700, color: '#C41E1E', margin: 0 }}>
              Client Portal
            </h2>
            <p style={{ color: '#9CA3AF', fontSize: '13px', marginTop: '6px' }}>
              Sign in to access your account
            </p>
          </div>

          <div style={{ width: '100%', maxWidth: '400px' }}>

            <div style={{ marginBottom: '40px' }}>
              <p style={{ color: '#C41E1E', fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 700, marginBottom: '10px' }}>
                Welcome back
              </p>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '32px', fontWeight: 700, color: '#111', margin: '0 0 6px', lineHeight: 1.2 }}>
                Sign in to your account
              </h2>
              <p style={{ color: '#9CA3AF', fontSize: '14px', margin: 0 }}>
                Enter your client credentials below
              </p>
            </div>

            {error && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '12px 16px', marginBottom: '24px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '10px' }}>
                <AlertCircle style={{ width: '15px', height: '15px', color: '#DC2626', flexShrink: 0, marginTop: '1px' }} />
                <p style={{ color: '#DC2626', fontSize: '13px', margin: 0 }}>{error}</p>
              </div>
            )}

            <form onSubmit={handlePasswordLogin} style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#6B7280', marginBottom: '10px' }}>
                  Client ID / Username
                </label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '3px', background: '#C41E1E', borderRadius: '3px 0 0 3px' }} />
                  <input
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    required
                    placeholder="e.g. rameshkumar"
                    style={{
                      display: 'block', width: '100%', background: '#fff',
                      border: '1.5px solid #E5E7EB', borderLeft: '3px solid #C41E1E',
                      borderRadius: '8px', padding: '13px 14px 13px 18px',
                      fontSize: '14px', color: '#111', outline: 'none',
                      transition: 'border-color 0.2s, box-shadow 0.2s', boxSizing: 'border-box',
                    }}
                    onFocus={e => { e.target.style.borderColor = '#C41E1E'; e.target.style.boxShadow = '0 0 0 3px rgba(196,30,30,0.08)'; }}
                    onBlur={e => { e.target.style.borderColor = '#E5E7EB'; e.target.style.borderLeftColor = '#C41E1E'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '32px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#6B7280', marginBottom: '10px' }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '3px', background: '#C41E1E', borderRadius: '3px 0 0 3px', zIndex: 1 }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    style={{
                      display: 'block', width: '100%', background: '#fff',
                      border: '1.5px solid #E5E7EB', borderLeft: '3px solid #C41E1E',
                      borderRadius: '8px', padding: '13px 40px 13px 18px',
                      fontSize: '14px', color: '#111', outline: 'none',
                      transition: 'border-color 0.2s, box-shadow 0.2s', boxSizing: 'border-box',
                    }}
                    onFocus={e => { e.target.style.borderColor = '#C41E1E'; e.target.style.boxShadow = '0 0 0 3px rgba(196,30,30,0.08)'; }}
                    onBlur={e => { e.target.style.borderColor = '#E5E7EB'; e.target.style.borderLeftColor = '#C41E1E'; e.target.style.boxShadow = 'none'; }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    style={{
                      position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer', padding: '4px',
                      color: '#9CA3AF', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%', padding: '15px',
                  background: loading ? '#9CA3AF' : '#C41E1E',
                  color: '#fff', border: 'none', borderRadius: '8px',
                  fontSize: '13px', fontWeight: 700, letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                  transition: 'background 0.2s, transform 0.15s',
                  boxShadow: loading ? 'none' : '0 8px 24px rgba(196,30,30,0.28)',
                }}
                onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#A81818'; }}
                onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#C41E1E'; }}
                onMouseDown={e => { if (!loading) e.currentTarget.style.transform = 'translateY(1px)'; }}
                onMouseUp={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                {loading
                  ? <><RefreshCw style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} /> Signing in...</>
                  : t('login')
                }
              </button>
            </form>

            <p style={{ color: '#D1D5DB', fontSize: '12px', textAlign: 'center', marginTop: '32px', lineHeight: 1.6 }}>
              Your credentials are provided by<br />
              <span style={{ color: '#9CA3AF', fontWeight: 500 }}>Ashray Group</span> upon registration.
            </p>

          </div>
        </div>

        <style>{`
          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          input::placeholder { color: #D1D5DB !important; }
        `}</style>
      </div>
    );
  }

  if (role === 'investor') {
    return (
      <div className="min-h-screen bg-gray-50 pb-20 text-gray-900 print:bg-white print:p-0">
        <div className="bg-red-700 text-white pt-24 pb-20 px-4 print:hidden">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
              <div>
                  <h1 className="text-2xl md:text-3xl font-bold font-playfair">{t('welcome_back')}, {authPayload.title || ''} {authPayload.name || authPayload.username}</h1>
                  <p className="text-red-200 text-sm mt-1 uppercase tracking-wider font-bold">Investor ID: {authPayload.id?.toUpperCase()}</p>
              </div>
              <button onClick={handleLogout} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors text-sm font-medium"><LogOut size={16}/> {t('logout')}</button>
          </div>
        </div>
        <div className="-mt-12 relative z-10">
          <InvestorProfile investor={authPayload} docs={docs} />
        </div>
      </div>
    );
  }

  return (
    <>
      <ClientProfile currentUser={currentUser} handleLogout={handleLogout} docs={docs} />
    </>
  );
};

export default ClientPortal;
