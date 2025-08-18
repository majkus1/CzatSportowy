// /pages/reset-password.js
import { useRouter } from 'next/router'
import { GiPlayButton } from 'react-icons/gi'
import { useState } from 'react'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useTranslation } from 'next-i18next'
import NavBar from '@/components/NavBar'

export default function ResetPasswordPage() {
	const { t } = useTranslation('common')
	const router = useRouter()
	const { uid, token } = router.query

	const [pwd, setPwd] = useState('')
	const [pwd2, setPwd2] = useState('')
	const [submitting, setSubmitting] = useState(false)
	const [done, setDone] = useState(false)
	const [error, setError] = useState('')

	const onSubmit = async e => {
		e.preventDefault()
		setError('')

		if (pwd.length < 8) {
			setError(t('pwd_too_short') || 'Hasło musi mieć co najmniej 8 znaków')
			return
		}
		if (pwd !== pwd2) {
			setError(t('pwd_mismatch') || 'Hasła nie są takie same')
			return
		}

		setSubmitting(true)
		try {
			const res = await fetch('/api/auth/reset-password', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify({ uid, token, newPassword: pwd }),
			})
			const data = await res.json()
			if (data.ok) {
				setDone(true)
			} else {
				setError(t('link_invalid') || 'Link jest nieprawidłowy lub wygasł')
			}
		} catch (_) {
			setError(t('something_wrong') || 'Coś poszło nie tak')
		} finally {
			setSubmitting(false)
		}
	}

	if (!uid || !token) {
		return <p>{t('link_invalid') || 'Link jest nieprawidłowy'}</p>
	}

	if (done) {
		return (
			<>
				<NavBar />

				<div id="reset-password-page">
					<h2>{t('pwd_changed') || 'Hasło zmienione'}</h2>
					<p>{t('pwd_changed_desc') || 'Możesz zalogować się nowym hasłem.'}</p>
				</div>
			</>
		)
	}

	return (
		<>
			<NavBar />

			<div id="reset-password-page">
				<h2>{t('set_new_pwd') || 'Ustaw nowe hasło'}</h2>
				<form onSubmit={onSubmit}>
					<div style={{ marginBottom: 12 }}>
						<label>{t('new_password') || 'Nowe hasło'}</label>
						<input type="password" value={pwd} onChange={e => setPwd(e.target.value)} required />
					</div>
					<div style={{ marginBottom: 12 }}>
						<label>{t('repeat_password') || 'Powtórz hasło'}</label>
						<input type="password" value={pwd2} onChange={e => setPwd2(e.target.value)} required />
					</div>
					{error && <p style={{ color: 'crimson' }}>{error}</p>}
					<button type="submit" disabled={submitting} className="btn-to-save-password">
						<GiPlayButton style={{ marginRight: '5px' }} />{' '}
						{submitting ? t('saving') || 'Zapisywanie...' : t('save') || 'Zapisz'}
					</button>
				</form>
			</div>
		</>
	)
}

// i18n (jeśli używasz next-i18next)
export async function getServerSideProps({ locale }) {
	return { props: { ...(await serverSideTranslations(locale ?? 'pl', ['common'])) } }
}
