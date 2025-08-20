import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FaPlus, FaEdit, FaTrash, FaBook, FaChalkboardTeacher, 
  FaUsers, FaCheck, FaTimes, FaSearch, FaFilter
} from 'react-icons/fa';
import styled from 'styled-components';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const Container = styled.div`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  
  h1 {
    color: var(--primary-color);
    margin: 0;
    font-size: 28px;
    font-weight: 600;
  }
`;

const AddButton = styled(motion.button)`
  background: var(--primary-color);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  
  &:hover {
    background: var(--accent-color);
    transform: translateY(-2px);
  }
`;

const TabsContainer = styled.div`
  display: flex;
  border-bottom: 2px solid var(--borderColor);
  margin-bottom: 30px;
`;

const Tab = styled.button`
  background: none;
  border: none;
  padding: 15px 30px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  color: var(--textSecondary);
  border-bottom: 3px solid transparent;
  transition: all 0.3s ease;
  
  &.active {
    color: var(--primary-color);
    border-bottom-color: var(--primary-color);
  }
  
  &:hover {
    color: var(--primary-color);
  }
`;

const SearchBar = styled.div`
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  align-items: center;
  
  .search-input {
    flex: 1;
    padding: 12px 16px;
    border: 1px solid var(--borderColor);
    border-radius: 8px;
    font-size: 14px;
    
    &:focus {
      outline: none;
      border-color: var(--primary-color);
      box-shadow: 0 0 0 3px rgba(114, 47, 55, 0.1);
    }
  }
  
  .filter-select {
    padding: 12px 16px;
    border: 1px solid var(--borderColor);
    border-radius: 8px;
    font-size: 14px;
    background: white;
    
    &:focus {
      outline: none;
      border-color: var(--primary-color);
    }
  }
`;

const Card = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: var(--shadow-medium);
  margin-bottom: 20px;
`;

const SubjectGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const SubjectCard = styled(motion.div)`
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: var(--shadow-medium);
  border: 1px solid var(--borderColor);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-large);
  }
`;

const SubjectHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
`;

const SubjectInfo = styled.div`
  h3 {
    color: var(--primary-color);
    margin: 0 0 5px 0;
    font-size: 18px;
    font-weight: 600;
  }
  
  .code {
    color: var(--textSecondary);
    font-size: 14px;
    font-weight: 500;
  }
`;

const SubjectActions = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: var(--textSecondary);
  
  &:hover {
    background: var(--backgroundLight);
    color: var(--primary-color);
  }
  
  &.edit:hover {
    color: var(--info);
  }
  
  &.delete:hover {
    color: var(--danger);
  }
`;

const SubjectDescription = styled.p`
  color: var(--textSecondary);
  font-size: 14px;
  margin: 0 0 15px 0;
  line-height: 1.5;
`;

const SubjectMeta = styled.div`
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
  
  .meta-item {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 12px;
    color: var(--textSecondary);
    
    .status {
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 500;
      
      &.core {
        background: #e3f2fd;
        color: #1976d2;
      }
      
      &.active {
        background: #e8f5e8;
        color: #2e7d32;
      }
    }
  }
`;

const AssignmentsList = styled.div`
  margin-top: 15px;
  
  h4 {
    color: var(--primary-color);
    font-size: 14px;
    margin: 0 0 10px 0;
    font-weight: 600;
  }
  
  .assignment-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    background: var(--backgroundLight);
    border-radius: 6px;
    margin-bottom: 8px;
    font-size: 13px;
    
    .teacher-info {
      color: var(--textPrimary);
      font-weight: 500;
    }
    
    .class-info {
      color: var(--textSecondary);
      font-size: 12px;
    }
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  padding: 30px;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  
  h2 {
    color: var(--primary-color);
    margin: 0;
    font-size: 24px;
    font-weight: 600;
  }
  
  .close-btn {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: var(--textSecondary);
    
    &:hover {
      color: var(--danger);
    }
  }
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
  
  label {
    display: block;
    margin-bottom: 8px;
    color: var(--textPrimary);
    font-weight: 500;
  }
  
  input, textarea, select {
    width: 100%;
    padding: 12px 16px;
    border: 1px solid var(--borderColor);
    border-radius: 8px;
    font-size: 14px;
    
    &:focus {
      outline: none;
      border-color: var(--primary-color);
      box-shadow: 0 0 0 3px rgba(114, 47, 55, 0.1);
    }
  }
  
  textarea {
    resize: vertical;
    min-height: 80px;
  }
  
  .checkbox-group {
    display: flex;
    align-items: center;
    gap: 8px;
    
    input[type="checkbox"] {
      width: auto;
    }
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 15px;
  justify-content: flex-end;
  margin-top: 30px;
`;

const Button = styled.button`
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &.primary {
    background: var(--primary-color);
    color: white;
    border: none;
    
    &:hover {
      background: var(--accent-color);
    }
  }
  
  &.secondary {
    background: white;
    color: var(--textSecondary);
    border: 1px solid var(--borderColor);
    
    &:hover {
      background: var(--backgroundLight);
    }
  }
  
  &.danger {
    background: var(--danger);
    color: white;
    border: none;
    
    &:hover {
      background: #c82333;
    }
  }
`;

const SubjectManagement = () => {
  const { token, isAuthenticated, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('subjects');
  const [subjects, setSubjects] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCore, setFilterCore] = useState('all');
  
  // Modal states
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [editingAssignment, setEditingAssignment] = useState(null);
  
  // Form states
  const [subjectForm, setSubjectForm] = useState({
    name: '',
    code: '',
    description: '',
    is_core: false
  });
  
  const [assignmentForm, setAssignmentForm] = useState({
    teacher_id: '',
    subject_id: '',
    class_id: ''
  });

  useEffect(() => {
    if (authLoading || !isAuthenticated || !token) {
      return;
    }
    fetchData();
  }, [authLoading, isAuthenticated, token]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Add timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      const authHeader = { headers: { Authorization: `Bearer ${token}` } };
      const [subjectsRes, assignmentsRes, teachersRes, classesRes] = await Promise.allSettled([
        axios.get('/api/subjects', { ...authHeader, signal: controller.signal }),
        axios.get('/api/subjects/assignments/all', { ...authHeader, signal: controller.signal }),
        axios.get('/api/users/teachers', { ...authHeader, signal: controller.signal }),
        axios.get('/api/classes', { ...authHeader, signal: controller.signal })
      ]);
      
      clearTimeout(timeoutId);
      
      // Handle each response individually
      if (subjectsRes.status === 'fulfilled') {
        const subjectsData = subjectsRes.value.data?.data || [];
        console.log('Subjects loaded:', subjectsData);
        setSubjects(subjectsData);
      } else {
        console.error('Error fetching subjects:', subjectsRes.reason);
        setSubjects([]);
      }
      
      if (assignmentsRes.status === 'fulfilled') {
        const assignmentsData = assignmentsRes.value.data?.data || [];
        console.log('Assignments loaded:', assignmentsData);
        setAssignments(assignmentsData);
      } else {
        console.error('Error fetching assignments:', assignmentsRes.reason);
        setAssignments([]);
      }
      
      if (teachersRes.status === 'fulfilled') {
        setTeachers(teachersRes.value.data?.data || []);
      } else {
        console.error('Error fetching teachers:', teachersRes.reason);
        setTeachers([]);
      }
      
      if (classesRes.status === 'fulfilled') {
        setClasses(classesRes.value.data?.data || []);
      } else {
        console.error('Error fetching classes:', classesRes.reason);
        setClasses([]);
      }
      
    } catch (error) {
      console.error('Error fetching data:', error);
      if (error.name === 'AbortError') {
        toast.error('Request timed out. Please try again.');
      } else {
        toast.error('Error fetching data');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubjectSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Add timeout for the request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      const authHeader = { headers: { Authorization: `Bearer ${token}` } };
      if (editingSubject) {
        await axios.put(`/api/subjects/${editingSubject.id}`, subjectForm, { ...authHeader, signal: controller.signal });
        toast.success('Subject updated successfully');
      } else {
        await axios.post('/api/subjects', subjectForm, { ...authHeader, signal: controller.signal });
        toast.success('Subject created successfully');
      }
      
      clearTimeout(timeoutId);
      setShowSubjectModal(false);
      setEditingSubject(null);
      setSubjectForm({ name: '', code: '', description: '', is_core: false });
      fetchData();
    } catch (error) {
      console.error('Error saving subject:', error);
      if (error.name === 'AbortError') {
        toast.error('Request timed out. Please try again.');
      } else {
        toast.error(error.response?.data?.message || 'Error saving subject');
      }
    }
  };

  const handleAssignmentSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const authHeader = { headers: { Authorization: `Bearer ${token}` } };
      await axios.post('/api/subjects/assign', assignmentForm, authHeader);
      toast.success('Subject assigned successfully');
      
      setShowAssignmentModal(false);
      setAssignmentForm({ teacher_id: '', subject_id: '', class_id: '' });
      fetchData();
    } catch (error) {
      console.error('Error assigning subject:', error);
      toast.error(error.response?.data?.message || 'Error assigning subject');
    }
  };

  const handleEditSubject = (subject) => {
    setEditingSubject(subject);
    setSubjectForm({
      name: subject.name,
      code: subject.code,
      description: subject.description || '',
      is_core: subject.is_core
    });
    setShowSubjectModal(true);
  };

  const handleDeleteSubject = async (subjectId) => {
    if (!window.confirm('Are you sure you want to delete this subject?')) return;
    
    try {
      const authHeader = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(`/api/subjects/${subjectId}`, authHeader);
      toast.success('Subject deleted successfully');
      fetchData();
    } catch (error) {
      console.error('Error deleting subject:', error);
      toast.error(error.response?.data?.message || 'Error deleting subject');
    }
  };

  const handleRemoveAssignment = async (assignmentId) => {
    if (!window.confirm('Are you sure you want to remove this assignment?')) return;
    
    try {
      const authHeader = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(`/api/subjects/assign/${assignmentId}`, authHeader);
      toast.success('Assignment removed successfully');
      fetchData();
    } catch (error) {
      console.error('Error removing assignment:', error);
      toast.error('Error removing assignment');
    }
  };

  const filteredSubjects = subjects.filter(subject => {
    const matchesSearch = subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         subject.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterCore === 'all' || 
                         (filterCore === 'core' && subject.is_core) ||
                         (filterCore === 'elective' && !subject.is_core);
    
    return matchesSearch && matchesFilter;
  });

  const getSubjectAssignments = (subjectId) => {
    return assignments.filter(assignment => 
      assignment.subject_id === subjectId
    );
  };

  const resetSubjectForm = () => {
    setSubjectForm({ name: '', code: '', description: '', is_core: false });
    setEditingSubject(null);
  };

  const resetAssignmentForm = () => {
    setAssignmentForm({ teacher_id: '', subject_id: '', class_id: '' });
    setEditingAssignment(null);
  };

  return (
    <Container>
      <Header>
        <h1>Subject Management</h1>
        <AddButton
          onClick={() => setShowSubjectModal(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FaPlus /> Add Subject
        </AddButton>
      </Header>

      <TabsContainer>
        <Tab 
          className={activeTab === 'subjects' ? 'active' : ''}
          onClick={() => setActiveTab('subjects')}
        >
          <FaBook /> Subjects
        </Tab>
        <Tab 
          className={activeTab === 'assignments' ? 'active' : ''}
          onClick={() => setActiveTab('assignments')}
        >
          <FaChalkboardTeacher /> Teacher Assignments
        </Tab>
      </TabsContainer>

      {activeTab === 'subjects' && (
        <>
          <SearchBar>
            <input
              type="text"
              placeholder="Search subjects..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              className="filter-select"
              value={filterCore}
              onChange={(e) => setFilterCore(e.target.value)}
            >
              <option value="all">All Subjects</option>
              <option value="core">Core Subjects</option>
              <option value="elective">Elective Subjects</option>
            </select>
          </SearchBar>

          {loading ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '40px', 
              color: 'var(--textSecondary)' 
            }}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                border: '4px solid var(--borderColor)',
                borderTop: '4px solid var(--primary-color)',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 20px'
              }}></div>
              Loading subjects...
            </div>
          ) : filteredSubjects.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '40px', 
              color: 'var(--textSecondary)' 
            }}>
              {searchTerm || filterCore !== 'all' ? 'No subjects match your search criteria.' : 'No subjects found. Create your first subject!'}
            </div>
          ) : (
            <SubjectGrid>
              {filteredSubjects.map(subject => (
              <SubjectCard
                key={subject.id}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
              >
                <SubjectHeader>
                  <SubjectInfo>
                    <h3>{subject.name}</h3>
                    <div className="code">{subject.code}</div>
                  </SubjectInfo>
                  <SubjectActions>
                    <ActionButton
                      className="edit"
                      onClick={() => handleEditSubject(subject)}
                      title="Edit Subject"
                    >
                      <FaEdit />
                    </ActionButton>
                    <ActionButton
                      className="delete"
                      onClick={() => handleDeleteSubject(subject.id)}
                      title="Delete Subject"
                    >
                      <FaTrash />
                    </ActionButton>
                  </SubjectActions>
                </SubjectHeader>

                {subject.description && (
                  <SubjectDescription>{subject.description}</SubjectDescription>
                )}

                <SubjectMeta>
                  <div className="meta-item">
                    <span className={`status ${subject.is_core ? 'core' : 'elective'}`}>
                      {subject.is_core ? 'Core' : 'Elective'}
                    </span>
                  </div>
                  <div className="meta-item">
                    <span className={`status ${subject.is_active ? 'active' : 'inactive'}`}>
                      {subject.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </SubjectMeta>

                <AssignmentsList>
                  <h4>Teacher Assignments</h4>
                  {getSubjectAssignments(subject.id).length > 0 ? (
                    getSubjectAssignments(subject.id).map(assignment => (
                      <div key={assignment.id} className="assignment-item">
                        <div>
                          <div className="teacher-info">
                            {assignment.teacher_name}
                          </div>
                          <div className="class-info">
                            {assignment.class_name} (Level {assignment.class_level})
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ color: 'var(--textSecondary)', fontStyle: 'italic' }}>
                      No teachers assigned
                    </div>
                  )}
                </AssignmentsList>
              </SubjectCard>
            ))}
            </SubjectGrid>
          )}
        </>
      )}

      {activeTab === 'assignments' && (
        <>
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3>Teacher-Subject Assignments</h3>
              <AddButton
                onClick={() => setShowAssignmentModal(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaPlus /> Assign Subject
              </AddButton>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--borderColor)' }}>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Teacher</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Subject</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Class</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {assignments.map(assignment => (
                    <tr key={assignment.id} style={{ borderBottom: '1px solid var(--borderColor)' }}>
                      <td style={{ padding: '12px' }}>
                        {assignment.teacher_name}
                        <br />
                        <small style={{ color: 'var(--textSecondary)' }}>@{assignment.teacher_username}</small>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <strong>{assignment.subject_name}</strong>
                        <br />
                        <small style={{ color: 'var(--textSecondary)' }}>{assignment.subject_code}</small>
                      </td>
                      <td style={{ padding: '12px' }}>
                        {assignment.class_name}
                        <br />
                        <small style={{ color: 'var(--textSecondary)' }}>Level {assignment.class_level}</small>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span className="status active">
                          Active
                        </span>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <ActionButton
                          className="delete"
                          onClick={() => handleRemoveAssignment(assignment.id)}
                          title="Remove Assignment"
                        >
                          <FaTimes />
                        </ActionButton>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}

      {/* Subject Modal */}
      {showSubjectModal && (
        <Modal onClick={() => setShowSubjectModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <h2>{editingSubject ? 'Edit Subject' : 'Add New Subject'}</h2>
              <button 
                className="close-btn"
                onClick={() => {
                  setShowSubjectModal(false);
                  resetSubjectForm();
                }}
              >
                ×
              </button>
            </ModalHeader>

            <form onSubmit={handleSubjectSubmit}>
              <FormGroup>
                <label>Subject Name *</label>
                <input
                  type="text"
                  value={subjectForm.name}
                  onChange={(e) => setSubjectForm({...subjectForm, name: e.target.value})}
                  required
                />
              </FormGroup>

              <FormGroup>
                <label>Subject Code *</label>
                <input
                  type="text"
                  value={subjectForm.code}
                  onChange={(e) => setSubjectForm({...subjectForm, code: e.target.value})}
                  required
                />
              </FormGroup>

              <FormGroup>
                <label>Description</label>
                <textarea
                  value={subjectForm.description}
                  onChange={(e) => setSubjectForm({...subjectForm, description: e.target.value})}
                  placeholder="Optional description of the subject"
                />
              </FormGroup>

              <FormGroup>
                <div className="checkbox-group">
                  <input
                    type="checkbox"
                    id="is_core"
                    checked={subjectForm.is_core}
                    onChange={(e) => setSubjectForm({...subjectForm, is_core: e.target.checked})}
                  />
                  <label htmlFor="is_core">Core Subject</label>
                </div>
              </FormGroup>

              <ButtonGroup>
                <Button
                  type="button"
                  className="secondary"
                  onClick={() => {
                    setShowSubjectModal(false);
                    resetSubjectForm();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" className="primary">
                  {editingSubject ? 'Update Subject' : 'Create Subject'}
                </Button>
              </ButtonGroup>
            </form>
          </ModalContent>
        </Modal>
      )}

      {/* Assignment Modal */}
      {showAssignmentModal && (
        <Modal onClick={() => setShowAssignmentModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <h2>Assign Subject to Teacher</h2>
              <button 
                className="close-btn"
                onClick={() => {
                  setShowAssignmentModal(false);
                  resetAssignmentForm();
                }}
              >
                ×
              </button>
            </ModalHeader>

            <form onSubmit={handleAssignmentSubmit}>
              <FormGroup>
                <label>Teacher *</label>
                <select
                  value={assignmentForm.teacher_id}
                  onChange={(e) => setAssignmentForm({...assignmentForm, teacher_id: e.target.value})}
                  required
                >
                  <option value="">Select a teacher</option>
                  {teachers.map(teacher => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.first_name} {teacher.last_name} ({teacher.email})
                    </option>
                  ))}
                </select>
              </FormGroup>

              <FormGroup>
                <label>Subject *</label>
                <select
                  value={assignmentForm.subject_id}
                  onChange={(e) => setAssignmentForm({...assignmentForm, subject_id: e.target.value})}
                  required
                >
                  <option value="">Select a subject</option>
                  {subjects.map(subject => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name} ({subject.code})
                    </option>
                  ))}
                </select>
              </FormGroup>

              <FormGroup>
                <label>Class *</label>
                <select
                  value={assignmentForm.class_id}
                  onChange={(e) => setAssignmentForm({...assignmentForm, class_id: e.target.value})}
                  required
                >
                  <option value="">Select a class</option>
                  {classes.map(cls => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name} (Grade {cls.grade_level})
                    </option>
                  ))}
                </select>
              </FormGroup>

              <ButtonGroup>
                <Button
                  type="button"
                  className="secondary"
                  onClick={() => {
                    setShowAssignmentModal(false);
                    resetAssignmentForm();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" className="primary">
                  Assign Subject
                </Button>
              </ButtonGroup>
            </form>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};

export default SubjectManagement;
