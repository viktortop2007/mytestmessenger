import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { register as registerUser, clearError } from '../store/authSlice';
import { FaTelegramPlane } from 'react-icons/fa';

interface RegisterForm {
  phoneNumber: string;
  username: string;
  firstName: string;
  lastName: string;
  password: string;
}

const Register = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading } = useAppSelector((state) => state.auth);
  const { register, handleSubmit } = useForm<RegisterForm>();
  const [localError, setLocalError] = useState('');

  const onSubmit = async (data: RegisterForm) => {
    setLocalError('');
    try {
      await dispatch(registerUser(data)).unwrap();
      navigate('/');
    } catch (err: any) {
      setLocalError(err.message || 'Registration failed');
      dispatch(clearError());
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <FaTelegramPlane size={48} color="#2b5278" />
          <h1>Telegram Web</h1>
        </div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <input
            type="tel"
            placeholder="Phone number"
            {...register('phoneNumber', { required: true })}
          />
          <input
            type="text"
            placeholder="Username"
            {...register('username', { required: true })}
          />
          <input
            type="text"
            placeholder="First name"
            {...register('firstName', { required: true })}
          />
          <input
            type="text"
            placeholder="Last name"
            {...register('lastName', { required: true })}
          />
          <input
            type="password"
            placeholder="Password"
            {...register('password', { required: true, minLength: 6 })}
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Registering...' : 'Create account'}
          </button>
          {localError && <p className="error">{localError}</p>}
        </form>
        <p className="auth-footer">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
