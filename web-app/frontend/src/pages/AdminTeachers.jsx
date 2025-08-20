import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaArrowLeft, FaUsers } from 'react-icons/fa';
import TeacherManagement from '../components/TeacherManagement';

const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #722F37 0%, #8B3D47 100%);
`;

const Header = styled.header`
  background: white;
  color: #722F37;
  padding: 1rem 2rem;
  box-shadow: 0 4px 12px rgba(114, 47, 55, 0.2);
`;

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  max-width: 1400px;
  margin: 0 auto;
`;

const BackButton = styled.button`
  background: rgba(114, 47, 55, 0.1);
  border: 2px solid #722F37;
  color: #722F37;
  padding: 0.5rem;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  
  &:hover {
    background: #722F37;
    color: white;
  }
`;

const Title = styled.h1`
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #722F37;
`;

const MainContent = styled.main`
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
`;

const AdminTeachers = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/admin/dashboard');
  };

  return (
    <PageContainer>
      <Header>
        <HeaderContent>
          <BackButton onClick={handleBack}>
            <FaArrowLeft size={20} />
          </BackButton>
          <Title>
            <FaUsers />
            Teacher Management
          </Title>
        </HeaderContent>
      </Header>

      <MainContent>
        <TeacherManagement />
      </MainContent>
    </PageContainer>
  );
};

export default AdminTeachers;
