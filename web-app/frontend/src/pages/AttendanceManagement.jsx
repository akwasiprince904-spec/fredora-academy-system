import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaClipboardCheck, FaCalendarAlt, FaUsers, FaCheck, FaTimes,
  FaArrowLeft, FaDownload, FaPrint, FaFilter, FaSearch,
  FaGraduationCap, FaChartBar, FaEye, FaEdit, FaSave,
  FaSort, FaSortUp, FaSortDown, FaCalendarDay
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import styled from 'styled-components';

const AttendanceContainer = styled.div`
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

const ActionButtons = styled.div`
  display: flex;
  gap: 10px;
`;

const Button = styled(motion.button)`
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  
  &.primary {
    background: var(--primary-color);
    color: var(--secondary-color);
    &:hover { background: var(--accent-color); }
  }
  
  &.secondary {
    background: var(--secondary-color);
    color: var(--primary-color);
    border: 2px solid var(--primary-color);
    &:hover { background: var(--primary-color); color: var(--secondary-color); }
  }
  
  &.success {
    background: #28a745;
    color: var(--secondary-color);
    &:hover { background: #218838; }
  }
  
  &.danger {
    background: #dc3545;
    color: var(--secondary-color);
    &:hover { background: #c82333; }
  }
`;

const MainContent = styled.main`
  display: grid;
  gap: 20px;
`;

const FilterSection = styled(motion.div)`
  background: var(--secondary-color);
  border-radius: 15px;
  padding: 20px;
  box-shadow: var(--shadow-medium);
`;

const FilterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const Label = styled.label`
  font-weight: 500;
  color: var(--text-primary);
  font-size: 14px;
`;

const Input = styled.input`
  padding: 12px;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

const Select = styled.select`
  padding: 12px;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  font-size: 14px;
  background: var(--secondary-color);
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

const AttendanceSection = styled(motion.div)`
  background: var(--secondary-color);
  border-radius: 15px;
  padding: 20px;
  box-shadow: var(--shadow-medium);
`;

const AttendanceHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid var(--primary-color);
`;

const AttendanceTitle = styled.div`
  h2 {
    color: var(--primary-color);
    margin: 0;
    font-size: 24px;
    font-weight: 600;
  }
  p {
    color: var(--text-secondary);
    margin: 5px 0 0 0;
    font-size: 14px;
  }
`;

const AttendanceStats = styled.div`
  display: flex;
  gap: 20px;
`;

const StatCard = styled.div`
  text-align: center;
  padding: 15px;
  border-radius: 10px;
  background: var(--background-light);
  
  .number {
    font-size: 24px;
    font-weight: 600;
    margin-bottom: 5px;
  }
  
  .label {
    font-size: 12px;
    color: var(--text-secondary);
  }
  
  &.present {
    background: #d4edda;
    color: #155724;
  }
  
  &.absent {
    background: #f8d7da;
    color: #721c24;
  }
  
  &.total {
    background: var(--primary-color);
    color: var(--secondary-color);
  }
`;

const TableContainer = styled.div`
  overflow-x: auto;
  border-radius: 10px;
  border: 1px solid var(--border-color);
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: var(--secondary-color);
`;

const Th = styled.th`
  background: var(--primary-color);
  color: var(--secondary-color);
  padding: 15px;
  text-align: left;
  font-weight: 600;
  cursor: pointer;
  user-select: none;
  
  &:hover {
    background: var(--accent-color);
  }
  
  &.sortable {
    display: flex;
    align-items: center;
    gap: 5px;
  }
`;

const Td = styled.td`
  padding: 15px;
  border-bottom: 1px solid var(--border-color);
  color: var(--text-primary);
`;

const Tr = styled(motion.tr)`
  &:hover {
    background: var(--background-light);
  }
`;

const StudentPhoto = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--primary-color);
`;

const AttendanceToggle = styled.div`
  display: flex;
  gap: 5px;
`;

const ToggleButton = styled.button`
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.3s ease;
  min-width: 60px;
  
  &.present {
    background: #28a745;
    color: var(--secondary-color);
    &:hover { background: #218838; }
    
    &.active {
      background: #155724;
      box-shadow: 0 0 0 2px #28a745;
    }
  }
  
  &.absent {
    background: #dc3545;
    color: var(--secondary-color);
    &:hover { background: #c82333; }
    
    &.active {
      background: #721c24;
      box-shadow: 0 0 0 2px #dc3545;
    }
  }
`;

const BulkActions = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  padding: 15px;
  background: var(--background-light);
  border-radius: 10px;
  border: 1px solid var(--border-color);
`;

const BulkActionButton = styled.button`
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  
  &.mark-all-present {
    background: #28a745;
    color: var(--secondary-color);
    &:hover { background: #218838; }
  }
  
  &.mark-all-absent {
    background: #dc3545;
    color: var(--secondary-color);
    &:hover { background: #c82333; }
  }
  
  &.clear-all {
    background: var(--text-secondary);
    color: var(--secondary-color);
    &:hover { background: #6c757d; }
  }
`;

const SaveButton = styled(motion.button)`
  padding: 12px 24px;
  background: var(--primary-color);
  color: var(--secondary-color);
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background 0.3s ease;
  
  &:hover {
    background: var(--accent-color);
  }
  
  &:disabled {
    background: var(--text-secondary);
    cursor: not-allowed;
  }
`;

const AttendanceManagement = () => {
  const { user, hasRole } = useAuth();
  const navigate = useNavigate();
  
  // State management
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  
  // Mock data for demonstration
  const mockStudents = [
    {
      id: 'FA2024001',
      name: 'Kwame Asante',
      photo: 'https://via.placeholder.com/40',
      class: 'Grade 1',
      gender: 'Male'
    },
    {
      id: 'FA2024002',
      name: 'Ama Osei',
      photo: 'https://via.placeholder.com/40',
      class: 'Grade 1',
      gender: 'Female'
    },
    {
      id: 'FA2024003',
      name: 'Kofi Mensah',
      photo: 'https://via.placeholder.com/40',
      class: 'Grade 1',
      gender: 'Male'
    },
    {
      id: 'FA2024004',
      name: 'Abena Addo',
      photo: 'https://via.placeholder.com/40',
      class: 'Grade 1',
      gender: 'Female'
    },
    {
      id: 'FA2024005',
      name: 'Yaw Boateng',
      photo: 'https://via.placeholder.com/40',
      class: 'Grade 1',
      gender: 'Male'
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setStudents(mockStudents);
      setLoading(false);
    }, 1000);
  }, []);

  // Calculate attendance statistics
  const attendanceStats = React.useMemo(() => {
    const total = students.length;
    const present = Object.values(attendance).filter(status => status === 'present').length;
    const absent = Object.values(attendance).filter(status => status === 'absent').length;
    const unmarked = total - present - absent;
    
    return { total, present, absent, unmarked };
  }, [students, attendance]);

  const handleAttendanceToggle = (studentId, status) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: prev[studentId] === status ? null : status
    }));
    setHasChanges(true);
  };

  const handleBulkAction = (action) => {
    const newAttendance = {};
    
    students.forEach(student => {
      if (action === 'mark-all-present') {
        newAttendance[student.id] = 'present';
      } else if (action === 'mark-all-absent') {
        newAttendance[student.id] = 'absent';
      } else if (action === 'clear-all') {
        newAttendance[student.id] = null;
      }
    });
    
    setAttendance(newAttendance);
    setHasChanges(true);
  };

  const handleSaveAttendance = async () => {
    setSaving(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Attendance saved:', {
        date: selectedDate,
        class: selectedClass,
        attendance
      });
      
      setHasChanges(false);
      alert('Attendance saved successfully!');
    } catch (error) {
      console.error('Failed to save attendance:', error);
      alert('Failed to save attendance. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    if (hasChanges) {
      if (window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
        navigate('/dashboard');
      }
    } else {
      navigate('/dashboard');
    }
  };

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

  if (loading) {
    return (
      <AttendanceContainer>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <div>Loading attendance data...</div>
        </div>
      </AttendanceContainer>
    );
  }

  return (
    <AttendanceContainer>
      <Header>
        <HeaderContent>
          <HeaderIcon>
            <FaClipboardCheck />
          </HeaderIcon>
          <HeaderText>
            <h1>Attendance Management</h1>
            <p>Track daily student attendance and manage records</p>
          </HeaderText>
        </HeaderContent>
        <ActionButtons>
          <Button
            className="secondary"
            onClick={handleBack}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaArrowLeft /> Back
          </Button>
          <Button
            className="secondary"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaDownload /> Export
          </Button>
        </ActionButtons>
      </Header>

      <MainContent>
        <FilterSection
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <FilterGrid>
            <InputGroup>
              <Label>Select Class</Label>
              <Select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
              >
                <option value="">All Classes</option>
                <option value="Creche">Creche</option>
                <option value="KG1">KG1</option>
                <option value="KG2">KG2</option>
                <option value="Grade 1">Grade 1</option>
                <option value="Grade 2">Grade 2</option>
                <option value="Grade 3">Grade 3</option>
                <option value="Grade 4">Grade 4</option>
                <option value="Grade 5">Grade 5</option>
                <option value="Grade 6">Grade 6</option>
                <option value="JHS 1">JHS 1</option>
                <option value="JHS 2">JHS 2</option>
                <option value="JHS 3">JHS 3</option>
              </Select>
            </InputGroup>
            
            <InputGroup>
              <Label>Select Date</Label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </InputGroup>
          </FilterGrid>
        </FilterSection>

        <AttendanceSection
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <AttendanceHeader>
            <AttendanceTitle>
              <h2>Daily Attendance</h2>
              <p>
                {selectedDate} • {selectedClass || 'All Classes'} • {students.length} Students
              </p>
            </AttendanceTitle>
            
            <AttendanceStats>
              <StatCard className="present">
                <div className="number">{attendanceStats.present}</div>
                <div className="label">Present</div>
              </StatCard>
              <StatCard className="absent">
                <div className="number">{attendanceStats.absent}</div>
                <div className="label">Absent</div>
              </StatCard>
              <StatCard className="total">
                <div className="number">{attendanceStats.total}</div>
                <div className="label">Total</div>
              </StatCard>
            </AttendanceStats>
          </AttendanceHeader>

          <BulkActions>
            <BulkActionButton
              className="mark-all-present"
              onClick={() => handleBulkAction('mark-all-present')}
            >
              <FaCheck /> Mark All Present
            </BulkActionButton>
            <BulkActionButton
              className="mark-all-absent"
              onClick={() => handleBulkAction('mark-all-absent')}
            >
              <FaTimes /> Mark All Absent
            </BulkActionButton>
            <BulkActionButton
              className="clear-all"
              onClick={() => handleBulkAction('clear-all')}
            >
              Clear All
            </BulkActionButton>
          </BulkActions>

          <TableContainer>
            <Table>
              <thead>
                <tr>
                  <Th>Student ID</Th>
                  <Th>Photo</Th>
                  <Th>Name</Th>
                  <Th>Class</Th>
                  <Th>Gender</Th>
                  <Th>Attendance Status</Th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {students.map((student, index) => (
                    <Tr
                      key={student.id}
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      transition={{ delay: index * 0.05 }}
                    >
                      <Td>
                        <strong>{student.id}</strong>
                      </Td>
                      <Td>
                        <StudentPhoto src={student.photo} alt={student.name} />
                      </Td>
                      <Td>
                        <strong>{student.name}</strong>
                      </Td>
                      <Td>{student.class}</Td>
                      <Td>{student.gender}</Td>
                      <Td>
                        <AttendanceToggle>
                          <ToggleButton
                            className={`present ${attendance[student.id] === 'present' ? 'active' : ''}`}
                            onClick={() => handleAttendanceToggle(student.id, 'present')}
                          >
                            <FaCheck /> Present
                          </ToggleButton>
                          <ToggleButton
                            className={`absent ${attendance[student.id] === 'absent' ? 'active' : ''}`}
                            onClick={() => handleAttendanceToggle(student.id, 'absent')}
                          >
                            <FaTimes /> Absent
                          </ToggleButton>
                        </AttendanceToggle>
                      </Td>
                    </Tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </Table>
          </TableContainer>

          <div style={{ 
            display: 'flex', 
            justifyContent: 'flex-end', 
            marginTop: '20px',
            paddingTop: '20px',
            borderTop: '1px solid var(--border-color)'
          }}>
            <SaveButton
              onClick={handleSaveAttendance}
              disabled={saving || !hasChanges}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {saving ? (
                <>
                  <div className="spinner"></div>
                  Saving...
                </>
              ) : (
                <>
                  <FaSave />
                  Save Attendance
                </>
              )}
            </SaveButton>
          </div>
        </AttendanceSection>
      </MainContent>
    </AttendanceContainer>
  );
};

export default AttendanceManagement;




