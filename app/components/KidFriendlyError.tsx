'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';

interface KidFriendlyErrorProps {
  title: string;
  explanation: string;
  tip: string;
  emoji: string;
  onTryAgain: () => void;
}

export default function KidFriendlyError({
  title,
  explanation,
  tip,
  emoji,
  onTryAgain
}: KidFriendlyErrorProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="kid-error-container"
      style={{
        backgroundColor: 'rgba(255, 85, 85, 0.1)',
        border: '2px solid #FF5555',
        borderRadius: '16px',
        padding: '20px',
        margin: '16px 0'
      }}
    >
      {/* Error Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '16px'
      }}>
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.1 }}
          style={{
            fontSize: '32px',
            width: '50px',
            height: '50px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(255, 85, 85, 0.2)',
            borderRadius: '12px'
          }}
        >
          {emoji === "'" ? "'" :
           emoji === ")" ? ")" :
           emoji === "(" ? "(" :
           emoji === "\"" ? '"' :
           emoji === ":" ? ":" :
           emoji === " " ? " " :
           emoji === "()" ? "()" :
           emoji === "\"\"" ? '""' :
           emoji === "p" ? "p" :
           emoji === "?" ? "?" : emoji}
        </motion.span>
        <h3 style={{
          color: '#FF79C6',
          margin: 0,
          fontSize: '1.2rem',
          fontWeight: 600,
          flex: 1
        }}>
          {title}
        </h3>
      </div>

      {/* Explanation */}
      <div style={{
        backgroundColor: '#2A2A3E',
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '16px'
      }}>
        <p style={{
          color: '#F8F8F2',
          margin: 0,
          fontSize: '1rem',
          lineHeight: '1.6'
        }}>
          {explanation}
        </p>
      </div>

      {/* Tip Box */}
      <div style={{
        backgroundColor: 'rgba(139, 233, 253, 0.1)',
        border: '1px solid #8BE9FD',
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '16px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '10px'
        }}>
          <span style={{ fontSize: '20px' }}>*</span>
          <div>
            <span style={{
              color: '#8BE9FD',
              fontWeight: 600,
              display: 'block',
              marginBottom: '4px'
            }}>
              Tip:
            </span>
            <span style={{
              color: '#50FA7B',
              fontSize: '0.95rem'
            }}>
              {tip}
            </span>
          </div>
        </div>
      </div>

      {/* Try Again Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onTryAgain}
        style={{
          backgroundColor: '#FF79C6',
          color: '#1E1E2E',
          border: 'none',
          borderRadius: '25px',
          padding: '12px 32px',
          fontSize: '1rem',
          fontWeight: 600,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          margin: '0 auto',
          boxShadow: '0 4px 20px rgba(255, 121, 198, 0.4)'
        }}
      >
        <RefreshCw size={18} />
        Try Again!
      </motion.button>
    </motion.div>
  );
}
