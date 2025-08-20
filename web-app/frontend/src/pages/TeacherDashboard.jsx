import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaGraduationCap, FaUsers, FaClipboardCheck, FaChartLine, 
  FaCalendarAlt, FaFileAlt, FaSignOutAlt, FaUserGraduate, 
  FaChalkboardTeacher, FaBell, FaBook, FaTrophy, FaClock,
  FaCheckCircle, FaExclamationTriangle
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import styled from 'styled-components';
import axios from 'axios';
import { toast } from 'react-toastify';

const DashboardContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--accent-color) 100%);
  padding: 20px;
`;

const Header = styled.header`
  background: var(--secondary-color);
  border-radius: 15px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: var(--shadow-medium);
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
`;

const HeaderIcon = styled.div`
  width: 50px;
  height: 50px;
  background: var(--primary-color);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--secondary-color);
  font-size: 24px;
`;

const HeaderText = styled.div`
  h1 {
    color: var(--primary-color);
    margin: 0;
    font-size: 28px;
    font-weight: 600;
  }
  p {
    color: var(--text-secondary);
    margin: 5px 0 0 0;
    font-size: 14px;
  }
`;

const UserSection = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
`;

const UserInfo = styled.div`
  text-align: right;
  
  .user-name {
    color: var(--primary-color);
    font-weight: 600;
    font-size: 16px;
    margin: 0;
  }
  
  .user-role {
    color: var(--text-secondary);
    font-size: 12px;
    margin: 0;
  }
`;

const LogoutButton = styled(motion.button)`
  padding: 10px 15px;
  background: var(--danger-color);
  color: var(--secondary-color);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  transition: all 0.3s ease;
  
  &:hover {
    background: #c82333;
    transform: translateY(-1px);
  }
`;

const MainContent = styled.main`
  display: grid;
  gap: 20px;
`;

const WelcomeSection = styled(motion.div)`
  background: var(--secondary-color);
  border-radius: 15px;
  padding: 30px;
  box-shadow: var(--shadow-medium);
  text-align: center;
`;

const WelcomeTitle = styled.h2`
  color: var(--primary-color);
  margin: 0 0 10px 0;
  font-size: 32px;
  font-weight: 600;
`;

const WelcomeSubtitle = styled.p`
  color: var(--text-secondary);
  font-size: 18px;
  margin: 0;
`;

const StatsGrid = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
`;

const StatCard = styled(motion.div)`
  background: var(--secondary-color);
  border-radius: 15px;
  padding: 25px;
  box-shadow: var(--shadow-medium);
  text-align: center;
  border-left: 4px solid var(--primary-color);
  transition: transform 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
  }
`;

const StatIcon = styled.div`
  width: 60px;
  height: 60px;
  background: var(--primary-color);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 15px;
  color: var(--secondary-color);
  font-size: 24px;
`;

const StatNumber = styled.div`
  font-size: 36px;
  font-weight: 700;
  color: var(--primary-color);
  margin-bottom: 5px;
`;

const StatLabel = styled.div`
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 500;
`;

const QuickActionsGrid = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
`;

const ActionCard = styled(motion.div)`
  background: var(--secondary-color);
  border-radius: 15px;
  padding: 25px;
  box-shadow: var(--shadow-medium);
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  
  &:hover {
    border-color: var(--primary-color);
    transform: translateY(-3px);
    box-shadow: var(--shadow-large);
  }
`;

const ActionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
`;

const ActionIcon = styled.div`
  width: 50px;
  height: 50px;
  background: var(--primary-color);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--secondary-color);
  font-size: 20px;
`;

const ActionContent = styled.div`
  h3 {
    color: var(--primary-color);
    margin: 0 0 5px 0;
    font-size: 18px;
    font-weight: 600;
  }
  
  p {
    color: var(--text-secondary);
    margin: 0;
    font-size: 14px;
  }
`;

const AssignedClassesSection = styled(motion.div)`
  background: var(--secondary-color);
  border-radius: 15px;
  padding: 25px;
  box-shadow: var(--shadow-medium);
`;

const SectionTitle = styled.h3`
  color: var(--primary-color);
  margin: 0 0 20px 0;
  font-size: 20px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const ClassesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
`;

const ClassCard = styled.div`
  background: var(--background-light);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid var(--border-color);
  transition: all 0.3s ease;
  
  &:hover {
    border-color: var(--primary-color);
    transform: translateY(-2px);
    box-shadow: var(--shadow-small);
  }
`;

const ClassHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 15px;
`;

const ClassIcon = styled.div`
  width: 40px;
  height: 40px;
  background: var(--primary-color);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--secondary-color);
  font-size: 16px;
`;

const ClassInfo = styled.div`
  flex: 1;
  
  .class-name {
    color: var(--primary-color);
    font-weight: 600;
    font-size: 16px;
    margin: 0 0 5px 0;
  }
  
  .class-subject {
    color: var(--text-secondary);
    font-size: 14px;
    margin: 0;
  }
`;

const ClassStats = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-top: 15px;
`;

const ClassStat = styled.div`
  text-align: center;
  padding: 10px;
  background: var(--secondary-color);
  border-radius: 8px;
  
  .stat-number {
    color: var(--primary-color);
    font-weight: 600;
    font-size: 18px;
    margin: 0 0 5px 0;
  }
  
  .stat-label {
    color: var(--text-secondary);
    font-size: 12px;
    margin: 0;
  }
`;

const ClassActions = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 15px;
`;

const ClassActionButton = styled.button`
  flex: 1;
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &.primary {
    background: var(--primary-color);
    color: var(--secondary-color);
    
    &:hover {
      background: var(--accent-color);
    }
  }
  
  &.secondary {
    background: var(--background-dark);
    color: var(--text-primary);
    
    &:hover {
      background: var(--border-color);
    }
  }
`;

const AssignedSubjectsSection = styled.section`
  margin-top: 30px;
`;

const SubjectsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
`;

const SubjectCard = styled.div`
  background: var(--secondary-color);
  border-radius: 12px;
  padding: 20px;
  box-shadow: var(--shadow-medium);
  border: 1px solid var(--border-color);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-large);
  }
`;

const SubjectHeader = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 15px;
  margin-bottom: 20px;
`;

const SubjectIcon = styled.div`
  width: 50px;
  height: 50px;
  background: var(--primary-color);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--secondary-color);
  font-size: 20px;
`;

const SubjectInfo = styled.div`
  flex: 1;
  
  .subject-name {
    color: var(--primary-color);
    margin: 0 0 5px 0;
    font-size: 18px;
    font-weight: 600;
  }
  
  .subject-code {
    color: var(--text-secondary);
    font-size: 14px;
    margin: 0 0 5px 0;
    font-weight: 500;
  }
  
  .subject-class {
    color: var(--text-secondary);
    font-size: 12px;
    margin: 0;
  }
`;

const SubjectActions = styled.div`
  display: flex;
  gap: 10px;
`;

const SubjectActionButton = styled.button`
  flex: 1;
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &.primary {
    background: var(--primary-color);
    color: var(--secondary-color);
    
    &:hover {
      background: var(--accent-color);
    }
  }
`;

const TeacherDashboard = () => {
  const { user, logout, isAuthenticated, token, loading } = useAuth();
  const navigate = useNavigate();
  
  // Mock data for demonstration
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalClasses: 0,
    attendanceRate: 0,
    averageGrade: 0
  });

  const [assignedClasses, setAssignedClasses] = useState([]);
  const [assignedSubjects, setAssignedSubjects] = useState([]);

  useEffect(() => {
    // Wait until auth is ready and teacher is authenticated
    if (loading || !isAuthenticated || !token || user?.role !== 'teacher') {
      return;
    }

    const fetchTeacherData = async () => {
      try {
        console.log('Starting to fetch teacher data...');
        
        // Fetch assigned classes first
        console.log('Fetching assigned classes...');
        const classesResponse = await axios.get('/api/users/my-classes', {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Classes response:', classesResponse);
        const classesData = classesResponse.data.data || [];
        console.log('Teacher assigned classes:', classesData);
        
        // Fetch assigned subjects
        console.log('Fetching assigned subjects...');
        const subjectsResponse = await axios.get(`/api/subjects/assignments/teacher/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Subjects response:', subjectsResponse);
        const subjectsData = subjectsResponse.data.data || [];
        console.log('Teacher assigned subjects:', subjectsData);
        setAssignedSubjects(subjectsData);
        
        // Fetch grades to calculate stats (but don't fail if this errors)
        let gradesData = [];
        try {
          console.log('Fetching grades...');
          const gradesResponse = await axios.get('/api/grades/my-students', {
            headers: { Authorization: `Bearer ${token}` }
          });
          console.log('Grades response:', gradesResponse);
          gradesData = gradesResponse.data.data || [];
          console.log('Grades data:', gradesData);
        } catch (gradesError) {
          console.warn('Error fetching grades (non-fatal):', gradesError);
          // Continue without grades data
        }
        
        // Calculate stats
        const totalStudents = [...new Set(gradesData.map(g => g.student_id))].length;
        const totalClasses = classesData.length;
        const averageGrade = gradesData.length > 0 
          ? Math.round(gradesData.reduce((sum, g) => sum + (g.score || 0), 0) / gradesData.length * 100) / 100
          : 0;
        
        console.log('Calculated stats:', { totalStudents, totalClasses, averageGrade });
        
        setStats({
          totalStudents,
          totalClasses,
          attendanceRate: 96.2, // This would come from attendance system
          averageGrade
        });
        
        // Transform classes data for display
        const transformedClasses = classesData.map(cls => {
          // Find subjects assigned to this teacher for this class
          const classSubjects = subjectsData.filter(subj => subj.class_id === cls.id);
          const subjectNames = classSubjects.map(subj => subj.subject_name).join(', ') || 'General';
          
          return {
            id: cls.id,
            name: cls.name,
            subject: subjectNames,
            students: gradesData.filter(g => g.class_id === cls.id).length || 0,
            attendance: 0, // Would come from attendance system
            nextClass: 'Check schedule'
          };
        });
        
        console.log('Transformed classes:', transformedClasses);
        setAssignedClasses(transformedClasses);
        
        console.log('Teacher data fetch completed successfully');
      } catch (error) {
        console.error('Error fetching teacher data:', error);
        console.error('Error details:', error.response?.data || error.message);
        toast.error(`Failed to load dashboard data: ${error.response?.data?.message || error.message}`);
        
        // Set empty state but don't crash
        setStats({
          totalStudents: 0,
          totalClasses: 0,
          attendanceRate: 0,
          averageGrade: 0
        });
        setAssignedClasses([]);
      }
    };

    fetchTeacherData();
  }, [loading, isAuthenticated, token, user?.role]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  const quickActions = [
    {
      title: 'Mark Attendance',
      description: 'Record daily student attendance',
      icon: <FaClipboardCheck />,
      path: '/attendance',
      color: '#28a745'
    },
    {
      title: 'Update Grades',
      description: 'Enter and manage student grades',
      icon: <FaBook />,
      path: '/teacher/grades',
      color: '#17a2b8'
    },
    {
      title: 'View Students',
      description: 'Access student information and records',
      icon: <FaUserGraduate />,
      path: '/students',
      color: '#ffc107'
    },
    {
      title: 'Generate Reports',
      description: 'Create academic performance reports',
      icon: <FaFileAlt />,
      path: '/reports',
      color: '#6f42c1'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <DashboardContainer>
      <Header>
        <HeaderContent>
          <HeaderIcon>
            <FaChalkboardTeacher />
          </HeaderIcon>
          <HeaderText>
            <h1>Teacher Dashboard</h1>
            <p>Welcome to Fredora's Academy Management System</p>
          </HeaderText>
        </HeaderContent>
        
        <UserSection>
          <UserInfo>
            <p className="user-name">{user?.name || 'Teacher User'}</p>
            <p className="user-role">Teacher</p>
          </UserInfo>
          <LogoutButton
            onClick={handleLogout}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaSignOutAlt />
            Logout
          </LogoutButton>
        </UserSection>
      </Header>

      <MainContent>
        <WelcomeSection
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <WelcomeTitle>Welcome back, {user?.name || 'Teacher'}!</WelcomeTitle>
          <WelcomeSubtitle>
            Here's your teaching overview for today
          </WelcomeSubtitle>
        </WelcomeSection>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <StatsGrid>
            <StatCard variants={itemVariants}>
              <StatIcon>
                <FaUsers />
              </StatIcon>
              <StatNumber>{stats.totalStudents}</StatNumber>
              <StatLabel>Total Students</StatLabel>
            </StatCard>
            
            <StatCard variants={itemVariants}>
              <StatIcon>
                <FaGraduationCap />
              </StatIcon>
              <StatNumber>{stats.totalClasses}</StatNumber>
              <StatLabel>Assigned Classes</StatLabel>
            </StatCard>
            
            <StatCard variants={itemVariants}>
              <StatIcon>
                <FaClipboardCheck />
              </StatIcon>
              <StatNumber>{stats.attendanceRate}%</StatNumber>
              <StatLabel>Attendance Rate</StatLabel>
            </StatCard>
            
            <StatCard variants={itemVariants}>
              <StatIcon>
                <FaTrophy />
              </StatIcon>
              <StatNumber>{stats.averageGrade}%</StatNumber>
              <StatLabel>Average Grade</StatLabel>
            </StatCard>
          </StatsGrid>

          <QuickActionsGrid>
            {quickActions.map((action, index) => (
              <ActionCard
                key={action.title}
                variants={itemVariants}
                onClick={() => handleNavigation(action.path)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <ActionHeader>
                  <ActionIcon style={{ background: action.color }}>
                    {action.icon}
                  </ActionIcon>
                  <ActionContent>
                    <h3>{action.title}</h3>
                    <p>{action.description}</p>
                  </ActionContent>
                </ActionHeader>
              </ActionCard>
            ))}
          </QuickActionsGrid>

          <AssignedClassesSection variants={itemVariants}>
            <SectionTitle>
              <FaGraduationCap />
              Your Assigned Classes
            </SectionTitle>
            
            <ClassesGrid>
              {assignedClasses.length > 0 ? assignedClasses.map((classItem) => (
                <ClassCard key={classItem.id}>
                  <ClassHeader>
                    <ClassIcon>
                      <FaBook />
                    </ClassIcon>
                    <ClassInfo>
                      <h4 className="class-name">{classItem.name}</h4>
                      <p className="class-subject">{classItem.subject}</p>
                    </ClassInfo>
                  </ClassHeader>
                  
                  <ClassStats>
                    <ClassStat>
                      <div className="stat-number">{classItem.students}</div>
                      <div className="stat-label">Students</div>
                    </ClassStat>
                    <ClassStat>
                      <div className="stat-number">{classItem.attendance}</div>
                      <div className="stat-label">Present Today</div>
                    </ClassStat>
                  </ClassStats>
                  
                  <div style={{ 
                    marginTop: '10px', 
                    padding: '8px', 
                    background: '#e3f2fd', 
                    borderRadius: '6px',
                    fontSize: '12px',
                    color: '#1976d2'
                  }}>
                    <FaClock style={{ marginRight: '5px' }} />
                    Next: {classItem.nextClass}
                  </div>
                  
                  <ClassActions>
                    <ClassActionButton
                      className="primary"
                      onClick={() => handleNavigation('/attendance')}
                    >
                      Mark Attendance
                    </ClassActionButton>
                    <ClassActionButton
                      className="secondary"
                      onClick={() => handleNavigation('/teacher/grades')}
                    >
                      Update Grades
                    </ClassActionButton>
                  </ClassActions>
                </ClassCard>
              )) : (
                <div style={{
                  gridColumn: '1 / -1',
                  textAlign: 'center',
                  padding: '2rem',
                  background: 'rgba(255, 255, 255, 0.9)',
                  borderRadius: '12px',
                  color: '#6c757d'
                }}>
                  <FaExclamationTriangle style={{ fontSize: '2rem', marginBottom: '1rem', color: '#ffc107' }} />
                  <h3 style={{ margin: '0 0 0.5rem 0', color: '#495057' }}>No Classes Assigned</h3>
                  <p style={{ margin: 0 }}>Please contact your administrator to get classes assigned to you.</p>
                </div>
              )}
            </ClassesGrid>
          </AssignedClassesSection>

          <AssignedSubjectsSection variants={itemVariants}>
            <SectionTitle>
              <FaBook />
              Your Assigned Subjects
            </SectionTitle>
            
            <SubjectsGrid>
              {assignedSubjects.length > 0 ? assignedSubjects.map((subject) => (
                <SubjectCard key={subject.id}>
                  <SubjectHeader>
                    <SubjectIcon>
                      <FaBook />
                    </SubjectIcon>
                    <SubjectInfo>
                      <h4 className="subject-name">{subject.subject_name}</h4>
                      <p className="subject-code">{subject.subject_code}</p>
                      <p className="subject-class">{subject.class_name} (Grade {subject.grade_level})</p>
                    </SubjectInfo>
                  </SubjectHeader>
                  
                  <SubjectActions>
                    <SubjectActionButton
                      className="primary"
                      onClick={() => handleNavigation('/teacher/grades')}
                    >
                      Manage Grades
                    </SubjectActionButton>
                  </SubjectActions>
                </SubjectCard>
              )) : (
                <div style={{
                  gridColumn: '1 / -1',
                  textAlign: 'center',
                  padding: '2rem',
                  background: 'rgba(255, 255, 255, 0.9)',
                  borderRadius: '12px',
                  color: '#6c757d'
                }}>
                  <FaBook style={{ fontSize: '2rem', marginBottom: '1rem', color: '#6c757d' }} />
                  <h3 style={{ margin: '0 0 0.5rem 0', color: '#495057' }}>No Subjects Assigned</h3>
                  <p style={{ margin: 0 }}>Contact your administrator to get assigned to subjects.</p>
                </div>
              )}
            </SubjectsGrid>
          </AssignedSubjectsSection>
        </motion.div>
      </MainContent>
    </DashboardContainer>
  );
};

export default TeacherDashboard;




