import { useState, useEffect, useContext } from 'react'
import axios from 'axios'
import NavBar from '@/components/NavBar'
import ChatComponent from '@/components/ChatComponent'
import { UserContext } from '@/context/UserContext'
import { GiPlayButton } from 'react-icons/gi'
import Link from 'next/link'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useTranslation } from 'next-i18next'

export default function Plfootball() {
	const [fixtures, setFixtures] = useState([])
	const [teamStats, setTeamStats] = useState({})
	const [activeChats, setActiveChats] = useState([])
	const [searchTerm, setSearchTerm] = useState('')
	const { user } = useContext(UserContext)
	const username = user?.username 
	const { t } = useTranslation('common')

	const handleLanguageChange = () => {
		setActiveChats([])
	}

	useEffect(() => {
		const loadFixtures = async () => {
			try {
				const response = await axios.get('/api/football/fetchLiveFixtures')
				setFixtures(response.data.fixtures)
			} catch (error) {
				console.error('Error loading live fixtures:', error)
			}
		}

		loadFixtures()
	}, [])

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

					setTeamStats(prevStats => ({
						...prevStats,
						[id]: { homeStats, awayStats },
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
		if (!acc[leagueKey]) {
			acc[leagueKey] = []
		}
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
					<Link href="/pilka-nozna/przedmeczowe" className="pre-match-p">
						{t('match')}
					</Link>
					<Link href="/pilka-nozna" className="pre-match-p active-section">
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

				{Object.keys(groupedFixtures).length === 0
					? ''
					: Object.keys(groupedFixtures).map((leagueKey, leagueIndex) => (
							<div key={leagueIndex}>
								<h2 className="league-header">{leagueKey}</h2>
								{groupedFixtures[leagueKey].map((fixture, index) => (
									<div key={fixture.fixture.id} className="chat-content">
										<div onClick={() => toggleChat(fixture.fixture.id)} className="match-name">
											<GiPlayButton style={{ marginRight: '10px' }} />
											<p>
												{fixture.teams.home.name}{' '}
												<span style={{ color: 'red', fontSize: '18px' }}>
													{fixture.goals.home} - {fixture.goals.away}
												</span>{' '}
												{fixture.teams.away.name}
												<br />
												<span>{new Date(fixture.fixture.date).toLocaleString()}</span>
											</p>
										</div>
										{activeChats.includes(fixture.fixture.id) && (
											<div className="chat-public">
												<ChatComponent
													// token={token}
													username={username}
													chatId={`Liga-${fixture.fixture.id}`}
													homeTeam={fixture.teams.home.name}
													awayTeam={fixture.teams.away.name}
													homeStats={teamStats[fixture.fixture.id]?.homeStats || {}}
													awayStats={teamStats[fixture.fixture.id]?.awayStats || {}}
													currentGoals={{
														home: fixture.goals.home,
														away: fixture.goals.away,
													}}
													isAnalysisEnabled={true}
													isLive={true}
												/>
											</div>
										)}
									</div>
								))}
							</div>
					  ))}
			</div>
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
