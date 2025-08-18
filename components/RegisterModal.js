// /components/RegisterModal.js
import React, { useState, useContext } from 'react'
import { GiPlayButton } from 'react-icons/gi'
import { useTranslation } from 'next-i18next'
import { UserContext } from '@/context/UserContext'
import GoogleAuthButton from '@/components/GoogleAuthButton'

export default function RegisterModal({ isOpen, onRequestClose, onRegister }) {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [usernameInput, setUsernameInput] = useState('')
	const { t } = useTranslation('common')
	const { refreshUser } = useContext(UserContext)

	if (!isOpen) return null

	const handleSubmit = async e => {
		e.preventDefault()

		try {
			const response = await fetch('/api/auth/register', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, password, username: usernameInput }),
				credentials: 'include',
			})

			const data = await response.json().catch(() => ({}))

			if (!response.ok) {
				const key = data?.error || 'server_error'
				alert(t(key))
				return
			}

			// sukces
			const ok = await refreshUser()
			if (ok) {
				alert(t('register_success')) // np. dodaj w tłumaczeniach
				onRegister?.()
				onRequestClose?.()
			} else {
				alert(t('profile_fetch_failed')) // np. dodaj w tłumaczeniach
			}
		} catch (err) {
			console.error(err)
			alert(t('server_error'))
		}
	}

	return (
		<div className="modalOverlay" onClick={onRequestClose}>
			<div className="modal-register" onClick={e => e.stopPropagation()}>
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
						<input type="text" value={usernameInput} onChange={e => setUsernameInput(e.target.value)} required />
					</div>
					<div>
						<label>{t('mail')}</label>
						<input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
					</div>
					<div>
						<label>{t('passw')}</label>
						<input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
					</div>
					<button type="submit" className="btn-to-reg">
						<GiPlayButton style={{ marginRight: '5px' }} />
						{t('regi')}
					</button>
				</form>
			</div>
		</div>
	)
}
