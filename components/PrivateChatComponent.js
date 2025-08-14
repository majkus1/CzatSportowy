// PrivateChatComponent.js
import { useState, useEffect, useContext, useRef, useCallback } from 'react'
import { UserContext } from '../context/UserContext'
import io from 'socket.io-client'
import { useTranslation } from 'next-i18next'

const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000', {
  withCredentials: true
});

const PrivateChatComponent = ({ receiver }) => {
	const [messages, setMessages] = useState([])
	const [currentMessage, setCurrentMessage] = useState('')
	const { user, isAuthed } = useContext(UserContext)
	const username = user?.username
	const messagesContainerRef = useRef(null)
	const { t } = useTranslation('common')

	const fetchWithRefresh = useCallback(async (url, opts = {}) => {
		const res = await fetch(url, { credentials: 'include', ...opts })
		if (res.status !== 401) return res
		// spróbuj odświeżyć tokeny
		const r = await fetch('/api/auth/refresh', { method: 'POST', credentials: 'include' })
		if (!r.ok) return res // brak refreshu – zostaw 401
		// ponów oryginalny request
		return fetch(url, { credentials: 'include', ...opts })
	}, [])

	useEffect(() => {
		if (messagesContainerRef.current) {
			messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight
		}
	}, [messages])

	useEffect(() => {
		const sender = username || 'Anonim'
		const chatId = [sender, receiver].sort().join('_')

		socket.emit('join_chat', chatId)

		const fetchMessages = async () => {
			try {
				const response = await fetchWithRefresh(`/api/getPrivateMessages?chatId=${chatId}`)
				const data = await response.json()
				if (Array.isArray(data)) {
					setMessages(data)
				} else {
					console.error('Oczekiwano tablicy wiadomości, ale otrzymano:', data)
					setMessages([])
				}
			} catch (error) {
				console.error('Błąd podczas pobierania wiadomości:', error)
			}
		}

		fetchMessages()

		socket.on('receive_private_message', message => {
			console.log('Otrzymano prywatną wiadomość:', message)
			if (message.chatId === chatId) {
				setMessages(prevMessages => [...prevMessages, message])
			}
		})

		return () => {
			socket.off('receive_private_message')
			socket.off('join_chat')
		}
	}, [receiver, username])

	const handleSendMessage = async () => {
		if (!receiver) {
			console.error('Receiver is not defined!')
			return
		}
		const sender = username || 'Anonim'
		const chatId = [sender, receiver].sort().join('_')
		if (currentMessage.trim()) {
			try {
				const response = await fetchWithRefresh('/api/sendPrivateMessage', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						username: sender,
						content: currentMessage,
						chatId,
					}),
				})
				const data = await response.json()
				if (data.success) {
					const messageObject = {
						username: sender,
						content: currentMessage,
						chatId,
					}
					socket.emit('send_private_message', messageObject)
					setCurrentMessage('')
				} else {
					console.error(data.message)
				}
			} catch (error) {
				console.error('Błąd podczas wysyłania wiadomości:', error)
			}
		}
	}

	const formatDate = timestamp => {
		const messageDate = new Date(timestamp)
		const currentDate = new Date()
		if (
			messageDate.getDate() === currentDate.getDate() &&
			messageDate.getMonth() === currentDate.getMonth() &&
			messageDate.getFullYear() === currentDate.getFullYear()
		) {
			return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
		} else {
			return messageDate.toLocaleString([], {
				year: 'numeric',
				month: '2-digit',
				day: '2-digit',
				hour: '2-digit',
				minute: '2-digit',
			})
		}
	}

	if (!isAuthed) {
		return <p>{t('mustlog') || 'Musisz się zalogować, aby napisać wiadomość.'}</p>
	}

	return (
		<div className="private-content-chat">
			<div>
				<div className="messages-container" ref={messagesContainerRef}>
					{messages.map((msg, idx) => (
						<div key={idx} className="message-one">
							<strong>{msg.username}</strong>: {msg.content}
							<span style={{ marginLeft: '10px', fontSize: '0.8em', color: 'gray' }}>{formatDate(msg.timestamp)}</span>
						</div>
					))}
				</div>
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
					<button onClick={handleSendMessage}>{t('sent')}</button>
				</div>
			) : (
				<p>Musisz się zalogować, aby napisać wiadomość.</p>
			)}
		</div>
	)
}

export default PrivateChatComponent
