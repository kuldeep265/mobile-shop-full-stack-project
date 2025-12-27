import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaEnvelope, FaLock } from 'react-icons/fa';
import AuthContext from '../context/AuthContext';
import AnimatedContainer from '../components/ui/AnimatedContainer';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import GoogleAuthButton from '../components/GoogleAuthButton';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const { email, password } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(formData);
      toast.success('Login successful!');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <AnimatedContainer animation="fadeIn" className="max-w-md w-full">
        <Card className="p-8">
          <AnimatedContainer animation="bounceIn" delay={200}>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
                Welcome Back
              </h2>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Sign in to your account
              </p>
            </div>
          </AnimatedContainer>
          
          <form className="space-y-6" onSubmit={onSubmit}>
            <AnimatedContainer animation="slideInLeft" delay={400}>
              <Input
                label="Email Address"
                type="email"
                name="email"
                value={email}
                onChange={onChange}
                icon={FaEnvelope}
                placeholder="Enter your email"
                required
              />
            </AnimatedContainer>

            <AnimatedContainer animation="slideInRight" delay={600}>
              <Input
                label="Password"
                type="password"
                name="password"
                value={password}
                onChange={onChange}
                icon={FaLock}
                placeholder="Enter your password"
                required
              />
            </AnimatedContainer>

            <AnimatedContainer animation="fadeIn" delay={800}>
              <div className="flex items-center justify-between">
                <Link
                  to="/forgot-password"
                  className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors duration-200"
                >
                  Forgot your password?
                </Link>
              </div>
            </AnimatedContainer>

            <AnimatedContainer animation="fadeIn" delay={1000}>
              <Button
                type="submit"
                size="lg"
                className="w-full"
                loading={loading}
              >
                Sign In
              </Button>
            </AnimatedContainer>

            <AnimatedContainer animation="fadeIn" delay={1100}>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-gray-600" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                    Or continue with
                  </span>
                </div>
              </div>
            </AnimatedContainer>

            <AnimatedContainer animation="fadeIn" delay={1200}>
              <GoogleAuthButton text="Sign in with Google" />
            </AnimatedContainer>

            <AnimatedContainer animation="fadeIn" delay={1300}>
              <div className="text-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Don't have an account?{' '}
                  <Link 
                    to="/register" 
                    className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors duration-200"
                  >
                    Sign up
                  </Link>
                </span>
              </div>
            </AnimatedContainer>
          </form>
        </Card>
      </AnimatedContainer>
    </div>
  );
};

export default Login;

