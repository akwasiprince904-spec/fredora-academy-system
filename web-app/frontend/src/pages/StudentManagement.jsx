import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaUserGraduate, FaPlus, FaSearch, FaFilter, FaEdit, FaTrash, 
  FaEye, FaDownload, FaUpload, FaPrint, FaGraduationCap, 
  FaCalendarAlt, FaPhone, FaEnvelope, FaMapMarkerAlt, FaIdCard,
  FaArrowLeft, FaSort, FaSortUp, FaSortDown
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import styled from 'styled-components';

const StudentManagementContainer = styled.div`
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

const SearchFilterSection = styled(motion.div)`
  background: var(--secondary-color);
  border-radius: 15px;
  padding: 20px;
  box-shadow: var(--shadow-medium);
`;

const SearchFilterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
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

const FilterActions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
`;

const StudentsSection = styled(motion.div)`
  background: var(--secondary-color);
  border-radius: 15px;
  padding: 20px;
  box-shadow: var(--shadow-medium);
`;

const StudentsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const StudentsCount = styled.div`
  color: var(--text-secondary);
  font-size: 14px;
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

const StatusBadge = styled.span`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  
  &.active {
    background: #d4edda;
    color: #155724;
  }
  
  &.inactive {
    background: #f8d7da;
    color: #721c24;
  }
`;

const ActionButtonsCell = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button`
  padding: 6px 10px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.3s ease;
  
  &.view {
    background: var(--primary-color);
    color: var(--secondary-color);
    &:hover { background: var(--accent-color); }
  }
  
  &.edit {
    background: #ffc107;
    color: #212529;
    &:hover { background: #e0a800; }
  }
  
  &.delete {
    background: #dc3545;
    color: var(--secondary-color);
    &:hover { background: #c82333; }
  }
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin-top: 20px;
`;

const PageButton = styled.button`
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  background: var(--secondary-color);
  border-radius: 6px;
  cursor: pointer;
  
  &:hover {
    background: var(--background-light);
  }
  
  &.active {
    background: var(--primary-color);
    color: var(--secondary-color);
    border-color: var(--primary-color);
  }
`;

const StudentManagement = () => {
  const { user, hasRole } = useAuth();
  const navigate = useNavigate();
  
  // State management
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [studentsPerPage] = useState(10);
  
  // Mock data for demonstration
  const mockStudents = [
    {
      id: 'FA2024001',
      name: 'Kwame Asante',
      photo: 'https://via.placeholder.com/40',
      class: 'Grade 1',
      gender: 'Male',
      dateOfBirth: '2017-03-15',
      parentName: 'Kofi Asante',
      parentPhone: '+233 24 123 4567',
      status: 'active',
      enrollmentDate: '2024-01-15',
      feeBalance: 0
    },
    {
      id: 'FA2024002',
      name: 'Ama Osei',
      photo: 'https://via.placeholder.com/40',
      class: 'Grade 2',
      gender: 'Female',
      dateOfBirth: '2016-08-22',
      parentName: 'Yaw Osei',
      parentPhone: '+233 20 987 6543',
      status: 'active',
      enrollmentDate: '2024-01-16',
      feeBalance: 150
    },
    {
      id: 'FA2024003',
      name: 'Kofi Mensah',
      photo: 'https://via.placeholder.com/40',
      class: 'JHS 1',
      gender: 'Male',
      dateOfBirth: '2011-12-10',
      parentName: 'Abena Mensah',
      parentPhone: '+233 26 555 1234',
      status: 'active',
      enrollmentDate: '2024-01-17',
      feeBalance: 0
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setStudents(mockStudents);
      setLoading(false);
    }, 1000);
  }, []);

  // Filter and sort students
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.parentName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = !selectedClass || student.class === selectedClass;
    const matchesStatus = !selectedStatus || student.status === selectedStatus;
    
    return matchesSearch && matchesClass && matchesStatus;
  });

  const sortedStudents = [...filteredStudents].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Pagination
  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = sortedStudents.slice(indexOfFirstStudent, indexOfLastStudent);
  const totalPages = Math.ceil(sortedStudents.length / studentsPerPage);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleViewStudent = (studentId) => {
    navigate(`/students/${studentId}`);
  };

  const handleEditStudent = (studentId) => {
    navigate(`/students/${studentId}/edit`);
  };

  const handleDeleteStudent = (studentId) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      setStudents(students.filter(student => student.id !== studentId));
    }
  };

  const handleAddStudent = () => {
    navigate('/students/add');
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedClass('');
    setSelectedStatus('');
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
      <StudentManagementContainer>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <div>Loading students...</div>
        </div>
      </StudentManagementContainer>
    );
  }

  return (
    <StudentManagementContainer>
      <Header>
        <HeaderContent>
          <HeaderIcon>
            <FaUserGraduate />
          </HeaderIcon>
          <HeaderText>
            <h1>Student Management</h1>
            <p>Manage student records, enrollment, and information</p>
          </HeaderText>
        </HeaderContent>
        <ActionButtons>
          <Button
            className="primary"
            onClick={handleAddStudent}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaPlus /> Add Student
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
        <SearchFilterSection
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <SearchFilterGrid>
            <InputGroup>
              <Label>Search Students</Label>
              <Input
                type="text"
                placeholder="Search by name, ID, or parent name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
            
            <InputGroup>
              <Label>Filter by Class</Label>
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
              <Label>Filter by Status</Label>
              <Select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </Select>
            </InputGroup>
          </SearchFilterGrid>
          
          <FilterActions>
            <Button
              className="secondary"
              onClick={clearFilters}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaFilter /> Clear Filters
            </Button>
          </FilterActions>
        </SearchFilterSection>

        <StudentsSection
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <StudentsHeader>
            <StudentsCount>
              Showing {currentStudents.length} of {filteredStudents.length} students
            </StudentsCount>
          </StudentsHeader>

          <TableContainer>
            <Table>
              <thead>
                <tr>
                  <Th 
                    className="sortable"
                    onClick={() => handleSort('id')}
                  >
                    Student ID
                    {sortField === 'id' && (
                      sortDirection === 'asc' ? <FaSortUp /> : <FaSortDown />
                    )}
                  </Th>
                  <Th>Photo</Th>
                  <Th 
                    className="sortable"
                    onClick={() => handleSort('name')}
                  >
                    Name
                    {sortField === 'name' && (
                      sortDirection === 'asc' ? <FaSortUp /> : <FaSortDown />
                    )}
                  </Th>
                  <Th 
                    className="sortable"
                    onClick={() => handleSort('class')}
                  >
                    Class
                    {sortField === 'class' && (
                      sortDirection === 'asc' ? <FaSortUp /> : <FaSortDown />
                    )}
                  </Th>
                  <Th>Gender</Th>
                  <Th>Parent Name</Th>
                  <Th>Parent Phone</Th>
                  <Th>Status</Th>
                  <Th>Fee Balance</Th>
                  <Th>Actions</Th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {currentStudents.map((student, index) => (
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
                      <Td>{student.parentName}</Td>
                      <Td>{student.parentPhone}</Td>
                      <Td>
                        <StatusBadge className={student.status}>
                          {student.status === 'active' ? 'Active' : 'Inactive'}
                        </StatusBadge>
                      </Td>
                      <Td>
                        <span style={{ 
                          color: student.feeBalance > 0 ? '#dc3545' : '#28a745',
                          fontWeight: '500'
                        }}>
                          {student.feeBalance > 0 ? `GHS ${student.feeBalance}` : 'Paid'}
                        </span>
                      </Td>
                      <Td>
                        <ActionButtonsCell>
                          <ActionButton
                            className="view"
                            onClick={() => handleViewStudent(student.id)}
                            title="View Details"
                          >
                            <FaEye />
                          </ActionButton>
                          <ActionButton
                            className="edit"
                            onClick={() => handleEditStudent(student.id)}
                            title="Edit Student"
                          >
                            <FaEdit />
                          </ActionButton>
                          <ActionButton
                            className="delete"
                            onClick={() => handleDeleteStudent(student.id)}
                            title="Delete Student"
                          >
                            <FaTrash />
                          </ActionButton>
                        </ActionButtonsCell>
                      </Td>
                    </Tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </Table>
          </TableContainer>

          {totalPages > 1 && (
            <Pagination>
              <PageButton
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </PageButton>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <PageButton
                  key={page}
                  className={currentPage === page ? 'active' : ''}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </PageButton>
              ))}
              
              <PageButton
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
              </PageButton>
            </Pagination>
          )}
        </StudentsSection>
      </MainContent>
    </StudentManagementContainer>
  );
};

export default StudentManagement;




