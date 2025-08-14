// /components/RegisterModal.js
import React, { useState, useContext } from 'react';
import { GiPlayButton } from 'react-icons/gi';
import { useTranslation } from 'next-i18next'
import { UserContext } from '@/context/UserContext';
import GoogleAuthButton from '@/components/GoogleAuthButton';

export default function RegisterModal({ isOpen, onRequestClose, onRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [usernameInput, setUsernameInput] = useState('');
  const { t } = useTranslation('common');
  const { refreshUser } = useContext(UserContext);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, username: usernameInput }),
      credentials: 'include',
    });

    if (response.ok) {
      const ok = await refreshUser();
      if (ok) {
        alert(`Pomyślnie zarejestrowano!`);
        onRegister?.();
        onRequestClose?.();
      } else {
        alert('Zarejestrowano, ale nie udało się pobrać profilu.');
      }
    } else {
      const errorMessage = await response.text();
      alert(errorMessage);
    }
  };

  return (
    <div className="modalOverlay" onClick={onRequestClose}>
      <div className="modal-register" onClick={(e) => e.stopPropagation()}>
        <h2>{t('register')}</h2>

        {/* Google register/login */}
        <div className="mb-3">
          <GoogleAuthButton onSuccessClose={onRequestClose} onLogin={onRegister} />
        </div>

        <div className="or-div">
          <span>— {t('or')} —</span>
        </div>

        <form onSubmit={handleSubmit}>
          <div>
            <label>{t('usern')}</label>
            <input
              type="text"
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              required
            />
          </div>
          <div>
            <label>{t('mail')}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label>{t('passw')}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn-to-reg">
            <GiPlayButton style={{ marginRight: '5px' }} />
            {t('regi')}
          </button>
        </form>
      </div>
    </div>
  );
}
