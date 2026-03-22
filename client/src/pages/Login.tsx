import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { login, clearError } from '../store/authSlice';
import { FaTelegramPlane } from 'react-icons/fa';

interface LoginForm {
  phoneNumber: string;
  password: string;
}

const Login = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading } = useAppSelector((state) => state.auth);
  const { register, handleSubmit } = useForm<LoginForm>();
  const [localError, setLocalError] = useState('');

  const onSubmit = async (data: LoginForm) => {
    setLocalError('');
    try {
      await dispatch(login(data)).unwrap();
      navigate('/');
    } catch (err) {
      setLocalError('Invalid credentials');
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
            type="password"
            placeholder="Password"
            {...register('password', { required: true })}
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Log in'}
          </button>
          {localError && <p className="error">{localError}</p>}
        </form>
        <p className="auth-footer">
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
