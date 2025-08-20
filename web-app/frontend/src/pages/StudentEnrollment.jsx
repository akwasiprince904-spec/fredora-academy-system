import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { 
  FaUserGraduate, FaArrowLeft, FaSave, FaUpload, FaCamera,
  FaUser, FaCalendarAlt, FaVenusMars, FaMapMarkerAlt,
  FaPhone, FaEnvelope, FaUserFriends, FaHeartbeat,
  FaGraduationCap, FaIdCard, FaFileAlt, FaCheck
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import styled from 'styled-components';

const EnrollmentContainer = styled.div`
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

const BackButton = styled(motion.button)`
  padding: 12px 20px;
  background: var(--secondary-color);
  color: var(--primary-color);
  border: 2px solid var(--primary-color);
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  
  &:hover {
    background: var(--primary-color);
    color: var(--secondary-color);
  }
`;

const FormContainer = styled(motion.div)`
  background: var(--secondary-color);
  border-radius: 15px;
  padding: 30px;
  box-shadow: var(--shadow-medium);
  max-width: 1200px;
  margin: 0 auto;
`;

const Form = styled.form`
  display: grid;
  gap: 30px;
`;

const FormSection = styled.div`
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 25px;
  background: var(--background-light);
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid var(--primary-color);
  
  h3 {
    color: var(--primary-color);
    margin: 0;
    font-size: 20px;
    font-weight: 600;
  }
  
  .icon {
    width: 35px;
    height: 35px;
    background: var(--primary-color);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--secondary-color);
    font-size: 16px;
  }
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-weight: 500;
  color: var(--text-primary);
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 5px;
  
  .required {
    color: #dc3545;
  }
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
  
  &.error {
    border-color: #dc3545;
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
  
  &.error {
    border-color: #dc3545;
  }
`;

const TextArea = styled.textarea`
  padding: 12px;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  font-size: 14px;
  resize: vertical;
  min-height: 80px;
  font-family: inherit;
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
  
  &.error {
    border-color: #dc3545;
  }
`;

const PhotoUploadSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  padding: 20px;
  border: 2px dashed var(--border-color);
  border-radius: 12px;
  background: var(--background-light);
  transition: border-color 0.3s ease;
  
  &:hover {
    border-color: var(--primary-color);
  }
`;

const PhotoPreview = styled.div`
  position: relative;
  width: 150px;
  height: 150px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid var(--primary-color);
  background: var(--background-light);
  display: flex;
  align-items: center;
  justify-content: center;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .placeholder {
    color: var(--text-secondary);
    font-size: 48px;
  }
`;

const UploadButton = styled.label`
  padding: 10px 20px;
  background: var(--primary-color);
  color: var(--secondary-color);
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  transition: background 0.3s ease;
  
  &:hover {
    background: var(--accent-color);
  }
  
  input {
    display: none;
  }
`;

const ErrorMessage = styled.span`
  color: #dc3545;
  font-size: 12px;
  margin-top: 5px;
`;

const FormActions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
  padding-top: 20px;
  border-top: 1px solid var(--border-color);
`;

const SubmitButton = styled(motion.button)`
  padding: 15px 30px;
  background: var(--primary-color);
  color: var(--secondary-color);
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: background 0.3s ease;
  
  &:hover {
    background: var(--accent-color);
  }
  
  &:disabled {
    background: var(--text-secondary);
    cursor: not-allowed;
  }
`;

const ProgressIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--text-secondary);
  font-size: 14px;
`;

const ProgressBar = styled.div`
  width: 200px;
  height: 6px;
  background: var(--border-color);
  border-radius: 3px;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: var(--primary-color);
  border-radius: 3px;
  transition: width 0.3s ease;
  width: ${props => props.progress}%;
`;

const StudentEnrollment = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    trigger
  } = useForm();

  const watchedFields = watch();

  // Calculate form completion progress
  React.useEffect(() => {
    const requiredFields = [
      'firstName', 'lastName', 'dateOfBirth', 'gender', 'class',
      'parentName', 'parentPhone', 'address'
    ];
    
    const filledFields = requiredFields.filter(field => watchedFields[field]);
    const progressPercentage = (filledFields.length / requiredFields.length) * 100;
    setProgress(progressPercentage);
  }, [watchedFields]);

  const handlePhotoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target.result);
      };
      reader.readAsDataURL(file);
      setValue('photo', file);
    }
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate student ID (FA[YEAR][SEQUENTIAL_NUMBER])
      const currentYear = new Date().getFullYear();
      const studentId = `FA${currentYear}${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
      
      console.log('Student enrolled successfully:', { ...data, studentId });
      
      // Show success message and redirect
      alert(`Student enrolled successfully! Student ID: ${studentId}`);
      navigate('/students');
    } catch (error) {
      console.error('Enrollment failed:', error);
      alert('Enrollment failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate('/students');
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <EnrollmentContainer>
      <Header>
        <HeaderContent>
          <HeaderIcon>
            <FaUserGraduate />
          </HeaderIcon>
          <HeaderText>
            <h1>Student Enrollment</h1>
            <p>Register new students for Fredora's Academy</p>
          </HeaderText>
        </HeaderContent>
        <BackButton
          onClick={handleBack}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FaArrowLeft /> Back to Students
        </BackButton>
      </Header>

      <FormContainer
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <Form onSubmit={handleSubmit(onSubmit)}>
          {/* Student Photo Section */}
          <FormSection>
            <SectionHeader>
              <div className="icon">
                <FaCamera />
              </div>
              <h3>Student Photo</h3>
            </SectionHeader>
            
            <PhotoUploadSection>
              <PhotoPreview>
                {photoPreview ? (
                  <img src={photoPreview} alt="Student preview" />
                ) : (
                  <div className="placeholder">
                    <FaUser />
                  </div>
                )}
              </PhotoPreview>
              
              <UploadButton>
                <FaUpload />
                {photoPreview ? 'Change Photo' : 'Upload Photo'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                />
              </UploadButton>
              
              <p style={{ color: 'var(--text-secondary)', fontSize: '12px', textAlign: 'center' }}>
                Upload a clear photo of the student (JPG, PNG, max 2MB)
              </p>
            </PhotoUploadSection>
          </FormSection>

          {/* Personal Information */}
          <FormSection>
            <SectionHeader>
              <div className="icon">
                <FaUser />
              </div>
              <h3>Personal Information</h3>
            </SectionHeader>
            
            <FormGrid>
              <InputGroup>
                <Label>
                  First Name <span className="required">*</span>
                </Label>
                <Input
                  type="text"
                  placeholder="Enter first name"
                  {...register('firstName', { 
                    required: 'First name is required',
                    minLength: { value: 2, message: 'First name must be at least 2 characters' }
                  })}
                  className={errors.firstName ? 'error' : ''}
                />
                {errors.firstName && <ErrorMessage>{errors.firstName.message}</ErrorMessage>}
              </InputGroup>

              <InputGroup>
                <Label>
                  Last Name <span className="required">*</span>
                </Label>
                <Input
                  type="text"
                  placeholder="Enter last name"
                  {...register('lastName', { 
                    required: 'Last name is required',
                    minLength: { value: 2, message: 'Last name must be at least 2 characters' }
                  })}
                  className={errors.lastName ? 'error' : ''}
                />
                {errors.lastName && <ErrorMessage>{errors.lastName.message}</ErrorMessage>}
              </InputGroup>

              <InputGroup>
                <Label>
                  Date of Birth <span className="required">*</span>
                </Label>
                <Input
                  type="date"
                  {...register('dateOfBirth', { 
                    required: 'Date of birth is required',
                    validate: value => {
                      const age = new Date().getFullYear() - new Date(value).getFullYear();
                      return age >= 2 && age <= 18 || 'Student must be between 2 and 18 years old';
                    }
                  })}
                  className={errors.dateOfBirth ? 'error' : ''}
                />
                {errors.dateOfBirth && <ErrorMessage>{errors.dateOfBirth.message}</ErrorMessage>}
              </InputGroup>

              <InputGroup>
                <Label>
                  Gender <span className="required">*</span>
                </Label>
                <Select
                  {...register('gender', { required: 'Gender is required' })}
                  className={errors.gender ? 'error' : ''}
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </Select>
                {errors.gender && <ErrorMessage>{errors.gender.message}</ErrorMessage>}
              </InputGroup>

              <InputGroup>
                <Label>
                  Class <span className="required">*</span>
                </Label>
                <Select
                  {...register('class', { required: 'Class is required' })}
                  className={errors.class ? 'error' : ''}
                >
                  <option value="">Select class</option>
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
                {errors.class && <ErrorMessage>{errors.class.message}</ErrorMessage>}
              </InputGroup>

              <InputGroup>
                <Label>Previous School</Label>
                <Input
                  type="text"
                  placeholder="Enter previous school (if any)"
                  {...register('previousSchool')}
                />
              </InputGroup>
            </FormGrid>
          </FormSection>

          {/* Parent/Guardian Information */}
          <FormSection>
            <SectionHeader>
              <div className="icon">
                <FaUserFriends />
              </div>
              <h3>Parent/Guardian Information</h3>
            </SectionHeader>
            
            <FormGrid>
              <InputGroup>
                <Label>
                  Parent/Guardian Name <span className="required">*</span>
                </Label>
                <Input
                  type="text"
                  placeholder="Enter parent/guardian full name"
                  {...register('parentName', { 
                    required: 'Parent/guardian name is required',
                    minLength: { value: 2, message: 'Name must be at least 2 characters' }
                  })}
                  className={errors.parentName ? 'error' : ''}
                />
                {errors.parentName && <ErrorMessage>{errors.parentName.message}</ErrorMessage>}
              </InputGroup>

              <InputGroup>
                <Label>
                  Phone Number <span className="required">*</span>
                </Label>
                <Input
                  type="tel"
                  placeholder="+233 XX XXX XXXX"
                  {...register('parentPhone', { 
                    required: 'Phone number is required',
                    pattern: { 
                      value: /^\+233\s?\d{2}\s?\d{3}\s?\d{4}$/,
                      message: 'Please enter a valid Ghanaian phone number'
                    }
                  })}
                  className={errors.parentPhone ? 'error' : ''}
                />
                {errors.parentPhone && <ErrorMessage>{errors.parentPhone.message}</ErrorMessage>}
              </InputGroup>

              <InputGroup>
                <Label>Email Address</Label>
                <Input
                  type="email"
                  placeholder="Enter email address"
                  {...register('parentEmail', {
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Please enter a valid email address'
                    }
                  })}
                  className={errors.parentEmail ? 'error' : ''}
                />
                {errors.parentEmail && <ErrorMessage>{errors.parentEmail.message}</ErrorMessage>}
              </InputGroup>

              <InputGroup>
                <Label>
                  Address <span className="required">*</span>
                </Label>
                <TextArea
                  placeholder="Enter residential address"
                  {...register('address', { 
                    required: 'Address is required',
                    minLength: { value: 10, message: 'Address must be at least 10 characters' }
                  })}
                  className={errors.address ? 'error' : ''}
                />
                {errors.address && <ErrorMessage>{errors.address.message}</ErrorMessage>}
              </InputGroup>

              <InputGroup>
                <Label>Emergency Contact Name</Label>
                <Input
                  type="text"
                  placeholder="Enter emergency contact name"
                  {...register('emergencyContact')}
                />
              </InputGroup>

              <InputGroup>
                <Label>Emergency Contact Phone</Label>
                <Input
                  type="tel"
                  placeholder="+233 XX XXX XXXX"
                  {...register('emergencyPhone', {
                    pattern: { 
                      value: /^\+233\s?\d{2}\s?\d{3}\s?\d{4}$/,
                      message: 'Please enter a valid Ghanaian phone number'
                    }
                  })}
                  className={errors.emergencyPhone ? 'error' : ''}
                />
                {errors.emergencyPhone && <ErrorMessage>{errors.emergencyPhone.message}</ErrorMessage>}
              </InputGroup>
            </FormGrid>
          </FormSection>

          {/* Medical Information */}
          <FormSection>
            <SectionHeader>
              <div className="icon">
                <FaHeartbeat />
              </div>
              <h3>Medical Information</h3>
            </SectionHeader>
            
            <FormGrid>
              <InputGroup>
                <Label>Medical Conditions</Label>
                <TextArea
                  placeholder="List any medical conditions or allergies"
                  {...register('medicalConditions')}
                />
              </InputGroup>

              <InputGroup>
                <Label>Allergies</Label>
                <TextArea
                  placeholder="List any allergies (food, medication, etc.)"
                  {...register('allergies')}
                />
              </InputGroup>

              <InputGroup>
                <Label>Blood Group</Label>
                <Select {...register('bloodGroup')}>
                  <option value="">Select blood group</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </Select>
              </InputGroup>

              <InputGroup>
                <Label>Medications</Label>
                <TextArea
                  placeholder="List any current medications"
                  {...register('medications')}
                />
              </InputGroup>
            </FormGrid>
          </FormSection>

          {/* Additional Information */}
          <FormSection>
            <SectionHeader>
              <div className="icon">
                <FaFileAlt />
              </div>
              <h3>Additional Information</h3>
            </SectionHeader>
            
            <FormGrid>
              <InputGroup>
                <Label>Special Needs</Label>
                <TextArea
                  placeholder="Any special needs or accommodations required"
                  {...register('specialNeeds')}
                />
              </InputGroup>

              <InputGroup>
                <Label>Additional Notes</Label>
                <TextArea
                  placeholder="Any additional information about the student"
                  {...register('additionalNotes')}
                />
              </InputGroup>
            </FormGrid>
          </FormSection>

          <FormActions>
            <ProgressIndicator>
              <span>Form Completion:</span>
              <ProgressBar>
                <ProgressFill progress={progress} />
              </ProgressBar>
              <span>{Math.round(progress)}%</span>
            </ProgressIndicator>
            
            <SubmitButton
              type="submit"
              disabled={isSubmitting}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isSubmitting ? (
                <>
                  <div className="spinner"></div>
                  Enrolling Student...
                </>
              ) : (
                <>
                  <FaSave />
                  Enroll Student
                </>
              )}
            </SubmitButton>
          </FormActions>
        </Form>
      </FormContainer>
    </EnrollmentContainer>
  );
};

export default StudentEnrollment;




