import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaMoneyBillWave, FaPlus, FaSearch, FaFilter, FaEdit, FaTrash,
  FaEye, FaDownload, FaPrint, FaCalculator, FaReceipt,
  FaCalendarAlt, FaDollarSign, FaCheckCircle, FaExclamationTriangle
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import styled from 'styled-components';

const FeeManagementContainer = styled.div`
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
`;

const MainContent = styled.main`
  display: grid;
  gap: 20px;
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

const TabContainer = styled.div`
  background: var(--secondary-color);
  border-radius: 15px;
  padding: 20px;
  box-shadow: var(--shadow-medium);
`;

const TabButtons = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  border-bottom: 2px solid var(--border-color);
  padding-bottom: 10px;
`;

const TabButton = styled.button`
  padding: 12px 24px;
  border: none;
  background: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  color: var(--text-secondary);

  &.active {
    background: var(--primary-color);
    color: var(--secondary-color);
  }

  &:hover:not(.active) {
    background: var(--background-light);
    color: var(--primary-color);
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
`;

const Td = styled.td`
  padding: 15px;
  border-bottom: 1px solid var(--border-color);
  color: var(--text-primary);
`;

const StatusBadge = styled.span`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;

  &.paid {
    background: #d4edda;
    color: #155724;
  }

  &.pending {
    background: #fff3cd;
    color: #856404;
  }

  &.overdue {
    background: #f8d7da;
    color: #721c24;
  }
`;

const FeeManagement = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('payments');
  const [stats, setStats] = useState({
    totalRevenue: 0,
    pendingPayments: 0,
    overduePayments: 0,
    monthlyRevenue: 0
  });

  const [payments] = useState([
    {
      id: 1,
      student_name: 'Kwame Asante',
      class_name: 'Grade 1',
      amount_paid: 500,
      amount_due: 500,
      status: 'completed',
      payment_date: '2024-01-15'
    },
    {
      id: 2,
      student_name: 'Ama Osei',
      class_name: 'Grade 2',
      amount_paid: 300,
      amount_due: 500,
      status: 'partial',
      payment_date: '2024-01-16'
    }
  ]);

  useEffect(() => {
    setTimeout(() => {
      setStats({
        totalRevenue: 125000,
        pendingPayments: 45,
        overduePayments: 12,
        monthlyRevenue: 45000
      });
    }, 1000);
  }, []);

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
    <FeeManagementContainer>
      <Header>
        <HeaderContent>
          <HeaderIcon>
            <FaMoneyBillWave />
          </HeaderIcon>
          <HeaderText>
            <h1>Fee Management</h1>
            <p>Manage student fees, payments, and financial records</p>
          </HeaderText>
        </HeaderContent>
        <Button
          className="primary"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FaPlus /> Record Payment
        </Button>
      </Header>

      <MainContent>
        <StatsGrid
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <StatCard variants={itemVariants}>
            <StatIcon>
              <FaDollarSign />
            </StatIcon>
            <StatNumber>GHS {stats.totalRevenue.toLocaleString()}</StatNumber>
            <StatLabel>Total Revenue</StatLabel>
          </StatCard>

          <StatCard variants={itemVariants}>
            <StatIcon>
              <FaExclamationTriangle />
            </StatIcon>
            <StatNumber>{stats.pendingPayments}</StatNumber>
            <StatLabel>Pending Payments</StatLabel>
          </StatCard>

          <StatCard variants={itemVariants}>
            <StatIcon>
              <FaCalendarAlt />
            </StatIcon>
            <StatNumber>{stats.overduePayments}</StatNumber>
            <StatLabel>Overdue Payments</StatLabel>
          </StatCard>

          <StatCard variants={itemVariants}>
            <StatIcon>
              <FaCalculator />
            </StatIcon>
            <StatNumber>GHS {stats.monthlyRevenue.toLocaleString()}</StatNumber>
            <StatLabel>Monthly Revenue</StatLabel>
          </StatCard>
        </StatsGrid>

        <TabContainer
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <TabButtons>
            <TabButton
              className={activeTab === 'payments' ? 'active' : ''}
              onClick={() => setActiveTab('payments')}
            >
              <FaReceipt style={{ marginRight: '8px' }} />
              Payments
            </TabButton>
            <TabButton
              className={activeTab === 'fee-structures' ? 'active' : ''}
              onClick={() => setActiveTab('fee-structures')}
            >
              <FaCalculator style={{ marginRight: '8px' }} />
              Fee Structures
            </TabButton>
            <TabButton
              className={activeTab === 'reports' ? 'active' : ''}
              onClick={() => setActiveTab('reports')}
            >
              <FaDownload style={{ marginRight: '8px' }} />
              Reports
            </TabButton>
          </TabButtons>

          {activeTab === 'payments' && (
            <motion.div variants={itemVariants}>
              <TableContainer>
                <Table>
                  <thead>
                    <tr>
                      <Th>Payment Date</Th>
                      <Th>Student</Th>
                      <Th>Class</Th>
                      <Th>Amount Paid</Th>
                      <Th>Amount Due</Th>
                      <Th>Status</Th>
                      <Th>Actions</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((payment) => (
                      <tr key={payment.id}>
                        <Td>{new Date(payment.payment_date).toLocaleDateString()}</Td>
                        <Td>{payment.student_name}</Td>
                        <Td>{payment.class_name}</Td>
                        <Td>GHS {payment.amount_paid.toLocaleString()}</Td>
                        <Td>GHS {payment.amount_due.toLocaleString()}</Td>
                        <Td>
                          <StatusBadge className={payment.status}>
                            {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                          </StatusBadge>
                        </Td>
                        <Td>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <Button className="secondary" style={{ padding: '6px 10px', fontSize: '12px' }}>
                              <FaEye />
                            </Button>
                            <Button className="secondary" style={{ padding: '6px 10px', fontSize: '12px' }}>
                              <FaPrint />
                            </Button>
                          </div>
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </TableContainer>
            </motion.div>
          )}

          {activeTab === 'fee-structures' && (
            <motion.div variants={itemVariants}>
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <FaCalculator style={{ fontSize: '48px', color: 'var(--primary-color)', marginBottom: '20px' }} />
                <h3 style={{ color: 'var(--primary-color)', marginBottom: '10px' }}>Fee Structures</h3>
                <p style={{ color: 'var(--text-secondary)' }}>
                  Manage fee structures for different classes and fee types
                </p>
              </div>
            </motion.div>
          )}

          {activeTab === 'reports' && (
            <motion.div variants={itemVariants}>
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <FaDownload style={{ fontSize: '48px', color: 'var(--primary-color)', marginBottom: '20px' }} />
                <h3 style={{ color: 'var(--primary-color)', marginBottom: '10px' }}>Financial Reports</h3>
                <p style={{ color: 'var(--text-secondary)' }}>
                  Generate detailed financial reports and analytics
                </p>
              </div>
            </motion.div>
          )}
        </TabContainer>
      </MainContent>
    </FeeManagementContainer>
  );
};

export default FeeManagement;
