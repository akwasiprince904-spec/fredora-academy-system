import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { FaGraduationCap, FaEye, FaEyeSlash, FaUser, FaLock } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import styled from 'styled-components';

const LoginContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--accent-color) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: linear-gradient(rgba(114, 47, 55, 0.85), rgba(139, 61, 71, 0.75)),
      url('https://images.unsplash.com/photo-1591815302525-5097b9a1cc54?q=80&w=2069&auto=format&fit=crop');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    filter: saturate(1.05);
    z-index: 0;
  }
`;

const FloatingShapes = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 1;
`;

const Bubble = styled.div`
  position: absolute;
  background: ${props => props.gradient || 'rgba(255, 255, 255, 0.1)'};
  border-radius: 50%;
  pointer-events: none;
  animation: ${props => props.animation} ${props => props.duration} ${props => props.delay} infinite;
  box-shadow: inset 0 0 20px rgba(255, 255, 255, 0.2), 0 0 20px rgba(255, 255, 255, 0.1);
  
  &::before {
    content: '';
    position: absolute;
    top: 10%;
    left: 10%;
    width: 80%;
    height: 80%;
    background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.4), transparent 70%);
    border-radius: 50%;
  }
`;

const BubbleContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 1;
  
  @keyframes float-up-1 {
    0% { 
      transform: translateY(100vh) translateX(0px) rotate(0deg) scale(0.5);
      opacity: 0;
    }
    10% {
      opacity: 1;
    }
    90% {
      opacity: 1;
    }
    100% { 
      transform: translateY(-100px) translateX(50px) rotate(360deg) scale(1.2);
      opacity: 0;
    }
  }
  
  @keyframes float-up-2 {
    0% { 
      transform: translateY(100vh) translateX(0px) rotate(0deg) scale(0.3);
      opacity: 0;
    }
    15% {
      opacity: 1;
    }
    85% {
      opacity: 1;
    }
    100% { 
      transform: translateY(-100px) translateX(-30px) rotate(-360deg) scale(1);
      opacity: 0;
    }
  }
  
  @keyframes float-up-3 {
    0% { 
      transform: translateY(100vh) translateX(0px) rotate(0deg) scale(0.7);
      opacity: 0;
    }
    20% {
      opacity: 1;
    }
    80% {
      opacity: 1;
    }
    100% { 
      transform: translateY(-100px) translateX(80px) rotate(720deg) scale(0.8);
      opacity: 0;
    }
  }
  
  @keyframes float-diagonal-1 {
    0% { 
      transform: translate(-100px, 100vh) rotate(0deg) scale(0.4);
      opacity: 0;
    }
    10% {
      opacity: 1;
    }
    90% {
      opacity: 1;
    }
    100% { 
      transform: translate(100vw, -100px) rotate(540deg) scale(1.1);
      opacity: 0;
    }
  }
  
  @keyframes float-diagonal-2 {
    0% { 
      transform: translate(100vw, 100vh) rotate(0deg) scale(0.6);
      opacity: 0;
    }
    15% {
      opacity: 1;
    }
    85% {
      opacity: 1;
    }
    100% { 
      transform: translate(-100px, -100px) rotate(-540deg) scale(0.9);
      opacity: 0;
    }
  }
  
  @keyframes pulse-float {
    0% { 
      transform: translateY(100vh) scale(0.5);
      opacity: 0;
    }
    10% {
      opacity: 1;
    }
    50% {
      transform: translateY(50vh) scale(1.2);
      opacity: 0.8;
    }
    90% {
      opacity: 1;
    }
    100% { 
      transform: translateY(-100px) scale(0.3);
      opacity: 0;
    }
  }
  
  @keyframes zigzag-float {
    0% { 
      transform: translateY(100vh) translateX(0px) rotate(0deg);
      opacity: 0;
    }
    10% { opacity: 1; }
    25% { transform: translateY(75vh) translateX(100px) rotate(90deg); }
    50% { transform: translateY(50vh) translateX(-50px) rotate(180deg); }
    75% { transform: translateY(25vh) translateX(150px) rotate(270deg); }
    90% { opacity: 1; }
    100% { 
      transform: translateY(-100px) translateX(0px) rotate(360deg);
      opacity: 0;
    }
  }
  
  @keyframes spiral-float {
    0% { 
      transform: translateY(100vh) translateX(50vw) rotate(0deg) scale(0.3);
      opacity: 0;
    }
    10% { opacity: 1; }
    100% { 
      transform: translateY(-100px) translateX(50vw) rotate(1080deg) scale(1.5);
      opacity: 0;
    }
  }
  
  @keyframes wave-float {
    0% { 
      transform: translateY(100vh) translateX(0px) rotate(0deg);
      opacity: 0;
    }
    10% { opacity: 1; }
    20% { transform: translateY(80vh) translateX(50px) rotate(72deg); }
    40% { transform: translateY(60vh) translateX(-30px) rotate(144deg); }
    60% { transform: translateY(40vh) translateX(80px) rotate(216deg); }
    80% { transform: translateY(20vh) translateX(-20px) rotate(288deg); }
    90% { opacity: 1; }
    100% { 
      transform: translateY(-100px) translateX(40px) rotate(360deg);
      opacity: 0;
    }
  }
`;

const LoginCard = styled(motion.div)`
  background: var(--secondary-color);
  border-radius: 20px;
  padding: 40px;
  box-shadow: var(--shadow-large);
  width: 100%;
  max-width: 400px;
  position: relative;
  z-index: 2;
`;

const LogoSection = styled.div`
  text-align: center;
  margin-bottom: 30px;
`;

const LogoIcon = styled.div`
  width: 80px;
  height: 80px;
  background: var(--primary-color);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  color: var(--secondary-color);
  font-size: 40px;
  box-shadow: var(--shadow-medium);
`;

const SchoolName = styled.h1`
  color: var(--primary-color);
  font-size: 24px;
  font-weight: 600;
  margin: 0;
  margin-bottom: 5px;
`;

const SchoolTagline = styled.p`
  color: var(--text-secondary);
  font-size: 14px;
  margin: 0;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const InputGroup = styled.div`
  position: relative;
`;

const Input = styled.input`
  width: 100%;
  padding: 15px 15px 15px 45px;
  border: 2px solid var(--border-color);
  border-radius: 12px;
  font-size: 16px;
  transition: all var(--transition-normal);
  background: var(--secondary-color);
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(114, 47, 55, 0.1);
  }
  
  &.error {
    border-color: var(--danger-color);
  }
`;

const InputIcon = styled.div`
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-secondary);
  font-size: 18px;
  z-index: 1;
`;

const PasswordToggle = styled.button`
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 16px;
  z-index: 1;
  
  &:hover {
    color: var(--primary-color);
  }
`;

const ErrorMessage = styled.span`
  color: var(--danger-color);
  font-size: 12px;
  margin-top: 5px;
  display: block;
`;

const LoginButton = styled(motion.button)`
  width: 100%;
  padding: 15px;
  background: var(--primary-color);
  color: var(--secondary-color);
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-normal);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  
  &:hover:not(:disabled) {
    background: var(--accent-color);
    transform: translateY(-2px);
    box-shadow: var(--shadow-medium);
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }
`;

const LoadingSpinner = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: var(--secondary-color);
  animation: spin 1s ease-in-out infinite;
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const WelcomeMessage = styled.div`
  text-align: center;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid var(--border-color);
`;

const WelcomeText = styled.p`
  color: var(--text-secondary);
  font-size: 14px;
  margin: 0;
`;

const DemoCredentials = styled.div`
  background: var(--background-light);
  border-radius: 8px;
  padding: 15px;
  margin-top: 15px;
  border: 1px solid var(--border-color);
`;

const DemoTitle = styled.h4`
  color: var(--primary-color);
  font-size: 14px;
  margin: 0 0 10px 0;
  font-weight: 600;
`;

const DemoText = styled.p`
  color: var(--text-secondary);
  font-size: 12px;
  margin: 0;
  line-height: 1.4;
`;

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError
  } = useForm();

  // Generate bubble configurations
  const generateBubbles = () => {
    const bubbles = [];
    const animations = [
      'float-up-1', 'float-up-2', 'float-up-3', 
      'float-diagonal-1', 'float-diagonal-2', 
      'pulse-float', 'zigzag-float', 
      'spiral-float', 'wave-float'
    ];
    const gradients = [
      'rgba(255, 255, 255, 0.15)',
      'rgba(255, 255, 255, 0.1)',
      'rgba(255, 255, 255, 0.08)',
      'rgba(255, 255, 255, 0.12)',
      'radial-gradient(circle, rgba(255, 255, 255, 0.25), rgba(255, 255, 255, 0.05))',
      'radial-gradient(circle, rgba(255, 255, 255, 0.18), transparent)',
      'linear-gradient(45deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.05))',
      'radial-gradient(circle, rgba(255, 240, 245, 0.2), rgba(255, 255, 255, 0.03))',
      'radial-gradient(circle, rgba(255, 250, 250, 0.22), transparent)',
      'linear-gradient(135deg, rgba(255, 255, 255, 0.12), rgba(255, 245, 248, 0.08))',
      'radial-gradient(ellipse, rgba(255, 255, 255, 0.16), rgba(255, 252, 253, 0.04))',
      'conic-gradient(from 0deg, rgba(255, 255, 255, 0.1), rgba(255, 248, 250, 0.15), rgba(255, 255, 255, 0.08))'
    ];

    // Create 35 bubbles with random properties for more dynamic effect
    for (let i = 0; i < 35; i++) {
      const size = Math.random() * 140 + 25; // 25px to 165px
      const left = Math.random() * 100; // 0% to 100%
      const animationIndex = Math.floor(Math.random() * animations.length);
      const gradientIndex = Math.floor(Math.random() * gradients.length);
      const duration = Math.random() * 2.5 + 1.5; // 1.5s to 4s (even faster)
      const delay = Math.random() * 10; // 0s to 10s delay for more staggered effect
      
      bubbles.push({
        id: i,
        size: `${size}px`,
        left: `${left}%`,
        animation: animations[animationIndex],
        gradient: gradients[gradientIndex],
        duration: `${duration}s`,
        delay: `${delay}s`
      });
    }
    
    return bubbles;
  };

  const bubbles = generateBubbles();

  const onSubmit = async (data) => {
    setIsLoading(true);
    
    // Add these debug logs
    console.log('   Login attempt with data:', data);
    console.log('🔍 API_BASE_URL:', import.meta.env.VITE_API_URL);
    console.log('🔍 Full API URL:', `${import.meta.env.VITE_API_URL}/api/auth/login`);
    
    try {
      const result = await login(data);
      
      if (result.success) {
        // Redirect based on user role
        if (result.user.role === 'admin') {
          navigate('/admin');
        } else if (result.user.role === 'teacher') {
          navigate('/teacher');
        }
      } else {
        setError('root', {
          type: 'manual',
          message: result.error
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('root', {
        type: 'manual',
        message: 'An unexpected error occurred. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  return (
    <LoginContainer>
      <BubbleContainer>
        {bubbles.map((bubble) => (
          <Bubble
            key={bubble.id}
            style={{
              width: bubble.size,
              height: bubble.size,
              left: bubble.left,
            }}
            gradient={bubble.gradient}
            animation={bubble.animation}
            duration={bubble.duration}
            delay={bubble.delay}
          />
        ))}
      </BubbleContainer>
      
      <LoginCard
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <LogoSection>
          <LogoIcon>
            <FaGraduationCap />
          </LogoIcon>
          <SchoolName>Fredora's Academy</SchoolName>
          <SchoolTagline>Excellence in Education</SchoolTagline>
        </LogoSection>

        <Form onSubmit={handleSubmit(onSubmit)}>
          <InputGroup>
            <InputIcon>
              <FaUser />
            </InputIcon>
            <Input
              type="text"
              placeholder="Username or Email"
              {...register('username', { 
                required: 'Username or email is required',
                minLength: { value: 3, message: 'Username must be at least 3 characters' }
              })}
              className={errors.username ? 'error' : ''}
            />
            {errors.username && <ErrorMessage>{errors.username.message}</ErrorMessage>}
          </InputGroup>

          <InputGroup>
            <InputIcon>
              <FaLock />
            </InputIcon>
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              {...register('password', { 
                required: 'Password is required',
                minLength: { value: 6, message: 'Password must be at least 6 characters' }
              })}
              className={errors.password ? 'error' : ''}
            />
            <PasswordToggle
              type="button"
              onClick={togglePasswordVisibility}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </PasswordToggle>
            {errors.password && <ErrorMessage>{errors.password.message}</ErrorMessage>}
          </InputGroup>

          {errors.root && (
            <ErrorMessage style={{ textAlign: 'center', fontSize: '14px' }}>
              {errors.root.message}
            </ErrorMessage>
          )}

          <LoginButton
            type="submit"
            disabled={isLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isLoading ? (
              <>
                <LoadingSpinner />
                Signing In...
              </>
            ) : (
              'Sign In'
            )}
          </LoginButton>
        </Form>

        <WelcomeMessage>
          <WelcomeText>
            Welcome to Fredora's Academy Management System
          </WelcomeText>
          
          <DemoCredentials>
            <DemoTitle>Demo Credentials:</DemoTitle>
            <DemoText>
              <strong>Admin:</strong> admin@fredora.com / admin123<br />
              <strong>Teacher:</strong> teacher@fredora.com / teacher123
            </DemoText>
          </DemoCredentials>
        </WelcomeMessage>
      </LoginCard>
    </LoginContainer>
  );
};

export default Login;