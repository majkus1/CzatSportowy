import { useState, useEffect, useContext, useRef, useCallback } from 'react'
import { UserContext } from '../context/UserContext'
import Modal from './Modal'
import PrivateChatComponent from './PrivateChatComponent'
import io from 'socket.io-client'
import { GiPlayButton } from 'react-icons/gi'
import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'
import ClipLoader from 'react-spinners/ClipLoader'

const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000', {
	withCredentials: true,
})

const ChatComponent = ({
	chatId,
	homeTeam,
	awayTeam,
	prediction,
	homeStats,
	awayStats,
	isAnalysisEnabled,
	isLive,
	currentGoals,
}) => {
	const [messages, setMessages] = useState([])
	const [currentMessage, setCurrentMessage] = useState('')
	const [isPrivateChatOpen, setPrivateChatOpen] = useState(false)
	const [selectedUser, setSelectedUser] = useState(null)
	const messagesContainerRef = useRef(null)
	const router = useRouter()
	const { t } = useTranslation('common')
	// const [analysis, setAnalysis] = useState('')
	const [analysis, setAnalysis] = useState({ text: '', pred: '' })

	const { user, isAuthed } = useContext(UserContext)
	const username = user?.username

	const fetchWithRefresh = useCallback(async (url, opts = {}) => {
		const res = await fetch(url, { credentials: 'include', ...opts })
		if (res.status !== 401) return res
		// odśwież access
		const r = await fetch('/api/auth/refresh', { method: 'POST', credentials: 'include' })
		if (!r.ok) return res // brak refresh -> zwracamy 401
		// spróbuj ponownie
		return fetch(url, { credentials: 'include', ...opts })
	}, [])

	useEffect(() => {
		setAnalysis({ text: t('ai'), pred: '' })
	}, [t])

	useEffect(() => {
		if (messagesContainerRef.current) {
			messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight
		}
	}, [messages])

	useEffect(() => {
		const fetchMessages = async () => {
			try {
				const response = await fetch(`/api/getMessages?chatId=${chatId}`, {
					credentials: 'include',
				})
				const data = await response.json()
				setMessages(data)
			} catch (error) {
				console.error('Błąd pobierania wiadomości:', error)
			}
		}
		fetchMessages()

		socket.emit('join_chat', chatId)
		socket.on('receive_message', message => {
			if (message.chatId === chatId) {
				setMessages(prevMessages => [...prevMessages, message])
			}
		})
		return () => {
			socket.off('receive_message')
			socket.off('join_chat')
		}
	}, [chatId])

	useEffect(() => {
		if (
			isAnalysisEnabled &&
			homeStats?.playedTotal !== undefined &&
			awayStats?.playedTotal !== undefined &&
			homeStats?.form !== undefined &&
			awayStats?.form !== undefined
		) {
			const fetchMatchAnalysis = async () => {
				try {
					const response = await fetch('/api/football/getOrCreateAnalysis', {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({
							fixtureId: chatId,
							homeTeam,
							awayTeam,
							isLive,
							currentGoals,
							language: router.locale === 'pl' ? 'pl' : 'en',
							prediction,
							homeStats: {
								playedTotal: homeStats?.playedTotal || 0,
								form: homeStats?.form || 'N/A',
								goalsOver05: homeStats?.goalsOver05 || 0,
								goalsUnder05: homeStats?.goalsUnder05 || 0,
								goalsOver15: homeStats?.goalsOver15 || 0,
								goalsUnder15: homeStats?.goalsUnder15 || 0,
								goalsOver25: homeStats?.goalsOver25 || 0,
								goalsUnder25: homeStats?.goalsUnder25 || 0,
								goalsOver35: homeStats?.goalsOver35 || 0,
								goalsUnder35: homeStats?.goalsUnder35 || 0,

								goalsOver05aga: homeStats?.goalsOver05aga || 0,
								goalsUnder05aga: homeStats?.goalsUnder05aga || 0,
								goalsOver15aga: homeStats?.goalsOver15aga || 0,
								goalsUnder15aga: homeStats?.goalsUnder15aga || 0,
								goalsOver25aga: homeStats?.goalsOver25aga || 0,
								goalsUnder25aga: homeStats?.goalsUnder25aga || 0,
								goalsOver35aga: homeStats?.goalsOver35aga || 0,
								goalsUnder35aga: homeStats?.goalsUnder35aga || 0,

								goalsfortotal: homeStats?.goalsfortotal || 0,
								goalsforhome: homeStats?.goalsforhome || 0,
								goalsforaway: homeStats?.goalsforaway || 0,
								goalsagatotal: homeStats?.goalsagatotal || 0,
								goalsagahome: homeStats?.goalsagahome || 0,
								goalsagaaway: homeStats?.goalsagaaway || 0,

								winstotal: homeStats?.winstotal || 0,
								winshome: homeStats?.winshome || 0,
								winsaway: homeStats?.winsaway || 0,

								drawstotal: homeStats?.drawstotal || 0,
								drawshome: homeStats?.drawshome || 0,
								drawsaway: homeStats?.drawsaway || 0,

								losestotal: homeStats?.losestotal || 0,
								loseshome: homeStats?.loseshome || 0,
								losesaway: homeStats?.losesaway || 0,

								cleansheettotal: homeStats?.cleansheettotal || 0,
								cleansheethome: homeStats?.cleansheethome || 0,
								cleansheetaway: homeStats?.cleansheetaway || 0,

								failedtoscoretotal: homeStats?.failedtoscoretotal || 0,
								failedtoscorehome: homeStats?.failedtoscorehome || 0,
								failedtoscoreaway: homeStats?.failedtoscoreaway || 0,
							},
							awayStats: {
								playedTotal: awayStats?.playedTotal || 0,
								form: awayStats?.form || 'N/A',
								goalsOver05: awayStats?.goalsOver05 || 0,
								goalsUnder05: awayStats?.goalsUnder05 || 0,
								goalsOver15: awayStats?.goalsOver15 || 0,
								goalsUnder15: awayStats?.goalsUnder15 || 0,
								goalsOver25: awayStats?.goalsOver25 || 0,
								goalsUnder25: awayStats?.goalsUnder25 || 0,
								goalsOver35: awayStats?.goalsOver35 || 0,
								goalsUnder35: awayStats?.goalsUnder35 || 0,

								goalsOver05aga: awayStats?.goalsOver05aga || 0,
								goalsUnder05aga: awayStats?.goalsUnder05aga || 0,
								goalsOver15aga: awayStats?.goalsOver15aga || 0,
								goalsUnder15aga: awayStats?.goalsUnder15aga || 0,
								goalsOver25aga: awayStats?.goalsOver25aga || 0,
								goalsUnder25aga: awayStats?.goalsUnder25aga || 0,
								goalsOver35aga: awayStats?.goalsOver35aga || 0,
								goalsUnder35aga: awayStats?.goalsUnder35aga || 0,

								goalsfortotal: awayStats?.goalsfortotal || 0,
								goalsforhome: awayStats?.goalsforhome || 0,
								goalsforaway: awayStats?.goalsforaway || 0,
								goalsagatotal: awayStats?.goalsagatotal || 0,
								goalsagahome: awayStats?.goalsagahome || 0,
								goalsagaaway: awayStats?.goalsagaaway || 0,

								winstotal: awayStats?.winstotal || 0,
								winshome: awayStats?.winshome || 0,
								winsaway: awayStats?.winsaway || 0,

								drawstotal: awayStats?.drawstotal || 0,
								drawshome: awayStats?.drawshome || 0,
								drawsaway: awayStats?.drawsaway || 0,

								losestotal: awayStats?.losestotal || 0,
								loseshome: awayStats?.loseshome || 0,
								losesaway: awayStats?.losesaway || 0,

								cleansheettotal: awayStats?.cleansheettotal || 0,
								cleansheethome: awayStats?.cleansheethome || 0,
								cleansheetaway: awayStats?.cleansheetaway || 0,

								failedtoscoretotal: awayStats?.failedtoscoretotal || 0,
								failedtoscorehome: awayStats?.failedtoscorehome || 0,
								failedtoscoreaway: awayStats?.failedtoscoreaway || 0,
							},
						}),
						credentials: 'include',
					})
					const data = await response.json()
					const { text, prediction: pred } = parseAnalysis(data.analysis)
					setAnalysis({ text: text || t('analysis_unavailable'), pred })
					// const formatAnalysis = analysisText => {
					// 	if (!analysisText) return t('analysis_unavailable')
					// 	const predictionPattern = /Przewidywanie: (.+)$/i
					// 	const match = analysisText.match(predictionPattern)
					// 	if (match) {
					// 		const predictionExtracted = match[1]
					// 		return analysisText.replace(
					// 			predictionPattern,
					// 			`<br></br><strong>Przewidywanie:</strong> ${predictionExtracted}`
					// 		)
					// 	}
					// 	return analysisText
					// }
					// setAnalysis(formatAnalysis(data.analysis))
				} catch (error) {
					console.error('Błąd podczas pobierania analizy:', error)
				}
			}
			fetchMatchAnalysis()
		}
	}, [
		isAnalysisEnabled,
		prediction,
		homeTeam,
		awayTeam,
		homeStats,
		awayStats,
		isLive,
		currentGoals,
		router.locale,
		t,
		chatId,
	])

	const handleSendMessage = async () => {
		if (!isAuthed) {
			console.error('Użytkownik niezalogowany')
			return
		}
		if (currentMessage.trim()) {
			try {
				const response = await fetchWithRefresh('/api/sendMessage', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						username: username || 'Anonim',
						content: currentMessage,
						chatId,
					}),
				})
				const data = await response.json()
				if (data.success) {
					const messageObject = {
						username: username || 'Anonim',
						content: currentMessage,
						chatId,
					}
					socket.emit('send_message', messageObject)
					setCurrentMessage('')
				} else {
					console.error('Błąd wysyłania wiadomości:', data.message)
				}
			} catch (error) {
				console.error('Błąd podczas wysyłania wiadomości:', error)
			}
		}
	}

	const openPrivateChat = chatUsername => {
		if (chatUsername === username) {
			console.warn('Nie możesz otworzyć czatu z samym sobą.')
			return
		}
		setSelectedUser(chatUsername)
		setPrivateChatOpen(true)
	}

	function parseAnalysis(analysisText) {
		if (!analysisText) return { text: '', prediction: '' }
		const m = analysisText.match(/Przewidywanie:\s*(.+)$/i)
		return {
			text: m ? analysisText.replace(m[0], '').trim() : analysisText.trim(),
			prediction: m ? m[1].trim() : '',
		}
	}

	return (
		<div>
			{isPrivateChatOpen && (
				<Modal onClose={() => setPrivateChatOpen(false)}>
					<PrivateChatComponent receiver={selectedUser} />
				</Modal>
			)}
			<div className="messages-container" ref={messagesContainerRef}>
				{/* {isAnalysisEnabled && (
					<div className="match-analysis">
						{' '}
						<p style={{ whiteSpace: 'pre-line' }}>{analysis.text}</p>{' '}
						{analysis.pred && (
							<p style={{ marginTop: '10px' }}>
								{' '}
								<strong>Przewidywanie:</strong> {analysis.pred}{' '}
							</p>
						)}{' '}
					</div>
				)} */}
				{isAnalysisEnabled && (
					<div className="match-analysis">
						{analysis.text === t('ai') ? (
							<>
								<ClipLoader color="#111" size={40} />
								<p>{t('ai')}</p>
							</>
						) : (
							<>
								<p style={{ whiteSpace: 'pre-line' }}>{analysis.text}</p>
								{analysis.pred && (
									<p style={{ marginTop: '10px' }}>
										<strong>Przewidywanie:</strong> {analysis.pred}
									</p>
								)}
							</>
						)}
					</div>
				)}

				{messages.map((msg, idx) => (
					<div key={idx} className="message-one">
						<strong onClick={() => openPrivateChat(msg.username)} style={{ cursor: 'pointer', fontWeight: '700' }}>
							{msg.username}
						</strong>
						: {msg.content}
						<span style={{ marginLeft: '10px', fontSize: '0.6em', color: 'gray' }}>
							{new Date(msg.timestamp).toLocaleTimeString()}
						</span>
					</div>
				))}
			</div>
			{isAuthed ? (
				<div className="send-public-chat">
					<input
						value={currentMessage}
						onChange={e => setCurrentMessage(e.target.value)}
						onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
						type="text"
						placeholder={t('write')}
					/>
					<button onClick={handleSendMessage}>
						<GiPlayButton style={{ marginRight: '5px' }} /> Wyślij
					</button>
				</div>
			) : (
				<p className="must-be-login">{t('mustlog')}</p>
			)}
		</div>
	)
}

export default ChatComponent
