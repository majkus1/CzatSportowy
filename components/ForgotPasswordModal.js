// // /components/ForgotPasswordModal.jsx
// import { useState } from 'react'
// import { useTranslation } from 'next-i18next'
// import Modal from './Modal'

// export default function ForgotPasswordModal({ isOpen, onRequestClose }) {
//   const { t } = useTranslation('common')
//   const [email, setEmail] = useState('')
//   const [sending, setSending] = useState(false)
//   const [sent, setSent] = useState(false)

//   if (!isOpen) return null

//   const onSubmit = async (e) => {
//     e.preventDefault()
//     setSending(true)
//     try {
//       await fetch('/api/auth/forgot-password', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         credentials: 'include',
//         body: JSON.stringify({ email }),
//       })
//       // Zawsze sukces — nie ujawniamy, czy email istnieje
//       setSent(true)
//     } catch (_) {
//       setSent(true)
//     } finally {
//       setSending(false)
//     }
//   }

//   return (
//     <Modal onClose={onRequestClose}>
//       <h2 style={{ marginTop: 0 }}>{t('forgot_title') || 'Reset hasła'}</h2>
//       {sent ? (
//         <p>{t('forgot_sent') || 'Jeśli podany adres istnieje w systemie, wysłaliśmy link do resetu hasła.'}</p>
//       ) : (
//         <form onSubmit={onSubmit} className="form">
//           <label style={{ display: 'block', marginBottom: 6 }}>
//             {t('email') || 'Email'}
//           </label>
//           <input
//             type="email"
//             required
//             value={email}
//             onChange={(e)=>setEmail(e.target.value)}
//             placeholder={t('email_placeholder') || 'twoj@mail.com'}
//           />
//           <button type="submit" disabled={sending} className="btn-to-login" style={{ marginTop: 12 }}>
//             {sending ? (t('sending') || 'Wysyłanie...') : (t('send_reset_link') || 'Wyślij link resetujący')}
//           </button>
//         </form>
//       )}
//     </Modal>
//   )
// }
// /components/ForgotPasswordModal.jsx
import { useState } from 'react'
import { useTranslation } from 'next-i18next'
import { GiPlayButton } from 'react-icons/gi'

export default function ForgotPasswordModal({ isOpen, onRequestClose }) {
  const { t } = useTranslation('common')
  const [email, setEmail] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen) return null

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSending(true)
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email }),
      })
      // Celowo nie zdradzamy czy email istnieje
      setSent(true)
    } catch (err) {
      setError(t('something_wrong') || 'Coś poszło nie tak')
    } finally {
      setSending(false)
    }
  }

  return (
    <div
      className="modalOverlay"
      onClick={() => {
        // reset po zamknięciu (opcjonalnie)
        setEmail('')
        setSent(false)
        setError('')
        onRequestClose?.()
      }}
    >
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ marginTop: 20, marginBottom: 15 }}>
          {t('forgot_title')}
        </h2>

        {sent ? (
          <p>
            {t('forgot_sent')}
          </p>
        ) : (
          <form onSubmit={onSubmit}>
            <div className="mb-3">
              <label>{t('mail')}</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e)=>setEmail(e.target.value)}
              />
            </div>

            {error && <p style={{ color: 'crimson', marginTop: 8 }}>{error}</p>}

            <button type="submit" className="btn-to-login" disabled={sending}>
              <GiPlayButton style={{ marginRight: '5px' }} />
              {sending ? (t('sending') || 'Wysyłanie...') : (t('send_reset_link') || 'Wyślij link resetujący')}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
