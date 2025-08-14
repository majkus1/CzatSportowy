// pages/pilka-nozna/przedmeczowe.jsx (lub Twój plik tej strony)
import axios from 'axios'
import { useState, useEffect, useContext } from 'react'
import NavBar from '@/components/NavBar'
import ChatComponent from '@/components/ChatComponent'
import { UserContext } from '@/context/UserContext'
import { GiPlayButton } from 'react-icons/gi'
import Link from 'next/link'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useTranslation } from 'next-i18next'

export default function Plfootball() {
  const [fixtures, setFixtures] = useState([])
  const [activeChats, setActiveChats] = useState([])
  const [teamStats, setTeamStats] = useState({})
  const [searchTerm, setSearchTerm] = useState('')
  // const [predictionsData, setPredictionsData] = useState(null)

  const { t } = useTranslation('common')

  // NOWY kontekst
  const { user } = useContext(UserContext)
  const username = user?.username // jeśli gdzieś na stronie potrzebujesz

  // useEffect(() => {
  //   const loadPredictions = async () => {
  //     try {
  //       const resp = await axios.get('/api/football/fetchPredictionsNew')
  //       setPredictionsData(resp.data.matches)
  //     } catch (err) {
  //       console.error('Prediction load error:', err)
  //     }
  //   }
  //   loadPredictions()
  // }, [])

  useEffect(() => {
    const loadFixtures = async () => {
      try {
        const response = await axios.get('/api/football/fixtures')
        setFixtures(response.data.response)
      } catch (e) {
        console.error('Fixtures load error:', e)
      }
    }
    loadFixtures()
  }, [])

  const handleLanguageChange = () => {
    setActiveChats([])
  }

  const fetchPredictions = async id => {
    try {
      const response = await axios.post('/api/football/fetchPredictions', { fixtureId: id })
      return response.data.prediction
    } catch (error) {
      console.error('Błąd pobierania predykcji:', error)
      return null
    }
  }

  const fetchTeamStatistics = async (teamId, leagueId) => {
    try {
      const response = await axios.post('/api/football/fetchTeamStatistics', { teamId, leagueId })
      return response.data
    } catch (error) {
      console.error('Error fetching team statistics:', error)
      return null
    }
  }

  const toggleChat = async id => {
    if (activeChats.includes(id)) {
      setActiveChats(activeChats.filter(chatId => chatId !== id))
    } else {
      setActiveChats([...activeChats, id])

      const fixture = fixtures.find(f => f.fixture.id === id)
      if (fixture) {
        try {
          const homeStats = await fetchTeamStatistics(fixture.teams.home.id, fixture.league.id)
          const awayStats = await fetchTeamStatistics(fixture.teams.away.id, fixture.league.id)
          const prediction = await fetchPredictions(id)

          setTeamStats(prev => ({
            ...prev,
            [id]: { homeStats, awayStats, prediction },
          }))
        } catch (error) {
          console.error('Error fetching team statistics:', error)
        }
      }
    }
  }

  const filteredFixtures = fixtures.filter(fixture => {
    const leagueName = fixture.league.name.toLowerCase()
    const homeTeam = fixture.teams.home.name.toLowerCase()
    const awayTeam = fixture.teams.away.name.toLowerCase()
    const term = searchTerm.toLowerCase()
    return leagueName.includes(term) || homeTeam.includes(term) || awayTeam.includes(term)
  })

  const groupedFixtures = filteredFixtures.reduce((acc, fixture) => {
    const leagueKey = `${fixture.league.name} (${fixture.league.country})`
    if (!acc[leagueKey]) acc[leagueKey] = []
    acc[leagueKey].push(fixture)
    return acc
  }, {})

  return (
    <>
      <NavBar onLanguageChange={handleLanguageChange} />

      <div className="content-league">
        <h1>
          <img src="/img/football.png" className="icon-sport" />
          {t('footbal')}
        </h1>

        <div className="choose-time">
          <Link href="/pilka-nozna/przedmeczowe" className="pre-match-p active-section">
            {t('match')}
          </Link>
          <Link href="/pilka-nozna/live" className="pre-match-p">
            {t('onlive')}
          </Link>
        </div>

        <div className="search-container">
          <input
            type="text"
            placeholder={t('searcha')}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        {Object.keys(groupedFixtures).length > 0 &&
          Object.keys(groupedFixtures).map((leagueKey, leagueIndex) => (
            <div key={leagueIndex}>
              <h2 className="league-header">{leagueKey}</h2>
              {groupedFixtures[leagueKey].map(fixture => (
                <div key={fixture.fixture.id} className="chat-content">
                  <div onClick={() => toggleChat(fixture.fixture.id)} className="match-name">
                    <GiPlayButton style={{ marginRight: '10px' }} />
                    <p>
                      {fixture.teams.home.name} - {fixture.teams.away.name}
                      <br />
                      <span>{new Date(fixture.fixture.date).toLocaleString()}</span>
                    </p>
                  </div>

                  {activeChats.includes(fixture.fixture.id) && (
                    <div className="chat-public">
                      <ChatComponent
                        chatId={`Liga-${fixture.fixture.id}`}
                        homeTeam={fixture.teams.home.name}
                        awayTeam={fixture.teams.away.name}
                        homeStats={teamStats[fixture.fixture.id]?.homeStats || {}}
                        awayStats={teamStats[fixture.fixture.id]?.awayStats || {}}
                        isAnalysisEnabled={true}
                        isLive={false}
                        prediction={teamStats[fixture.fixture.id]?.prediction || 'Brak przewidywań'}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
      </div>

      {/* {predictionsData && (
        <div className="mb-6 p-4 bg-gray-100 rounded-lg">
          <h2 className="text-xl font-bold mb-2">{t('Predictions for today')}</h2>
          {predictionsData.map(p => (
            <div key={p.id} className="border-b py-2">
              <div>
                <strong>
                  {p.home_team} vs {p.away_team}
                </strong>
              </div>
              <div>{p.date}</div>
              <div>
                {t('Prediction')}: {p.prediction} ({p.prediction_probability}%)
              </div>
            </div>
          ))}
        </div>
      )} */}

      {/* <iframe src="/widget.html" width="100%" height="600" className="border-none" /> */}
    </>
  )
}

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  }
}
