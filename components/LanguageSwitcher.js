import { useRouter } from 'next/router'
import { useContext } from 'react'
import { UserContext } from '@/context/UserContext'

export default function LanguageSwitcher({ onLanguageChange }) {
  const router = useRouter()
  const { setLanguage } = useContext(UserContext)

  const changeLanguage = (lng) => {
    try { localStorage.setItem('language', lng) } catch {}
    onLanguageChange?.()
    setLanguage?.(lng)
    router.push(router.asPath, router.asPath, { locale: lng })
  }

  return (
    <div className="languageswitchers">
      <button onClick={() => changeLanguage('en')} className="buttonlng">
        <img src="/img/united-kingdom.png" className="languageimg" alt="English" />
      </button>
      <button onClick={() => changeLanguage('pl')} className="buttonlng">
        <img src="/img/poland.png" className="languageimg" alt="Polski" />
      </button>
    </div>
  )
}

