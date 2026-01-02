'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SuccessCelebrationProps {
  message?: string;
  subMessage?: string;
  xpEarned?: number;
  coinsEarned?: number;
  onContinue: () => void;
  autoCloseDelay?: number;
}

export default function SuccessCelebration({
  message = "Fantastic job!",
  subMessage = "You're becoming a coding superstar!",
  xpEarned = 10,
  coinsEarned = 5,
  onContinue,
  autoCloseDelay
}: SuccessCelebrationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // Generate confetti particles with useMemo to avoid regenerating on each render
  const confettiParticles = useMemo(() => {
    const colors = ['#FF79C6', '#8BE9FD', '#50FA7B', '#FFB86C', '#BD93F9', '#F1FA8C'];
    return Array.from({ length: 50 }, (_, i) => ({
      id: i,
      color: colors[i % colors.length],
      left: Math.random() * 100,
      delay: Math.random() * 0.5,
      duration: 1 + Math.random() * 2,
      isCircle: i % 2 === 0
    }));
  }, []);

  useEffect(() => {
    // Trigger entrance animation
    const visibleTimer = setTimeout(() => setIsVisible(true), 50);
    const confettiTimer = setTimeout(() => setShowConfetti(true), 300);

    // Auto-close if specified
    let autoCloseTimer: NodeJS.Timeout | undefined;
    if (autoCloseDelay) {
      autoCloseTimer = setTimeout(() => {
        handleContinue();
      }, autoCloseDelay);
    }

    return () => {
      clearTimeout(visibleTimer);
      clearTimeout(confettiTimer);
      if (autoCloseTimer) clearTimeout(autoCloseTimer);
    };
  }, [autoCloseDelay]);

  const handleContinue = () => {
    setIsVisible(false);
    setTimeout(onContinue, 300);
  };

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isVisible ? 1 : 0 }}
        exit={{ opacity: 0 }}
        onClick={handleContinue}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(30, 30, 46, 0.9)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {/* Confetti */}
        {showConfetti && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            overflow: 'hidden',
            pointerEvents: 'none'
          }}>
            {confettiParticles.map((particle) => (
              <motion.div
                key={particle.id}
                initial={{ y: -20, opacity: 1, rotate: 0 }}
                animate={{
                  y: '100vh',
                  opacity: 0,
                  rotate: 720
                }}
                transition={{
                  duration: particle.duration,
                  delay: particle.delay,
                  ease: 'easeOut'
                }}
                style={{
                  position: 'absolute',
                  left: `${particle.left}%`,
                  width: '10px',
                  height: '10px',
                  backgroundColor: particle.color,
                  borderRadius: particle.isCircle ? '50%' : '2px'
                }}
              />
            ))}
          </div>
        )}

        {/* Celebration Card */}
        <motion.div
          initial={{ scale: 0.8, y: 20 }}
          animate={{
            scale: isVisible ? 1 : 0.8,
            y: isVisible ? 0 : 20
          }}
          onClick={(e) => e.stopPropagation()}
          style={{
            backgroundColor: '#2A2A3E',
            borderRadius: '24px',
            padding: '32px',
            maxWidth: '380px',
            width: '90%',
            textAlign: 'center',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(255, 121, 198, 0.2)',
            border: '2px solid #50FA7B'
          }}
        >
          {/* Robot Character */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, ease: 'easeInOut' }}
            style={{ fontSize: '80px', marginBottom: '16px' }}
          >
            *
          </motion.div>

          {/* Stars around robot */}
          <div style={{
            position: 'relative',
            marginTop: '-100px',
            marginBottom: '20px',
            height: '20px'
          }}>
            <motion.span
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: 'spring' }}
              style={{
                position: 'absolute',
                left: '20%',
                fontSize: '24px'
              }}
            >
              *
            </motion.span>
            <motion.span
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.4, type: 'spring' }}
              style={{
                position: 'absolute',
                right: '20%',
                fontSize: '24px'
              }}
            >
              *
            </motion.span>
            <motion.span
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.3, type: 'spring' }}
              style={{
                position: 'absolute',
                left: '50%',
                transform: 'translateX(-50%)',
                top: '-30px',
                fontSize: '28px'
              }}
            >
              *
            </motion.span>
          </div>

          {/* Main Message */}
          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            style={{
              color: '#50FA7B',
              fontSize: '2rem',
              fontWeight: 700,
              margin: '0 0 8px 0',
              textShadow: '0 0 20px rgba(80, 250, 123, 0.5)'
            }}
          >
            {message}
          </motion.h2>

          {/* Sub Message */}
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            style={{
              color: '#F8F8F2',
              fontSize: '1.1rem',
              margin: '0 0 20px 0'
            }}
          >
            {subMessage}
          </motion.p>

          {/* Rewards */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '24px',
            marginBottom: '24px'
          }}>
            {/* XP Earned */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: 'spring' }}
              style={{
                backgroundColor: 'rgba(255, 184, 108, 0.2)',
                border: '2px solid #FFB86C',
                borderRadius: '12px',
                padding: '12px 20px'
              }}
            >
              <div style={{ color: '#FFB86C', fontSize: '1.5rem', fontWeight: 700 }}>
                +{xpEarned} XP
              </div>
              <div style={{ color: '#9292A8', fontSize: '0.8rem' }}>Experience</div>
            </motion.div>

            {/* Coins Earned */}
            {coinsEarned > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.7, type: 'spring' }}
                style={{
                  backgroundColor: 'rgba(241, 250, 140, 0.2)',
                  border: '2px solid #F1FA8C',
                  borderRadius: '12px',
                  padding: '12px 20px'
                }}
              >
                <div style={{ color: '#F1FA8C', fontSize: '1.5rem', fontWeight: 700 }}>
                  +{coinsEarned} *
                </div>
                <div style={{ color: '#9292A8', fontSize: '0.8rem' }}>Coins</div>
              </motion.div>
            )}
          </div>

          {/* Continue Button */}
          <motion.button
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            whileHover={{ scale: 1.05, boxShadow: '0 6px 30px rgba(255, 121, 198, 0.6)' }}
            whileTap={{ scale: 0.95 }}
            onClick={handleContinue}
            style={{
              backgroundColor: '#FF79C6',
              color: '#1E1E2E',
              border: 'none',
              borderRadius: '30px',
              padding: '16px 40px',
              fontSize: '1.1rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              boxShadow: '0 4px 20px rgba(255, 121, 198, 0.4)'
            }}
          >
            Let's Keep Going!
            <span style={{ fontSize: '1.3rem' }}>*</span>
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
