import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styled from 'styled-components';
import {
  FaUserPlus,
  FaEdit,
  FaTrash,
  FaKey,
  FaEye,
  FaEyeSlash,
  FaTimes,
  FaCheck,
  FaUsers,
  FaGraduationCap,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaChalkboard,
  FaPlus,
  FaMinus
} from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';

const Container = styled.div`
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 8px 24px rgba(114, 47, 55, 0.15);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e9ecef;
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

const AddButton = styled(motion.button)`
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

const TeachersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const TeacherCard = styled(motion.div)`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid #e9ecef;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(114, 47, 55, 0.15);
  }
`;

const TeacherHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const TeacherAvatar = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #722F37, #8B3D47);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.2rem;
  font-weight: 600;
`;

const TeacherInfo = styled.div`
  flex: 1;

  h3 {
    margin: 0 0 0.25rem 0;
    color: #722F37;
    font-size: 1.1rem;
    font-weight: 600;
  }

  p {
    margin: 0;
    color: #6c757d;
    font-size: 0.9rem;
  }
`;

const TeacherDetails = styled.div`
  display: grid;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const DetailItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6c757d;
  font-size: 0.9rem;

  svg {
    width: 14px;
    height: 14px;
    color: #722F37;
  }
`;

const AssignedClasses = styled.div`
  margin-bottom: 1rem;
`;

const ClassesList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
`;

const ClassChip = styled.span`
  background: rgba(114, 47, 55, 0.1);
  color: #722F37;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const NoClassesText = styled.p`
  color: #6c757d;
  font-size: 0.9rem;
  font-style: italic;
  margin: 0;
`;

const TeacherActions = styled.div`
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
`;

const ActionButton = styled(motion.button)`
  background: ${props => 
    props.variant === 'danger' ? '#dc3545' : 
    props.variant === 'warning' ? '#ffc107' : 
    props.variant === 'success' ? '#28a745' :
    '#722F37'};
  color: ${props => props.variant === 'warning' ? '#000' : 'white'};
  border: none;
  padding: 0.5rem;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  transition: all 0.3s ease;

  &:hover {
    opacity: 0.8;
    transform: scale(1.1);
  }
`;

const Modal = styled(motion.div)`
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
  padding: 1rem;
`;

const ModalContent = styled(motion.div)`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  width: 100%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
  position: relative;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e9ecef;

  h3 {
    margin: 0;
    color: #722F37;
    font-size: 1.4rem;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #6c757d;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: #f8f9fa;
    color: #722F37;
  }
`;

const Form = styled.form`
  display: grid;
  gap: 1rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 600;
  color: #333;
  font-size: 0.9rem;
`;

const Input = styled.input`
  padding: 0.75rem;
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

const TextArea = styled.textarea`
  padding: 0.75rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 1rem;
  resize: vertical;
  min-height: 80px;
  transition: border-color 0.3s ease;

  &:focus {
    outline: none;
    border-color: #722F37;
  }

  &::placeholder {
    color: #adb5bd;
  }
`;

const Select = styled.select`
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

const CheckboxContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 0.5rem;
  max-height: 200px;
  overflow-y: auto;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  padding: 1rem;
`;

const CheckboxItem = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  
  input[type="checkbox"] {
    width: 18px;
    height: 18px;
  }
  
  span {
    font-size: 0.9rem;
    color: #333;
  }
`;

const PasswordInputContainer = styled.div`
  position: relative;
`;

const PasswordToggle = styled.button`
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #6c757d;
  cursor: pointer;
  padding: 0.25rem;
  
  &:hover {
    color: #722F37;
  }
`;

const ModalActions = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #e9ecef;
`;

const ModalButton = styled(motion.button)`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  ${props => props.variant === 'primary' ? `
    background: linear-gradient(135deg, #722F37, #8B3D47);
    color: white;
    
    &:hover {
      background: linear-gradient(135deg, #8B3D47, #722F37);
    }
  ` : `
    background: #6c757d;
    color: white;
    
    &:hover {
      background: #5a6268;
    }
  `}
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

const TeacherManagement = () => {
  const [teachers, setTeachers] = useState([]);
  const [teachersWithClasses, setTeachersWithClasses] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'add', 'edit', 'password', 'assign'
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedClasses, setSelectedClasses] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    phone: '',
    address: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Add timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      const [teachersResponse, classesResponse] = await Promise.all([
        axios.get('/api/users/teachers', { signal: controller.signal }),
        axios.get('/api/classes', { signal: controller.signal })
      ]);

      clearTimeout(timeoutId);

      const teachersData = teachersResponse.data.data || [];
      console.log('Fetched teachers:', teachersData);
      setTeachers(teachersData);
      setClasses(classesResponse.data.data || []);

      // Fetch class assignments for each teacher with timeout
      const teachersWithClassesData = await Promise.allSettled(
        teachersData.map(async (teacher) => {
          try {
            const assignmentController = new AbortController();
            const assignmentTimeoutId = setTimeout(() => assignmentController.abort(), 5000);
            
            const assignmentResponse = await axios.get(`/api/users/teachers/${teacher.id}/classes`, {
              signal: assignmentController.signal
            });
            
            clearTimeout(assignmentTimeoutId);
            console.log(`Teacher ${teacher.id} assignments:`, assignmentResponse.data);
            return {
              ...teacher,
              assigned_classes: assignmentResponse.data.data?.assigned_classes || []
            };
          } catch (error) {
            console.error(`Error fetching classes for teacher ${teacher.id}:`, error);
            return {
              ...teacher,
              assigned_classes: []
            };
          }
        })
      );

      // Process results, handling both fulfilled and rejected promises
      const processedTeachers = teachersWithClassesData.map((result, index) => {
        if (result.status === 'fulfilled') {
          return result.value;
        } else {
          console.error(`Failed to fetch classes for teacher ${teachersData[index]?.id}:`, result.reason);
          return {
            ...teachersData[index],
            assigned_classes: []
          };
        }
      });

      console.log('Teachers with classes:', processedTeachers);
      setTeachersWithClasses(processedTeachers);
    } catch (error) {
      console.error('Error fetching data:', error);
      if (error.name === 'AbortError') {
        toast.error('Request timed out. Please try again.');
      } else {
        toast.error('Failed to fetch teachers and classes');
      }
    } finally {
      setLoading(false);
    }
  };

  const refreshTeacherData = async () => {
    try {
      const teachersResponse = await axios.get('/api/users/teachers');
      const teachersData = teachersResponse.data.data || [];
      setTeachers(teachersData);

      // Fetch updated class assignments for each teacher
      const teachersWithClassesData = await Promise.all(
        teachersData.map(async (teacher) => {
          try {
            const assignmentResponse = await axios.get(`/api/users/teachers/${teacher.id}/classes`);
            return {
              ...teacher,
              assigned_classes: assignmentResponse.data.data?.assigned_classes || []
            };
          } catch (error) {
            console.error(`Error fetching classes for teacher ${teacher.id}:`, error);
            return {
              ...teacher,
              assigned_classes: []
            };
          }
        })
      );

      setTeachersWithClasses(teachersWithClassesData);
    } catch (error) {
      console.error('Error refreshing teacher data:', error);
      toast.error('Failed to refresh teacher data');
    }
  };

  const fetchTeachers = () => {
    fetchData();
  };

  const handleAddTeacher = () => {
    setModalType('add');
    setSelectedTeacher(null);
    setFormData({
      name: '',
      username: '',
      email: '',
      password: '',
      phone: '',
      address: ''
    });
    setShowModal(true);
  };

  const handleEditTeacher = (teacher) => {
    setModalType('edit');
    setSelectedTeacher(teacher);
    setFormData({
      name: teacher.name || '',
      username: teacher.username || '',
      email: teacher.email || '',
      password: '',
      phone: teacher.phone || '',
      address: teacher.address || ''
    });
    setShowModal(true);
  };

  const handleResetPassword = (teacher) => {
    setModalType('password');
    setSelectedTeacher(teacher);
    setFormData({ ...formData, password: '' });
    setShowModal(true);
  };

  const handleAssignClasses = (teacher) => {
    setModalType('assign');
    setSelectedTeacher(teacher);
    const teacherWithClasses = teachersWithClasses.find(t => t.id === teacher.id);
    const assignedClassIds = teacherWithClasses?.assigned_classes?.map(c => c.id) || [];
    setSelectedClasses(assignedClassIds);
    setShowModal(true);
  };

  const handleDeleteTeacher = async (teacher) => {
    if (!window.confirm(`Are you sure you want to delete ${teacher.name}? This action cannot be undone.`)) {
      return;
    }

    try {
      await axios.delete(`/api/users/teachers/${teacher.id}`);
      toast.success('Teacher deleted successfully');
      fetchTeachers();
    } catch (error) {
      console.error('Error deleting teacher:', error);
      toast.error('Failed to delete teacher');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Add timeout for the request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

      if (modalType === 'add') {
        await axios.post('/api/users/teachers', formData, { signal: controller.signal });
        toast.success('Teacher added successfully');
      } else if (modalType === 'edit') {
        await axios.put(`/api/users/teachers/${selectedTeacher.id}`, formData, { signal: controller.signal });
        toast.success('Teacher updated successfully');
      } else if (modalType === 'password') {
        await axios.post(`/api/users/teachers/${selectedTeacher.id}/reset-password`, {
          password: formData.password
        }, { signal: controller.signal });
        toast.success('Password reset successfully');
      } else if (modalType === 'assign') {
        await axios.post(`/api/users/teachers/${selectedTeacher.id}/classes`, {
          class_ids: selectedClasses
        }, { signal: controller.signal });
        toast.success('Classes assigned successfully');
      }

      clearTimeout(timeoutId);
      setShowModal(false);
      setModalType('');
      setSelectedTeacher(null);
      setSelectedClasses([]);
      setFormData({
        name: '',
        username: '',
        email: '',
        password: '',
        phone: '',
        address: ''
      });
      
      // Optimistic update - refresh data immediately
      await fetchData();
    } catch (error) {
      console.error('Error submitting form:', error);
      if (error.name === 'AbortError') {
        toast.error('Request timed out. Please try again.');
      } else {
        toast.error(error.response?.data?.message || 'Operation failed');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleClassToggle = (classId) => {
    setSelectedClasses(prev => {
      if (prev.includes(classId)) {
        return prev.filter(id => id !== classId);
      } else {
        return [...prev, classId];
      }
    });
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Container>
      <Header>
        <Title>
          <FaUsers />
          Teacher Management
        </Title>
        <AddButton
          onClick={handleAddTeacher}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FaUserPlus />
          Add Teacher
        </AddButton>
      </Header>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <LoadingSpinner />
        </div>
      ) : teachersWithClasses.length === 0 ? (
        <EmptyState>
          <FaGraduationCap />
          <h3>No Teachers Found</h3>
          <p>Start by adding your first teacher to the system.</p>
        </EmptyState>
      ) : (
        <TeachersGrid>
          {teachersWithClasses.map((teacher) => (
            <TeacherCard
              key={teacher.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <TeacherHeader>
                <TeacherAvatar>
                  {getInitials(teacher.name)}
                </TeacherAvatar>
                <TeacherInfo>
                  <h3>{teacher.name}</h3>
                  <p>@{teacher.username}</p>
                </TeacherInfo>
              </TeacherHeader>

              <TeacherDetails>
                <DetailItem>
                  <FaEnvelope />
                  <span>{teacher.email}</span>
                </DetailItem>
                {teacher.phone && (
                  <DetailItem>
                    <FaPhone />
                    <span>{teacher.phone}</span>
                  </DetailItem>
                )}

                {teacher.address && (
                  <DetailItem>
                    <FaMapMarkerAlt />
                    <span>{teacher.address}</span>
                  </DetailItem>
                )}
              </TeacherDetails>

              <AssignedClasses>
                <DetailItem>
                  <FaChalkboard />
                  <span style={{ fontWeight: '600' }}>Assigned Classes:</span>
                </DetailItem>
                <ClassesList>
                  {teacher.assigned_classes && teacher.assigned_classes.length > 0 ? (
                    teacher.assigned_classes.map((cls) => (
                      <ClassChip key={cls.id}>
                        {cls.name}
                      </ClassChip>
                    ))
                  ) : (
                    <NoClassesText>No classes assigned</NoClassesText>
                  )}
                </ClassesList>
              </AssignedClasses>

              <TeacherActions>
                <ActionButton
                  onClick={() => handleEditTeacher(teacher)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  title="Edit Teacher"
                >
                  <FaEdit />
                </ActionButton>
                <ActionButton
                  variant="success"
                  onClick={() => handleAssignClasses(teacher)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  title="Assign Classes"
                >
                  <FaChalkboard />
                </ActionButton>
                <ActionButton
                  variant="warning"
                  onClick={() => handleResetPassword(teacher)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  title="Reset Password"
                >
                  <FaKey />
                </ActionButton>
                <ActionButton
                  variant="danger"
                  onClick={() => handleDeleteTeacher(teacher)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  title="Delete Teacher"
                >
                  <FaTrash />
                </ActionButton>
              </TeacherActions>
            </TeacherCard>
          ))}
        </TeachersGrid>
      )}

      <AnimatePresence>
        {showModal && (
          <Modal
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
          >
            <ModalContent
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <ModalHeader>
                <h3>
                  {modalType === 'add' ? 'Add New Teacher' : 
                   modalType === 'edit' ? 'Edit Teacher' : 
                   modalType === 'assign' ? 'Assign Classes' :
                   'Reset Password'}
                </h3>
                <CloseButton onClick={() => setShowModal(false)}>
                  <FaTimes />
                </CloseButton>
              </ModalHeader>

              <Form onSubmit={handleSubmit}>
                {modalType === 'assign' ? (
                  <FormGroup>
                    <Label>Select Classes for {selectedTeacher?.name}</Label>
                    <CheckboxContainer>
                      {classes.map((cls) => (
                        <CheckboxItem key={cls.id}>
                          <input
                            type="checkbox"
                            checked={selectedClasses.includes(cls.id)}
                            onChange={() => handleClassToggle(cls.id)}
                          />
                          <span>{cls.name} ({cls.level})</span>
                        </CheckboxItem>
                      ))}
                    </CheckboxContainer>
                    {classes.length === 0 && (
                      <p style={{ color: '#6c757d', fontStyle: 'italic' }}>
                        No classes available. Please create classes first.
                      </p>
                    )}
                  </FormGroup>
                ) : modalType === 'password' ? (
                  <FormGroup>
                    <Label>New Password *</Label>
                    <PasswordInputContainer>
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="Enter new password"
                        required
                      />
                      <PasswordToggle
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </PasswordToggle>
                    </PasswordInputContainer>
                  </FormGroup>
                ) : (
                  <>
                    <FormGroup>
                      <Label>Full Name *</Label>
                      <Input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Enter full name"
                        required
                      />
                    </FormGroup>

                    <FormGroup>
                      <Label>Username *</Label>
                      <Input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        placeholder="Enter username"
                        required
                      />
                    </FormGroup>

                    <FormGroup>
                      <Label>Email *</Label>
                      <Input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Enter email address"
                        required
                      />
                    </FormGroup>

                    {modalType === 'add' && (
                      <FormGroup>
                        <Label>Password *</Label>
                        <PasswordInputContainer>
                          <Input
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            placeholder="Enter password"
                            required
                          />
                          <PasswordToggle
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                          </PasswordToggle>
                        </PasswordInputContainer>
                      </FormGroup>
                    )}

                    <FormGroup>
                      <Label>Phone</Label>
                      <Input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="Enter phone number"
                      />
                    </FormGroup>

                    <FormGroup>
                      <Label>Address</Label>
                      <TextArea
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="Enter address"
                      />
                    </FormGroup>


                  </>
                )}

                <ModalActions>
                  <ModalButton
                    type="button"
                    onClick={() => setShowModal(false)}
                    disabled={submitting}
                  >
                    <FaTimes />
                    Cancel
                  </ModalButton>
                  <ModalButton
                    type="submit"
                    variant="primary"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <LoadingSpinner />
                    ) : (
                      <FaCheck />
                    )}
                    {modalType === 'add' ? 'Add Teacher' : 
                     modalType === 'edit' ? 'Update Teacher' : 
                     modalType === 'assign' ? 'Assign Classes' :
                     'Reset Password'}
                  </ModalButton>
                </ModalActions>
              </Form>
            </ModalContent>
          </Modal>
        )}
      </AnimatePresence>
    </Container>
  );
};

export default TeacherManagement;
