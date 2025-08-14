import { useState, useEffect, useContext } from 'react'
import LoginModal from './LoginModal'
import RegisterModal from './RegisterModal'
import { UserContext } from '@/context/UserContext'
import UserPanel from '@/components/UserPanel'
import { GiPlayButton } from 'react-icons/gi'
import { useTranslation } from 'next-i18next'
import LanguageSwitcher from './LanguageSwitcher'
import Link from 'next/link'

export default function NavBar({ onLanguageChange }) {
	const [isRegisterModalOpen, setRegisterModalOpen] = useState(false)
	const [isLoginModalOpen, setLoginModalOpen] = useState(false) // nie otwieraj od razu
	const [isUserPanelVisible, setUserPanelVisible] = useState(false)
	const [isMobileMenuOpen, setMobileMenuOpen] = useState(false)
	const [isMobileLinksMenuOpen, setMobileLinksMenuOpen] = useState(false)
	const [isClient, setIsClient] = useState(false)
	const [isSportsOpen, setIsSportsOpen] = useState(false)

	const { t } = useTranslation('common')

	// NOWY kontekst
	const { user, isAuthed, setUser, setIsAuthed, refreshUser } = useContext(UserContext)

	useEffect(() => {
		setIsClient(true)
	}, [])

	// po udanym loginie/registracji odśwież usera z /api/auth/me
	const handleLogin = async () => {
		await refreshUser()
		setLoginModalOpen(false)
		setMobileMenuOpen(false)
	}

	const handleRegister = async () => {
		await refreshUser()
		setRegisterModalOpen(false)
		setMobileMenuOpen(false)
	}

	const handleLogout = async () => {
		try {
			const res = await fetch('/api/auth/logout', {
				method: 'POST',
				credentials: 'include',
			})
			if (res.ok) {
				setUser(null)
				setIsAuthed(false)
				setMobileMenuOpen(false)
			} else {
				console.error('Nie udało się wylogować')
			}
		} catch (error) {
			console.error('Błąd podczas wylogowywania:', error)
		}
	}

	return (
		<>
			<div className="menu">
				<div className="language-switch">
					<LanguageSwitcher onLanguageChange={onLanguageChange} />
				</div>

				<div className="logo-and-menubutton">
					<div className="menubutton">
						<div className="mobile-menu">
							<Link href="/" className="logo">
								<img src="/img/logo-czat-sportowy-pl.png" alt="Czat Sportowy" />
							</Link>

							<div className="elementsinmenu">
								{isMobileMenuOpen ? (
									<img
										src="/img/cross.png"
										className="menu-icon"
										alt="close"
										onClick={() => {
											setMobileMenuOpen(false)
											setRegisterModalOpen(false)
											setLoginModalOpen(false)
										}}
									/>
								) : (
									<img
										src="/img/user.png"
										className="menu-icon"
										alt="user menu"
										onClick={() => {
											setMobileMenuOpen(true)
											setLoginModalOpen(!isAuthed) // pokaż login tylko gdy niezalogowany
											setMobileLinksMenuOpen(false)
										}}
									/>
								)}

								{isMobileLinksMenuOpen ? (
									<img
										src="/img/cross.png"
										className="menu-icon"
										alt="close links"
										onClick={() => setMobileLinksMenuOpen(false)}
									/>
								) : (
									<img
										src="/img/menu-bar.png"
										className="menu-icon"
										alt="links"
										onClick={() => {
											setMobileLinksMenuOpen(true)
											setMobileMenuOpen(false)
										}}
									/>
								)}
							</div>
						</div>

						{isMobileMenuOpen && (
							<div className="mobile-dropdown">
								{isAuthed ? (
									<>
										<UserPanel />
										<button onClick={handleLogout} className="log-out-btn">
											<GiPlayButton /> {t('out')}
										</button>
									</>
								) : (
									<>
										<div className="elements-in-account-menu">
											<LoginModal
												isOpen={isLoginModalOpen}
												// onRequestClose={() => setLoginModalOpen(false)}
												onLogin={handleLogin} // po sukcesie: refreshUser + zamknij
											/>

											<div className="to-register-now">
												<button
													onClick={() => {
														setRegisterModalOpen(true)
														setLoginModalOpen(false)
													}}
													className="btn-reg">
													<GiPlayButton /> {t('registernow')}
												</button>
											</div>

											<RegisterModal
												isOpen={isRegisterModalOpen}
												onRequestClose={() => {
													setRegisterModalOpen(false)
													setLoginModalOpen(true)
												}}
												onRegister={handleRegister} // po sukcesie: refreshUser + zamknij
											/>
										</div>
									</>
								)}
							</div>
						)}

						{isMobileLinksMenuOpen && (
							<div className="mobile-dropdown" id="mobile-links-menu">
								<div className="real-links">
									<Link href="/" className="mobile-item">
										{t('mainpage')}
									</Link>

									<button
										className="mobile-item collapse-trigger"
										onClick={() => setIsSportsOpen(v => !v)}
										aria-expanded={isSportsOpen}
										aria-controls="sports-submenu">
										{t('sportscategory')}
										<span className={`chev ${isSportsOpen ? 'open' : ''}`}>▾</span>
									</button>

									{isSportsOpen && (
										<div id="sports-submenu" className="mobile-submenu">
											<Link href="/pilka-nozna/przedmeczowe" className="mobile-subitem">
												<img src="/img/football.png" width="20" /> {t('footbalitemmenu')}
											</Link>
										</div>
									)}
								</div>
							</div>
						)}
					</div>
				</div>
			</div>
		</>
	)
}
