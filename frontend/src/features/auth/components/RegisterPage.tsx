import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Zap } from 'lucide-react';
import { toast } from 'react-toastify';

import { useRegister } from '../hooks/useRegister';

export const RegisterPage = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { registerMutation } = useRegister();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName || !email || !password || !confirmPassword) {
      toast.warning('Please fill in all fields', { toastId: 'form-validation' });
      return;
    }

    if (password !== confirmPassword) {
      toast.warning('Passwords do not match', { toastId: 'form-validation' });
      return;
    }

    registerMutation.mutate({ email, password, confirmPassword, fullName });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg p-4">
      <div className="card w-full max-w-md">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Zap className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold font-display">Siren</h1>
          </div>
          <p className="text-text-secondary text-sm">Create your account</p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div>
            <label className="label">Full Name</label>
            <input
              type="text"
              className="input-field"
              placeholder="John Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          <div>
            <label className="label">Email</label>
            <input
              type="email"
              className="input-field"
              placeholder="user@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="label">Password</label>
            <input
              type="password"
              className="input-field"
              placeholder="Min 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div>
            <label className="label">Confirm Password</label>
            <input
              type="password"
              className="input-field"
              placeholder="Repeat password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="btn-primary w-full"
            disabled={registerMutation.isPending}
          >
            {registerMutation.isPending ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <p className="text-center text-sm text-text-secondary mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};
