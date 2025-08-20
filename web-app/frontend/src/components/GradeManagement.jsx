import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styled from 'styled-components';
import {
  FaChartLine,
  FaEdit,
  FaSave,
  FaTimes,
  FaCheck,
  FaPlus,
  FaSearch,
  FaFilter,
  FaGraduationCap,
  FaUserGraduate,
  FaBookOpen
} from 'react-icons/fa';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Container = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 8px 24px rgba(114, 47, 55, 0.15);
  position: relative;
  z-index: 1;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e9ecef;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
`;

const Title = styled.h2`
  color: #722F37;
  font-size: 1.8rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
`;

const Controls = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const SearchContainer = styled.div`
  position: relative;
  min-width: 250px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem 0.75rem 0.75rem 2.5rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s ease;

  &:focus {
    outline: none;
    border-color: #722F37;
  }

  &::placeholder {
    color: #adb5bd;
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
`;

const FilterSelect = styled.select`
  padding: 0.75rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 1rem;
  background: white;
  cursor: pointer;
  transition: border-color 0.3s ease;

  &:focus {
    outline: none;
    border-color: #722F37;
  }
`;

const AddGradeButton = styled(motion.button)`
  background: linear-gradient(135deg, #722F37, #8B3D47);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: linear-gradient(135deg, #8B3D47, #722F37);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(114, 47, 55, 0.3);
  }
`;

const GradesTable = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin-bottom: 2rem;
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 120px 120px 120px 80px;
  gap: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  font-weight: 600;
  color: #722F37;
  border-bottom: 2px solid #e9ecef;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr 1fr 100px 100px 60px;
    
    .hide-mobile {
      display: none;
    }
  }
`;

const TableRow = styled(motion.div)`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 120px 120px 120px 80px;
  gap: 1rem;
  padding: 1rem;
  border-bottom: 1px solid #e9ecef;
  align-items: center;
  transition: background-color 0.3s ease;

  &:hover {
    background: #f8f9fa;
  }

  &:last-child {
    border-bottom: none;
  }
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr 1fr 100px 100px 60px;
    
    .hide-mobile {
      display: none;
    }
  }
`;

const StudentInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;

  .avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: linear-gradient(135deg, #722F37, #8B3D47);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 0.8rem;
    font-weight: 600;
  }

  .info {
    .name {
      font-weight: 600;
      color: #333;
      font-size: 0.9rem;
    }
    
    .id {
      color: #6c757d;
      font-size: 0.8rem;
    }
  }
`;

const SubjectTag = styled.span`
  background: rgba(114, 47, 55, 0.1);
  color: #722F37;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
`;

const GradeInput = styled.input`
  width: 60px;
  padding: 0.5rem;
  border: 2px solid #e9ecef;
  border-radius: 6px;
  text-align: center;
  font-weight: 600;
  transition: border-color 0.3s ease;

  &:focus {
    outline: none;
    border-color: #722F37;
  }

  &.editing {
    border-color: #ffc107;
    background: #fff3cd;
  }
`;

const GradeDisplay = styled.span`
  font-weight: 600;
  color: ${props => {
    const percentage = (props.score / props.maxScore) * 100;
    if (percentage >= 80) return '#28a745';
    if (percentage >= 60) return '#ffc107';
    if (percentage >= 40) return '#fd7e14';
    return '#dc3545';
  }};
`;

const ActionButton = styled(motion.button)`
  background: ${props => 
    props.variant === 'save' ? '#28a745' : 
    props.variant === 'cancel' ? '#6c757d' : 
    '#722F37'};
  color: white;
  border: none;
  padding: 0.5rem;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  transition: all 0.3s ease;

  &:hover {
    opacity: 0.8;
    transform: scale(1.1);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const LoadingSpinner = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 1rem;
  color: #6c757d;

  svg {
    font-size: 3rem;
    margin-bottom: 1rem;
    color: #dee2e6;
  }

  h3 {
    margin: 0 0 0.5rem 0;
    color: #495057;
  }

  p {
    margin: 0;
  }
`;

const Stats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-left: 4px solid ${props => props.color || '#722F37'};

  .value {
    font-size: 2rem;
    font-weight: 700;
    color: ${props => props.color || '#722F37'};
    margin-bottom: 0.5rem;
  }

  .label {
    color: #6c757d;
    font-size: 0.9rem;
    font-weight: 500;
  }
`;

const GradeManagement = () => {
  const { isAuthenticated, token, user, loading: authLoading } = useAuth();
  const [grades, setGrades] = useState([]);
  const [filteredGrades, setFilteredGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingGrades, setEditingGrades] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Wait for auth to be ready and ensure a teacher is logged in
    if (authLoading || !isAuthenticated || !token || (user && user.role !== 'teacher')) {
      return;
    }
    fetchData();
  }, [authLoading, isAuthenticated, token, user?.role]);

  useEffect(() => {
    filterGrades();
  }, [grades, searchTerm, selectedClass, selectedSubject]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const authHeader = { headers: { Authorization: `Bearer ${token}` } };
      
      // Fetch teacher's assigned subjects first
      const subjectsResponse = await axios.get(`/api/subjects/assignments/teacher/${user.id}`, authHeader);
      const assignedSubjects = subjectsResponse.data.data || [];
      
      // Get the subject IDs that the teacher is assigned to
      const assignedSubjectIds = assignedSubjects.map(subj => subj.subject_id);
      
      // Fetch grades only for assigned subjects
      const gradesResponse = await axios.get('/api/grades/my-students', authHeader);
      let filteredGrades = gradesResponse.data.data || [];
      
      // Filter grades to only include subjects the teacher is assigned to
      if (assignedSubjectIds.length > 0) {
        filteredGrades = filteredGrades.filter(grade => 
          assignedSubjectIds.includes(grade.subject_id)
        );
      } else {
        // If no subjects assigned, show empty state
        filteredGrades = [];
      }
      
      setGrades(filteredGrades);
      
      // Fetch classes
      const classesResponse = await axios.get('/api/users/my-classes', authHeader);
      setClasses(classesResponse.data.data || []);

      // Extract unique subjects from filtered grades
      const uniqueSubjects = [...new Set(
        filteredGrades
          .filter(grade => grade.subject_name)
          .map(grade => grade.subject_name)
      )];
      setSubjects(uniqueSubjects);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch grades data');
    } finally {
      setLoading(false);
    }
  };

  const filterGrades = () => {
    let filtered = grades;

    if (searchTerm) {
      filtered = filtered.filter(grade =>
        grade.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        grade.admission_number?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedClass) {
      filtered = filtered.filter(grade => grade.class_name === selectedClass);
    }

    if (selectedSubject) {
      filtered = filtered.filter(grade => grade.subject_name === selectedSubject);
    }

    setFilteredGrades(filtered);
  };

  const handleEditGrade = (gradeId, field, value) => {
    setEditingGrades(prev => ({
      ...prev,
      [gradeId]: {
        ...prev[gradeId],
        [field]: value
      }
    }));
  };

  const handleSaveGrade = async (grade) => {
    const editedGrade = editingGrades[grade.grade_id];
    if (!editedGrade) return;

    try {
      setSubmitting(true);
      
      // Verify that the teacher is assigned to this subject
      const subjectsResponse = await axios.get(`/api/subjects/assignments/teacher/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const assignedSubjectIds = subjectsResponse.data.data.map(subj => subj.subject_id);
      
      if (!assignedSubjectIds.includes(grade.subject_id)) {
        toast.error('You are not authorized to update grades for this subject');
        return;
      }
      
      const updateData = {
        student_id: grade.student_id,
        subject_id: grade.subject_id,
        term: grade.term || 'Term 1',
        academic_year: grade.academic_year || '2024',
        assessment_type: grade.assessment_type || 'Continuous Assessment',
        score: parseFloat(editedGrade.score || grade.score),
        max_score: parseFloat(editedGrade.max_score || grade.max_score),
        remarks: editedGrade.remarks || grade.remarks
      };

      if (grade.grade_id) {
        await axios.put(`/api/grades/${grade.grade_id}`, updateData);
      } else {
        await axios.post('/api/grades', updateData);
      }

      toast.success('Grade updated successfully');
      
      // Remove from editing state
      setEditingGrades(prev => {
        const newState = { ...prev };
        delete newState[grade.grade_id];
        return newState;
      });

      // Refresh data
      fetchData();
    } catch (error) {
      console.error('Error saving grade:', error);
      toast.error('Failed to save grade');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelEdit = (gradeId) => {
    setEditingGrades(prev => {
      const newState = { ...prev };
      delete newState[gradeId];
      return newState;
    });
  };

  const getInitials = (name) => {
    return name
      ?.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || '?';
  };

  const calculateStats = () => {
    const totalGrades = filteredGrades.filter(g => g.score !== null).length;
    const averageScore = totalGrades > 0 
      ? filteredGrades
          .filter(g => g.score !== null)
          .reduce((sum, g) => sum + (g.score / g.max_score * 100), 0) / totalGrades
      : 0;
    
    const uniqueStudents = new Set(filteredGrades.map(g => g.student_id)).size;
    const uniqueSubjects = new Set(filteredGrades.map(g => g.subject_name)).size;

    return {
      totalGrades,
      averageScore: averageScore.toFixed(1),
      totalStudents: uniqueStudents,
      totalSubjects: uniqueSubjects
    };
  };

  const stats = calculateStats();

  if (loading) {
    return (
      <Container>
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <LoadingSpinner />
          <p style={{ marginTop: '1rem', color: '#6c757d' }}>Loading grades...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>
          <FaChartLine />
          Grade Management
        </Title>
        <Controls>
          <SearchContainer>
            <SearchIcon>
              <FaSearch />
            </SearchIcon>
            <SearchInput
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchContainer>
          
          <FilterSelect
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
          >
            <option value="">All Classes</option>
            {classes.map(cls => (
              <option key={cls.id} value={cls.name}>{cls.name}</option>
            ))}
          </FilterSelect>

          <FilterSelect
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
          >
            <option value="">All Subjects</option>
            {subjects.map(subject => (
              <option key={subject} value={subject}>{subject}</option>
            ))}
          </FilterSelect>
        </Controls>
      </Header>

      <Stats>
        <StatCard color="#722F37">
          <div className="value">{stats.totalGrades}</div>
          <div className="label">Total Grades</div>
        </StatCard>
        <StatCard color="#28a745">
          <div className="value">{stats.averageScore}%</div>
          <div className="label">Class Average</div>
        </StatCard>
        <StatCard color="#17a2b8">
          <div className="value">{stats.totalStudents}</div>
          <div className="label">Students</div>
        </StatCard>
        <StatCard color="#6f42c1">
          <div className="value">{stats.totalSubjects}</div>
          <div className="label">Subjects</div>
        </StatCard>
      </Stats>

      {filteredGrades.length === 0 ? (
        <EmptyState>
          <FaGraduationCap />
          <h3>No Grades Found</h3>
          <p>No grades match your current filters. Try adjusting your search criteria.</p>
        </EmptyState>
      ) : (
        <GradesTable>
          <TableHeader>
            <div>Student</div>
            <div>Subject</div>
            <div className="hide-mobile">Class</div>
            <div>Score</div>
            <div>Max Score</div>
            <div className="hide-mobile">Percentage</div>
            <div>Actions</div>
          </TableHeader>

          {filteredGrades.map((grade, index) => {
            const isEditing = editingGrades[grade.grade_id];
            const currentScore = isEditing?.score !== undefined ? isEditing.score : grade.score;
            const currentMaxScore = isEditing?.max_score !== undefined ? isEditing.max_score : grade.max_score;
            const percentage = currentMaxScore > 0 ? (currentScore / currentMaxScore * 100).toFixed(1) : 0;

            return (
              <TableRow
                key={`${grade.student_id}-${grade.subject_id}-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <StudentInfo>
                  <div className="avatar">
                    {getInitials(grade.student_name)}
                  </div>
                  <div className="info">
                    <div className="name">{grade.student_name}</div>
                    <div className="id">{grade.admission_number}</div>
                  </div>
                </StudentInfo>

                <div>
                  {grade.subject_name ? (
                    <SubjectTag>{grade.subject_name}</SubjectTag>
                  ) : (
                    <span style={{ color: '#6c757d' }}>No subject</span>
                  )}
                </div>

                <div className="hide-mobile">{grade.class_name}</div>

                <div>
                  {isEditing ? (
                    <GradeInput
                      type="number"
                      min="0"
                      step="0.1"
                      value={currentScore || ''}
                      onChange={(e) => handleEditGrade(grade.grade_id, 'score', e.target.value)}
                      className="editing"
                    />
                  ) : (
                    <span>{grade.score !== null ? grade.score : '-'}</span>
                  )}
                </div>

                <div>
                  {isEditing ? (
                    <GradeInput
                      type="number"
                      min="1"
                      step="0.1"
                      value={currentMaxScore || ''}
                      onChange={(e) => handleEditGrade(grade.grade_id, 'max_score', e.target.value)}
                      className="editing"
                    />
                  ) : (
                    <span>{grade.max_score || '-'}</span>
                  )}
                </div>

                <div className="hide-mobile">
                  {grade.score !== null && grade.max_score ? (
                    <GradeDisplay score={currentScore} maxScore={currentMaxScore}>
                      {percentage}%
                    </GradeDisplay>
                  ) : (
                    '-'
                  )}
                </div>

                <div>
                  {isEditing ? (
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                      <ActionButton
                        variant="save"
                        onClick={() => handleSaveGrade(grade)}
                        disabled={submitting}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        {submitting ? <LoadingSpinner /> : <FaCheck />}
                      </ActionButton>
                      <ActionButton
                        variant="cancel"
                        onClick={() => handleCancelEdit(grade.grade_id)}
                        disabled={submitting}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <FaTimes />
                      </ActionButton>
                    </div>
                  ) : (
                    <ActionButton
                      onClick={() => setEditingGrades(prev => ({
                        ...prev,
                        [grade.grade_id]: {
                          score: grade.score,
                          max_score: grade.max_score,
                          remarks: grade.remarks
                        }
                      }))}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <FaEdit />
                    </ActionButton>
                  )}
                </div>
              </TableRow>
            );
          })}
        </GradesTable>
      )}
    </Container>
  );
};

export default GradeManagement;
