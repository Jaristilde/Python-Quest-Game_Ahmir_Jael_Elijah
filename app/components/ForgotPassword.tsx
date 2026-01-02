'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, Key, Lock, Check, AlertCircle } from 'lucide-react';
import { initiatePasswordReset, verifyResetCode, resetPassword, validatePassword } from '../lib/auth';

interface ForgotPasswordProps {
  onBack: () => void;
  onSuccess: () => void;
}

type Step = 'username' | 'code' | 'newPassword';

export default function ForgotPassword({ onBack, onSuccess }: ForgotPasswordProps) {
  const [step, setStep] = useState<Step>('username');
  const [username, setUsername] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong'>('weak');
  const [passwordSuggestions, setPasswordSuggestions] = useState<string[]>([]);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = initiatePasswordReset(username);

      if (!result.success) {
        if (result.error === 'USERNAME_NOT_FOUND') {
          setError('We couldn\'t find an account with that username. Check your spelling or sign up for a new account!');
        } else {
          setError('Something went wrong. Please try again.');
        }
        setIsLoading(false);
        return;
      }

      // For demo purposes, show the code in an alert
      // In production, this would be sent via email
      alert(`Your reset code is: ${result.code}\n\n(In a real app, this would be sent to your email!)`);
      setStep('code');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = verifyResetCode(username, resetCode);

      if (!result.success) {
        setError(result.error || 'Invalid code. Please try again.');
        setIsLoading(false);
        return;
      }

      setStep('newPassword');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = (value: string) => {
    setNewPassword(value);
    const validation = validatePassword(value);
    setPasswordStrength(validation.strength);
    setPasswordSuggestions(validation.suggestions || []);
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Your passwords don\'t match. Try typing them again!');
      return;
    }

    const validation = validatePassword(newPassword);
    if (!validation.isValid) {
      setError('Your password needs to be stronger. Check the suggestions above!');
      return;
    }

    setIsLoading(true);

    try {
      const result = resetPassword(username, resetCode, newPassword);

      if (!result.success) {
        setError(result.error || 'Something went wrong. Please try again.');
        setIsLoading(false);
        return;
      }

      // Success!
      onSuccess();
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getStrengthColor = () => {
    switch (passwordStrength) {
      case 'strong': return '#50FA7B';
      case 'medium': return '#FFB86C';
      default: return '#FF5555';
    }
  };

  const getStrengthWidth = () => {
    switch (passwordStrength) {
      case 'strong': return '100%';
      case 'medium': return '66%';
      default: return '33%';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        backgroundColor: '#2A2A3E',
        borderRadius: '20px',
        padding: '32px',
        maxWidth: '400px',
        margin: '0 auto'
      }}
    >
      {/* Header */}
      <button
        onClick={onBack}
        style={{
          background: 'none',
          border: 'none',
          color: '#8BE9FD',
          cursor: 'pointer',
          marginBottom: '16px',
          fontSize: '0.9rem',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}
      >
        <ArrowLeft size={16} /> Back to Login
      </button>

      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <motion.div
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ fontSize: '48px', marginBottom: '12px' }}
        >
          {step === 'username' ? <Key size={48} style={{ color: '#FF79C6' }} /> :
           step === 'code' ? <Mail size={48} style={{ color: '#8BE9FD' }} /> :
           <Lock size={48} style={{ color: '#50FA7B' }} />}
        </motion.div>
        <h2 style={{ color: '#F8F8F2', margin: 0 }}>
          {step === 'username' ? 'Reset Your Password' :
           step === 'code' ? 'Enter Your Code' :
           'Create New Password'}
        </h2>
      </div>

      {/* Error Display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            backgroundColor: 'rgba(255, 85, 85, 0.1)',
            border: '1px solid #FF5555',
            borderRadius: '12px',
            padding: '12px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px'
          }}
        >
          <AlertCircle size={18} style={{ color: '#FF5555', flexShrink: 0, marginTop: '2px' }} />
          <span style={{ color: '#FF5555', fontSize: '0.9rem' }}>{error}</span>
        </motion.div>
      )}

      {/* Step 1: Enter Username */}
      {step === 'username' && (
        <form onSubmit={handleSendCode}>
          <p style={{ color: '#9292A8', marginBottom: '16px', fontSize: '0.9rem' }}>
            Enter your username and we'll send you a special code to reset your password.
          </p>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ color: '#8BE9FD', display: 'block', marginBottom: '6px', fontSize: '0.9rem' }}>
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="Enter your username"
              style={{
                width: '100%',
                padding: '12px 16px',
                backgroundColor: '#1E1E2E',
                border: '2px solid #44475A',
                borderRadius: '10px',
                color: '#F8F8F2',
                fontSize: '1rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor: isLoading ? '#6272A4' : '#FF79C6',
              border: 'none',
              borderRadius: '12px',
              color: '#1E1E2E',
              fontWeight: 600,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <Mail size={18} />
            {isLoading ? 'Sending...' : 'Send Reset Code'}
          </button>
        </form>
      )}

      {/* Step 2: Enter Code */}
      {step === 'code' && (
        <form onSubmit={handleVerifyCode}>
          <p style={{ color: '#50FA7B', marginBottom: '16px', fontSize: '0.9rem' }}>
            <Check size={16} style={{ display: 'inline', marginRight: '4px' }} />
            Code sent! Check the popup (or your email in production).
          </p>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ color: '#8BE9FD', display: 'block', marginBottom: '6px', fontSize: '0.9rem' }}>
              Enter your 6-digit code
            </label>
            <input
              type="text"
              value={resetCode}
              onChange={(e) => setResetCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              required
              placeholder="000000"
              maxLength={6}
              style={{
                width: '100%',
                padding: '16px',
                backgroundColor: '#1E1E2E',
                border: '2px solid #44475A',
                borderRadius: '10px',
                color: '#F8F8F2',
                fontSize: '1.5rem',
                textAlign: 'center',
                letterSpacing: '0.5em',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || resetCode.length !== 6}
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor: isLoading || resetCode.length !== 6 ? '#6272A4' : '#8BE9FD',
              border: 'none',
              borderRadius: '12px',
              color: '#1E1E2E',
              fontWeight: 600,
              cursor: isLoading || resetCode.length !== 6 ? 'not-allowed' : 'pointer'
            }}
          >
            {isLoading ? 'Verifying...' : 'Verify Code'}
          </button>
          <button
            type="button"
            onClick={() => handleSendCode({ preventDefault: () => {} } as React.FormEvent)}
            style={{
              width: '100%',
              padding: '10px',
              backgroundColor: 'transparent',
              border: 'none',
              color: '#8BE9FD',
              marginTop: '12px',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            Didn't get a code? Send again
          </button>
        </form>
      )}

      {/* Step 3: New Password */}
      {step === 'newPassword' && (
        <form onSubmit={handleResetPassword}>
          <p style={{ color: '#50FA7B', marginBottom: '16px', fontSize: '0.9rem' }}>
            <Check size={16} style={{ display: 'inline', marginRight: '4px' }} />
            Code verified! Now create your new password.
          </p>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ color: '#8BE9FD', display: 'block', marginBottom: '6px', fontSize: '0.9rem' }}>
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => handlePasswordChange(e.target.value)}
              required
              placeholder="Create a strong password"
              style={{
                width: '100%',
                padding: '12px 16px',
                backgroundColor: '#1E1E2E',
                border: '2px solid #44475A',
                borderRadius: '10px',
                color: '#F8F8F2',
                fontSize: '1rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />

            {/* Password Strength Indicator */}
            {newPassword && (
              <div style={{ marginTop: '8px' }}>
                <div style={{
                  height: '4px',
                  backgroundColor: '#44475A',
                  borderRadius: '2px',
                  overflow: 'hidden'
                }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: getStrengthWidth() }}
                    style={{
                      height: '100%',
                      backgroundColor: getStrengthColor(),
                      borderRadius: '2px'
                    }}
                  />
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginTop: '4px',
                  fontSize: '0.75rem'
                }}>
                  <span style={{ color: getStrengthColor() }}>
                    {passwordStrength === 'strong' ? 'Strong!' :
                     passwordStrength === 'medium' ? 'Getting better...' : 'Too weak'}
                  </span>
                </div>

                {/* Suggestions */}
                {passwordSuggestions.length > 0 && (
                  <ul style={{
                    marginTop: '8px',
                    paddingLeft: '16px',
                    color: '#FFB86C',
                    fontSize: '0.8rem'
                  }}>
                    {passwordSuggestions.map((suggestion, i) => (
                      <li key={i} style={{ marginBottom: '2px' }}>{suggestion}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ color: '#8BE9FD', display: 'block', marginBottom: '6px', fontSize: '0.9rem' }}>
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Type your password again"
              style={{
                width: '100%',
                padding: '12px 16px',
                backgroundColor: '#1E1E2E',
                border: `2px solid ${confirmPassword && confirmPassword !== newPassword ? '#FF5555' : '#44475A'}`,
                borderRadius: '10px',
                color: '#F8F8F2',
                fontSize: '1rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
            {confirmPassword && confirmPassword !== newPassword && (
              <p style={{ color: '#FF5555', fontSize: '0.8rem', marginTop: '4px' }}>
                Passwords don't match yet
              </p>
            )}
            {confirmPassword && confirmPassword === newPassword && newPassword.length >= 6 && (
              <p style={{ color: '#50FA7B', fontSize: '0.8rem', marginTop: '4px' }}>
                <Check size={14} style={{ display: 'inline', marginRight: '4px' }} />
                Passwords match!
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading || newPassword !== confirmPassword || !validatePassword(newPassword).isValid}
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor: isLoading ? '#6272A4' : '#50FA7B',
              border: 'none',
              borderRadius: '12px',
              color: '#1E1E2E',
              fontWeight: 600,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <Lock size={18} />
            {isLoading ? 'Updating...' : 'Set New Password'}
          </button>
        </form>
      )}
    </motion.div>
  );
}
