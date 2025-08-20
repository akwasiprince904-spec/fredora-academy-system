import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaBell,
  FaBookOpen,
  FaCalendarAlt,
  FaChartBar,
  FaCog,
  FaEnvelope,
  FaGraduationCap,
  FaSearch,
  FaSignOutAlt,
  FaUser,
  FaUserGraduate,
  FaUsers,
  FaChalkboardTeacher,
  FaDollarSign
} from 'react-icons/fa';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

// THEME
const theme = {
  bg: '#f7f7fb',
  card: '#ffffff',
  text: '#2f2f33',
  subText: '#6b7280',
  wine: '#722F37',
  wineDark: '#8B3D47',
  green: '#22c55e',
  blue: '#3b82f6',
  purple: '#7c3aed',
  red: '#ef4444',
  border: '#e5e7eb'
};

// Add CSS keyframes for loading animation
const GlobalStyles = styled.div`
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

// LAYOUT
const Page = styled.div`
  min-height: 100vh;
  background: ${theme.bg};
  color: ${theme.text};
  display: grid;
  grid-template-columns: 260px 1fr 360px;
  grid-template-areas: 'sidebar main right';
  @media (max-width: 1200px) {
    grid-template-columns: 240px 1fr;
    grid-template-areas: 'sidebar main' 'sidebar right';
  }
  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    grid-template-areas: 'main';
  }
`;

const Sidebar = styled.aside`
  grid-area: sidebar;
  background: ${theme.card};
  border-right: 1px solid ${theme.border};
  padding: 18px 14px;
  position: sticky;
  top: 0;
  height: 100vh;
  display: flex;
  flex-direction: column;
  gap: 16px;
  @media (max-width: 900px) { display: none; }
`;

const Brand = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 700;
  font-size: 18px;
  padding: 10px 12px;
`;

const Nav = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const NavItem = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 10px;
  border: 1px solid transparent;
  background: transparent;
  color: ${theme.text};
  cursor: pointer;
  transition: all .2s ease;
  &:hover { background: #fdf2f8; border-color: ${theme.wine}; }
  &.active { background: #fce7f3; border-color: ${theme.wine}; color: ${theme.wineDark}; }
  svg { color: ${theme.wineDark}; }
`;

const RightBar = styled.aside`
  grid-area: right;
  background: ${theme.card};
  border-left: 1px solid ${theme.border};
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  @media (max-width: 1200px) { position: sticky; top: 0; height: 100%; }
  @media (max-width: 900px) { display: none; }
`;

const Main = styled.main`
  grid-area: main;
  padding: 18px;
  display: grid;
  gap: 18px;
`;

// HEADER
const TopBar = styled.div`
  background: ${theme.card};
  border: 1px solid ${theme.border};
  border-radius: 12px;
  padding: 12px 16px;
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 12px;
  align-items: center;
`;

const Greeting = styled.div`
  font-weight: 600;
  span { color: ${theme.subText}; font-weight: 500; }
`;

const Search = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f3f4f6;
  border-radius: 10px;
  padding: 8px 10px;
  border: 1px solid ${theme.border};
  input { border: none; outline: none; background: transparent; width: 220px; }
`;

const Profile = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  button { background: ${theme.wine}; color: white; border: none; padding: 8px 12px; border-radius: 8px; cursor: pointer; }
`;

// CARDS
const Cards = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(180px, 1fr));
  gap: 16px;
  @media (max-width: 1100px) { grid-template-columns: repeat(2, 1fr); }
`;

const Card = styled.div`
  background: ${theme.card};
  border: 1px solid ${theme.border};
  border-radius: 14px;
  padding: 16px;
  display: grid;
  gap: 8px;
  position: relative;
  overflow: hidden;
  &:after { content: ''; position: absolute; right: -30px; top: -30px; width: 120px; height: 120px; border-radius: 50%; background: ${props => props.tint}; opacity: .18; }
`;

const CardLabel = styled.div`
  display: flex; align-items: center; gap: 8px; color: ${theme.subText}; font-weight: 600;
`;
const CardNumber = styled.div`
  font-size: 28px; font-weight: 800;
`;

// GRID WRAPS
const Grid = styled.div`
  display: grid; gap: 16px; grid-template-columns: 2.2fr 1.2fr;
  @media (max-width: 1200px) { grid-template-columns: 1fr; }
`;

const Panel = styled.div`
  background: ${theme.card};
  border: 1px solid ${theme.border};
  border-radius: 14px; padding: 16px; display: grid; gap: 12px;
`;

const PanelTitle = styled.div`
  display: flex; align-items: center; justify-content: space-between; font-weight: 700;
`;

const Select = styled.select`
  border: 1px solid ${theme.border}; background: #f9fafb; padding: 6px 8px; border-radius: 8px; outline: none;
`;

// SIMPLE SVG CHARTS
const BarChart = ({ data, type }) => {
  const max = 2000;
  const barW = 26; const gap = 14; const height = 220; const padding = 30;
  const bars = data.map((d, i) => {
    const val = type === 'present' ? d.present : d.absent;
    const h = Math.max(2, Math.round((val / max) * (height - padding)));
    const x = padding + i * (barW + gap);
    const y = height - h;
    return (
      <g key={i}>
        <rect x={x} y={y} width={barW} height={h} rx="6" fill={type === 'present' ? theme.wine : '#1f2937'} />
      </g>
    );
  });
  const width = padding * 2 + data.length * (barW + gap);
  return (
    <svg width={width} height={height} role="img" aria-label="Attendance bar chart">
      {/* Y axis lines */}
      {[0, 500, 1000, 1500, 2000].map((y, i) => (
        <g key={i}>
          <text x={4} y={height - (y / 2000) * (height - padding)} fontSize="10" fill={theme.subText}>{y}</text>
          <line x1={30} x2={width} y1={height - (y / 2000) * (height - padding)} y2={height - (y / 2000) * (height - padding)} stroke={theme.border} />
        </g>
      ))}
      {bars}
    </svg>
  );
};

const Donut = ({ total, girls, boys }) => {
  const r = 60; const c = 2 * Math.PI * r;
  const girlsPct = girls / total; const boysPct = boys / total;
  return (
    <div style={{ display: 'grid', placeItems: 'center' }}>
      <svg width="180" height="180" viewBox="0 0 180 180" role="img" aria-label="Student distribution">
        <circle cx="90" cy="90" r={r} fill="none" stroke={theme.border} strokeWidth="16" />
        <circle cx="90" cy="90" r={r} fill="none" stroke={theme.wine} strokeWidth="16" strokeDasharray={`${c * girlsPct} ${c}`} strokeDashoffset={c * .25} strokeLinecap="round" />
        <circle cx="90" cy="90" r={r} fill="none" stroke="#1f2937" strokeWidth="16" strokeDasharray={`${c * boysPct} ${c}`} strokeDashoffset={c * (.25 + girlsPct)} strokeLinecap="round" />
        <text x="90" y="90" dominantBaseline="middle" textAnchor="middle" fontSize="18" fontWeight="800">{total}</text>
        <text x="90" y="108" dominantBaseline="middle" textAnchor="middle" fontSize="10" fill={theme.subText}>Students</text>
      </svg>
      <div style={{ display: 'flex', gap: 16 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 10, height: 10, background: theme.wine, borderRadius: 3 }}></span>Girls {girls}</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 10, height: 10, background: '#1f2937', borderRadius: 3 }}></span>Boys {boys}</span>
      </div>
    </div>
  );
};

// TABLE
const Table = styled.table`
  width: 100%; border-collapse: collapse; font-size: 14px;
  th, td { text-align: left; padding: 10px; border-bottom: 1px solid ${theme.border}; }
  th { color: ${theme.subText}; font-weight: 700; }
  tbody tr:hover { background: #fffbeb; }
`;

const Tag = styled.span`
  padding: 4px 8px; border-radius: 8px; background: #f3f4f6; border: 1px solid ${theme.border}; font-size: 12px;
`;

const AdminDashboard = () => {
  const { user, logout, token, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  // SAMPLE DATA
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [view, setView] = useState('present');
  const [filterClass, setFilterClass] = useState('All');
  const [filterGrade, setFilterGrade] = useState('All');

  const [metrics, setMetrics] = useState({ students: 0, teachers: 0, courses: 0, earnings: 0 });
  const [attendance, setAttendance] = useState([]);
  const [students, setStudents] = useState([]);
  const [teacherAssignments, setTeacherAssignments] = useState([]);
  const [retryCount, setRetryCount] = useState(0);

  // Clear errors when component mounts or auth changes
  useEffect(() => {
    setError('');
    setRetryCount(0);
  }, [authLoading, isAuthenticated, token]);

  // Clear errors when navigating back to dashboard
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        setError('');
        setRetryCount(0);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  useEffect(() => {
    if (authLoading || !isAuthenticated || !token) {
      return;
    }
    const fetchAll = async () => {
      setLoading(true);
      setError('');
      
      // Add timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      try {
        const authHeader = { headers: { Authorization: `Bearer ${token}` } };
      
        // First check database health with timeout
        try {
          const healthController = new AbortController();
          const healthTimeoutId = setTimeout(() => healthController.abort(), 5000);
          
          await axios.get('/api/health/database', { 
            ...authHeader, 
            signal: healthController.signal 
          });
          
          clearTimeout(healthTimeoutId);
        } catch (healthError) {
          console.error('Database health check failed:', healthError);
          if (healthError.name === 'AbortError') {
            setError('Database connection timeout. Please try again.');
          } else {
            setError('Database connection issue. Please try again.');
          }
          setLoading(false);
          return;
        }
      
        // Fetch all data in parallel for better performance
        const results = await Promise.allSettled([
          axios.get('/api/students/stats/overview', authHeader),
          axios.get('/api/subjects', authHeader), // Fetch subjects directly
          axios.get('/api/students?limit=10', authHeader),
          axios.get('/api/users/teachers/with-assignments', authHeader) // Use optimized endpoint
        ]);
          
        clearTimeout(timeoutId);

        // Stats overview
        if (results[0].status === 'fulfilled') {
          const overview = results[0].value.data?.data?.overview || {};
          const studentCount = overview.total_students || 0;
          setMetrics(prev => ({
            ...prev,
            students: studentCount,
            earnings: Number(overview.total_fee_balance || 0)
          }));

          // Build attendance using actual total students
          const total = studentCount || 0;
          const now = new Date();
          const days = [...Array(10)].map((_, i) => {
            const d = new Date(now); d.setDate(now.getDate() - (9 - i));
            const present = Math.max(0, Math.floor(total * (0.75 + Math.random() * 0.2)));
            const absent = Math.max(0, total - present);
            return { day: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }), present, absent };
          });
          setAttendance(days);
        } else {
          console.error('Error fetching student stats:', results[0].reason);
          // Set default values if stats fail
          setMetrics(prev => ({ ...prev, students: 0, earnings: 0 }));
          setAttendance([]);
        }

        // Subjects (courses)
        if (results[1].status === 'fulfilled') {
          const subjectsData = results[1].value.data?.data || [];
          console.log('Subjects data loaded:', subjectsData.length, 'subjects');
          setMetrics(prev => ({ ...prev, courses: subjectsData.length || 0 }));
        } else {
          console.error('Error fetching subjects:', results[1].reason);
          // Try to fetch subjects again as a fallback
          try {
            const fallbackSubjects = await axios.get('/api/subjects', authHeader);
            const subjectsData = fallbackSubjects.data?.data || [];
            console.log('Fallback subjects data loaded:', subjectsData.length, 'subjects');
            setMetrics(prev => ({ ...prev, courses: subjectsData.length || 0 }));
          } catch (fallbackError) {
            console.error('Fallback subjects fetch also failed:', fallbackError);
            setMetrics(prev => ({ ...prev, courses: 0 }));
          }
        }

        // Students list
        if (results[2].status === 'fulfilled') {
          const studsData = (results[2].value.data?.data || []).map(s => ({
            id: s.id,
            name: `${s.first_name} ${s.last_name}`,
            class: s.class_name || '-',
            grade: '—',
            percent: Math.round(Math.random() * 30 + 70),
            photo: 'https://i.pravatar.cc/100?u=' + s.id
          }));
          setStudents(studsData);
        }

        // Teachers and their assignments (optimized)
        if (results[3].status === 'fulfilled') {
          const teachers = (results[3].value.data?.data || []).slice(0, 6);
          
          // Set teacher count
          setMetrics(prev => ({ ...prev, teachers: results[3].value.data?.data?.length || 0 }));
          
          // Process teacher assignments from the optimized endpoint
          if (teachers.length > 0) {
            const summary = teachers.map(t => ({
              name: t.name,
              username: t.username,
              classes: (t.assigned_classes || []).map(c => c.name)
            }));
            setTeacherAssignments(summary);
          } else {
            setTeacherAssignments([]);
          }
        } else {
          console.error('Error fetching teachers:', results[3].reason);
          setMetrics(prev => ({ ...prev, teachers: 0 }));
          setTeacherAssignments([]);
        }

        // Error if everything failed
        if (results.every(r => r.status === 'rejected')) {
          setError('Failed to load dashboard data');
        }
        setLoading(false);
      } catch (error) {
        console.error('Dashboard fetch error:', error);
        if (error.name === 'AbortError') {
          setError('Request timed out. Please try again.');
        } else {
          setError('Failed to load dashboard data');
        }
        setLoading(false);
        
        // Auto-retry on network errors (max 3 attempts)
        if (retryCount < 3 && (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error'))) {
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
            setError('');
          }, 2000);
        }
      }
    };
    fetchAll();
  }, [authLoading, isAuthenticated, token, retryCount]);

  const filteredStudents = useMemo(() => {
    return students.filter(s => (filterClass === 'All' || s.class === filterClass) && (filterGrade === 'All' || s.grade === filterGrade));
  }, [filterClass, filterGrade]);

  const handleLogout = () => { logout(); navigate('/login'); };

  if (error) {
    return <div style={{ padding: 24 }}>Error: {error}</div>;
  }

  return (
    <Page>
      <GlobalStyles />
      {/* SIDEBAR */}
      <Sidebar aria-label="Sidebar navigation">
        <Brand><FaGraduationCap color={theme.wineDark} /> Fredora's Academy</Brand>
        <Nav>
          {[
            { icon: <FaChartBar />, label: 'Dashboard', path: '/admin' },
            { icon: <FaUsers />, label: 'Students', path: '/students' },
            { icon: <FaChalkboardTeacher />, label: 'Teachers', path: '/admin/teachers' },
            { icon: <FaBookOpen />, label: 'Subjects', path: '/subjects' },
            { icon: <FaDollarSign />, label: 'Earnings', path: '/earnings' },
            { icon: <FaEnvelope />, label: 'Messages', path: '/messages' },
            { icon: <FaCog />, label: 'Settings', path: '/settings' }
          ].map((n, i) => (
            <NavItem 
              key={n.label} 
              className={i === 0 ? 'active' : ''}
              onClick={() => navigate(n.path)}
              style={{ cursor: 'pointer' }}
            >
              {n.icon} {n.label}
            </NavItem>
          ))}
        </Nav>
      </Sidebar>

      {/* MAIN */}
      <Main>
        <TopBar>
          <Greeting>
            Good Morning, {user?.name || 'Admin'} <span>Welcome to Fredora's Academy</span>
          </Greeting>
          <Search>
            <FaSearch color={theme.subText} />
            <input placeholder="Search..." aria-label="Search" />
          </Search>
          <Profile>
            <FaBell aria-label="Notifications" />
            <img src={`https://i.pravatar.cc/60?img=5`} alt="Admin avatar" width={36} height={36} style={{ borderRadius: '50%' }} />
            <button onClick={handleLogout} aria-label="Logout"><FaSignOutAlt /> Logout</button>
          </Profile>
        </TopBar>

        {/* METRICS CARDS */}
        <Cards>
          <Card tint="#bbf7d0">
            <CardLabel><FaUsers color={theme.green} /> Total Students</CardLabel>
            <CardNumber>{metrics.students.toLocaleString()}</CardNumber>
          </Card>
          <Card tint="#dbeafe">
            <CardLabel><FaChalkboardTeacher color={theme.blue} /> Total Teachers</CardLabel>
            <CardNumber>{metrics.teachers}</CardNumber>
          </Card>
          <Card tint="#ddd6fe">
            <CardLabel><FaBookOpen color={theme.purple} /> Total Subjects</CardLabel>
            <CardNumber>{metrics.courses}</CardNumber>
          </Card>
          <Card tint="#fecaca">
            <CardLabel><FaDollarSign color={theme.red} /> Total Earnings</CardLabel>
            <CardNumber>${metrics.earnings.toLocaleString()}</CardNumber>
          </Card>
        </Cards>

        {/* CHARTS + PIE + TABLE */}
        <Grid>
          <Panel aria-labelledby="attendance-title">
            <PanelTitle id="attendance-title">
              Attendance Report <span style={{ color: theme.subText, fontWeight: 500 }}>(Last 10 Days)</span>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <Tag>0 - 2000</Tag>
                <Select value={view} onChange={(e) => setView(e.target.value)} aria-label="View selector">
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                </Select>
              </div>
            </PanelTitle>
            {loading ? <div>Loading chart...</div> : <BarChart data={attendance} type={view} />}
          </Panel>

          <Panel>
            <PanelTitle>Student Distribution</PanelTitle>
            {loading ? <div>Loading...</div> : <Donut total={metrics.students || 0} girls={Math.floor((metrics.students||0)*0.4)} boys={Math.ceil((metrics.students||0)*0.6)} />}
          </Panel>
        </Grid>

        {/* TEACHER ASSIGNMENTS SUMMARY */}
        <Panel>
          <PanelTitle>
            Teacher Assignments (Quick View)
            <button 
              onClick={() => navigate('/admin/teachers')}
              style={{
                background: theme.wine,
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                marginLeft: '16px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.background = theme.wineDark}
              onMouseLeave={(e) => e.target.style.background = theme.wine}
            >
              Manage Teachers
            </button>
          </PanelTitle>
          {loading ? (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              padding: '40px',
              color: theme.subText 
            }}>
              <div style={{ 
                width: '20px', 
                height: '20px', 
                border: `2px solid ${theme.border}`,
                borderTop: `2px solid ${theme.wine}`,
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                marginRight: '10px'
              }}></div>
              Loading teacher assignments...
            </div>
          ) : teacherAssignments.length === 0 ? (
            <div style={{ color: theme.subText, textAlign: 'center', padding: '20px' }}>
              No teachers found. 
              <button 
                onClick={() => navigate('/admin/teachers')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: theme.wine,
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  marginLeft: '8px'
                }}
              >
                Add teachers and assign classes
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
              {teacherAssignments.map((t, i) => (
                <div key={i} style={{ 
                  border: `1px solid ${theme.border}`, 
                  borderRadius: 12, 
                  padding: 12,
                  transition: 'all 0.2s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => e.target.style.borderColor = theme.wine}
                onMouseLeave={(e) => e.target.style.borderColor = theme.border}
                >
                  <div style={{ fontWeight: 700, color: theme.text }}>{t.name}</div>
                  <div style={{ color: theme.subText, fontSize: 12 }}>@{t.username}</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                    {t.classes.length > 0 ? t.classes.map((c, idx) => (
                      <span key={idx} style={{ 
                        background: '#fffbeb', 
                                                border: `1px solid ${theme.wine}`,
                        color: theme.wineDark, 
                        padding: '2px 6px', 
                        borderRadius: 8, 
                        fontSize: 12 
                      }}>
                        {c}
                      </span>
                    )) : (
                      <span style={{ 
                        color: theme.subText, 
                        fontSize: 12, 
                        fontStyle: 'italic' 
                      }}>
                        No classes assigned yet
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>

        <Panel>
          <PanelTitle>
            Student Performance
            <div style={{ display: 'flex', gap: 8 }}>
              <Select value={filterClass} onChange={(e) => setFilterClass(e.target.value)} aria-label="Class filter">
                {['All','9','10','11','12'].map(c => <option key={c}>{c}</option>)}
              </Select>
              <Select value={filterGrade} onChange={(e) => setFilterGrade(e.target.value)} aria-label="Grade filter">
                {['All','A','B','C','D'].map(g => <option key={g}>{g}</option>)}
              </Select>
            </div>
          </PanelTitle>
          {loading ? (
            <div>Loading table...</div>
          ) : (
            <Table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Class</th>
                  <th>Grade</th>
                  <th>Percentage</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map(s => (
                  <tr key={s.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <img src={s.photo} alt="profile" width={28} height={28} style={{ borderRadius: '50%' }} />
                        {s.name}
                      </div>
                    </td>
                    <td>{s.class}</td>
                    <td>{s.grade}</td>
                    <td>
                      <span style={{ color: s.percent >= 90 ? theme.green : s.percent >= 75 ? theme.wineDark : theme.red, fontWeight: 700 }}>
                        {s.percent}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Panel>
      </Main>

      {/* RIGHT SIDEBAR */}
      <RightBar>
        {/* Error Display */}
        {error && (
          <Panel style={{ border: `2px solid ${theme.red}`, background: '#fef2f2' }}>
            <PanelTitle style={{ color: theme.red }}>
              ⚠️ Error fetching data
              <button 
                onClick={() => setError('')}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  color: theme.red, 
                  cursor: 'pointer',
                  fontSize: '16px',
                  marginLeft: 'auto'
                }}
              >
                ×
              </button>
            </PanelTitle>
            <div style={{ color: theme.red, fontSize: '14px', marginBottom: '10px' }}>{error}</div>
            <button 
              onClick={() => {
                setError('');
                setRetryCount(0);
                setLoading(true);
              }}
              style={{ 
                background: theme.wine,
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '600'
              }}
            >
              🔄 Retry
            </button>
          </Panel>
        )}
        
        <Panel>
          <PanelTitle>June 2024 <FaCalendarAlt /></PanelTitle>
          {/* Simple calendar grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 6, fontSize: 12 }}>
            {['S','M','T','W','T','F','S'].map(d => <div key={d} style={{ textAlign: 'center', color: theme.subText }}>{d}</div>)}
            {Array.from({ length: 30 }, (_, i) => i + 1).map((d) => (
              <div key={d} style={{ textAlign: 'center', padding: 8, borderRadius: 8, background: d === 25 ? '#fdf2f8' : 'transparent', border: d === 25 ? `1px solid ${theme.wine}` : '1px solid transparent', color: d === 25 ? theme.wineDark : theme.text }}>{d}</div>
            ))}
          </div>
        </Panel>

        <Panel>
          <PanelTitle>Upcoming Events</PanelTitle>
          <div style={{ display: 'grid', gap: 10 }}>
            {[
              { date: '28 Jun, 2024', title: 'School Annual Function', time: '09:00 AM' },
              { date: '30 Jun, 2024', title: 'Class 12th Farewell', time: '02:30 PM' }
            ].map((e, i) => (
              <div key={i} style={{ border: `1px solid ${theme.border}`, borderRadius: 12, padding: 12 }}>
                <div style={{ color: theme.subText, fontSize: 12 }}>{e.date} • {e.time}</div>
                <div style={{ fontWeight: 700 }}>{e.title}</div>
              </div>
            ))}
          </div>
        </Panel>
      </RightBar>
    </Page>
  );
};

export default AdminDashboard;




