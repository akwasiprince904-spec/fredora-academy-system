import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaArrowLeft, FaGraduationCap } from 'react-icons/fa';
import GradeManagement from '../components/GradeManagement';

const PageContainer = styled.div`
  min-height: 100vh;
  position: relative;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  
  &::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: url('https://images.unsplash.com/photo-1497486751825-1233686d5d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    background-attachment: fixed;
    opacity: 0.05;
    z-index: -2;
  }
  
  &::after {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(114, 47, 55, 0.85) 0%, rgba(139, 61, 71, 0.75) 100%);
    z-index: -1;
  }
`;

const Header = styled.header`
  background: linear-gradient(135deg, #722F37 0%, #8B3D47 100%);
  color: white;
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
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  padding: 0.5rem;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

const Title = styled.h1`
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const MainContent = styled.main`
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
`;

const TeacherGrades = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/teacher/dashboard');
  };

  return (
    <PageContainer>
      <Header>
        <HeaderContent>
          <BackButton onClick={handleBack}>
            <FaArrowLeft size={20} />
          </BackButton>
          <Title>
            <FaGraduationCap />
            Grade Management
          </Title>
        </HeaderContent>
      </Header>

      <MainContent>
        <GradeManagement />
      </MainContent>
    </PageContainer>
  );
};

export default TeacherGrades;
