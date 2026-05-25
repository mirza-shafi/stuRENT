/**
 * Chat.jsx — Fixed 2-panel messaging layout with localStorage persistence
 * Left: conversation list | Right: active chat window
 */
import { useState, useRef, useEffect } from 'react'
import { Send, Search, MessageCircle, ChevronRight, ArrowLeft } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useLocation, Link } from 'react-router-dom'
import toast from 'react-hot-toast'

const AUTO_REPLIES = [
  'Got it, thanks!', 'Sure, sounds good.', 'Let me check and get back to you.',
  "Yes, it's available!", "I'll confirm shortly.", 'Great, see you then!'
]

const getChatData = (userEmail) => {
  const data = localStorage.getItem('sturent_chat_data')
  if (data) {
    try {
      return JSON.parse(data)
    } catch (e) {
      console.error(e)
    }
  }

  // Initialize with seeded mock data
  const seededConvos = [
    {
      id: `mock1::${userEmail}::alex@sturent.com`,
      productId: 'mock1',
      productName: 'Folding Table',
      participants: [userEmail, 'alex@sturent.com'],
      participantNames: {
        [userEmail]: 'You',
        'alex@sturent.com': 'Alex Kim'
      },
      lastMessage: 'Is it still available?',
      lastMessageTime: '2:34 PM',
      unread: 2,
      color: '#6366f1'
    },
    {
      id: `mock2::${userEmail}::sara@sturent.com`,
      productId: 'mock2',
      productName: 'Study Lamp',
      participants: [userEmail, 'sara@sturent.com'],
      participantNames: {
        [userEmail]: 'You',
        'sara@sturent.com': 'Sara Malik'
      },
      lastMessage: 'Thanks for the info!',
      lastMessageTime: 'Yesterday',
      unread: 0,
      color: '#06b6d4'
    },
    {
      id: `mock3::${userEmail}::omar@sturent.com`,
      productId: 'mock3',
      productName: '1BR Apartment',
      participants: [userEmail, 'omar@sturent.com'],
      participantNames: {
        [userEmail]: 'You',
        'omar@sturent.com': 'Omar Hassan'
      },
      lastMessage: 'When can I view it?',
      lastMessageTime: 'Yesterday',
      unread: 1,
      color: '#10b981'
    },
    {
      id: `mock4::${userEmail}::priya@sturent.com`,
      productId: 'mock4',
      productName: 'Camping Chair',
      participants: [userEmail, 'priya@sturent.com'],
      participantNames: {
        [userEmail]: 'You',
        'priya@sturent.com': 'Priya Roy'
      },
      lastMessage: 'What is the daily rate?',
      lastMessageTime: '2 days ago',
      unread: 0,
      color: '#f59e0b'
    }
  ]

  const seededMessages = {
    [`mock1::${userEmail}::alex@sturent.com`]: [
      { id: 1, senderEmail: 'alex@sturent.com', text: 'Hi! Is the Folding Table still available?', time: '2:30 PM' },
      { id: 2, senderEmail: userEmail,          text: 'Yes it is! Want to rent or buy?', time: '2:31 PM' },
      { id: 3, senderEmail: 'alex@sturent.com', text: 'I want to rent for 3 days. How much?', time: '2:32 PM' },
      { id: 4, senderEmail: userEmail,          text: '$5/day so $15 total. Interested?', time: '2:33 PM' },
      { id: 5, senderEmail: 'alex@sturent.com', text: 'Is it still available?', time: '2:34 PM' },
    ],
    [`mock2::${userEmail}::sara@sturent.com`]: [
      { id: 1, senderEmail: 'sara@sturent.com', text: 'Hello! Question about the Study Lamp.', time: 'Yesterday' },
      { id: 2, senderEmail: userEmail,          text: 'Sure! Ask away.', time: 'Yesterday' },
      { id: 3, senderEmail: 'sara@sturent.com', text: 'Thanks for the info!', time: 'Yesterday' },
    ],
    [`mock3::${userEmail}::omar@sturent.com`]: [
      { id: 1, senderEmail: 'omar@sturent.com', text: 'I saw your 1BR Apartment listing.', time: 'Yesterday' },
      { id: 2, senderEmail: userEmail,          text: 'Available from next month!', time: 'Yesterday' },
      { id: 3, senderEmail: 'omar@sturent.com', text: 'When can I view it?', time: 'Yesterday' },
    ],
    [`mock4::${userEmail}::priya@sturent.com`]: [
      { id: 1, senderEmail: 'priya@sturent.com', text: 'What is the daily rate for the camping chair?', time: '2 days ago' },
    ]
  }

  const initialData = { conversations: seededConvos, messages: seededMessages }
  localStorage.setItem('sturent_chat_data', JSON.stringify(initialData))
  return initialData
}

export default function Chat() {
  const { user } = useAuth()
  const location = useLocation()
  
  const [conversations, setConversations] = useState([])
  const [allMessages, setAllMessages]     = useState({})
  const [activeId, setActiveId]           = useState(null)
  const [input, setInput]                 = useState('')
  const [search, setSearch]               = useState('')
  const [typing, setTyping]               = useState(false)
  const bottomRef = useRef(null)

  const getRecipientInfo = (convo) => {
    if (!convo || !convo.participants || !user?.email) return { name: convo?.recipientName || 'User', avatar: '?' }
    const otherEmail = convo.participants.find(email => email !== user.email) || convo.participants[0]
    const otherName = convo.participantNames?.[otherEmail] || convo.recipientName || 'User'
    return {
      email: otherEmail,
      name: otherName,
      avatar: otherName[0]?.toUpperCase() || '?'
    }
  }

  const activeConvo = conversations.find(c => c.id === activeId)
  const activeRecipient = activeConvo ? getRecipientInfo(activeConvo) : null
  const currentMsgs = activeId ? (allMessages[activeId] ?? []) : []

  const filteredList = conversations.filter(c => {
    if (!user?.email || !c.participants?.includes(user.email)) return false
    
    // Hide mock/demo chats for admin users (so only actual chats are shown in admin panel)
    if (user.is_staff && c.id.startsWith('mock')) return false
    
    const recipientInfo = getRecipientInfo(c)
    return (
      recipientInfo.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.productName || c.sub || '').toLowerCase().includes(search.toLowerCase())
    )
  })

  // Scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [currentMsgs])

  // Sync state from local storage and Router navigation state
  useEffect(() => {
    if (!user?.email) return

    const chatData = getChatData(user.email)
    let convos = [...chatData.conversations]
    let msgs = { ...chatData.messages }

    // Parse navigate state payload
    const { recipient, product } = location.state || {}
    if (recipient && product) {
      const sortedEmails = [user.email, recipient.email].sort()
      const convoId = `${product.id}::${sortedEmails[0]}::${sortedEmails[1]}`

      const existingIdx = convos.findIndex(c => c.id === convoId)

      if (existingIdx === -1) {
        const colors = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6']
        const randomColor = colors[Math.floor(Math.random() * colors.length)]

        const newConvo = {
          id: convoId,
          productId: product.id,
          productName: product.name,
          participants: [user.email, recipient.email],
          participantNames: {
            [user.email]: user.username || 'You',
            [recipient.email]: recipient.name
          },
          lastMessage: `Interested in ${product.name}`,
          lastMessageTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          unread: 0,
          color: randomColor
        }

        convos.unshift(newConvo)
        
        msgs[convoId] = [
          {
            id: Date.now(),
            senderEmail: user.email,
            text: `Hi! I'm interested in renting/buying your "${product.name}". Is it still available?`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]

        const updatedData = { conversations: convos, messages: msgs }
        localStorage.setItem('sturent_chat_data', JSON.stringify(updatedData))
      }

      setActiveId(convoId)
      window.history.replaceState({}, document.title)
    }

    setConversations(convos)
    setAllMessages(msgs)
  }, [user, location.state])

  const sendMessage = () => {
    if (!input.trim() || !activeId || !user?.email) return
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const newMsg = {
      id: Date.now(),
      senderEmail: user.email,
      text: input.trim(),
      time: nowStr
    }

    const chatData = JSON.parse(localStorage.getItem('sturent_chat_data') || '{}')
    const convos = chatData.conversations || []
    const msgs = chatData.messages || {}

    const updatedMsgs = {
      ...msgs,
      [activeId]: [...(msgs[activeId] || []), newMsg]
    }

    const targetConvo = convos.find(c => c.id === activeId)
    if (targetConvo) {
      targetConvo.lastMessage = input.trim()
      targetConvo.lastMessageTime = nowStr
      targetConvo.unread = 0
    }

    const filteredConvos = convos.filter(c => c.id !== activeId)
    const updatedConvos = targetConvo ? [targetConvo, ...filteredConvos] : convos

    const updatedData = { conversations: updatedConvos, messages: updatedMsgs }
    localStorage.setItem('sturent_chat_data', JSON.stringify(updatedData))

    setConversations(updatedConvos)
    setAllMessages(updatedMsgs)
    setInput('')
  }

  const isAdminPath = location.pathname.startsWith('/admin')
  const containerHeight = isAdminPath ? 'calc(100dvh - 210px)' : 'calc(100dvh - 64px)'
  const containerStyle = isAdminPath ? {
    display: 'grid',
    gridTemplateColumns: '300px 1fr',
    height: containerHeight,
    background: 'var(--bg-2)',
    borderRadius: '16px',
    border: '1px solid var(--border)',
    overflow: 'hidden',
    boxShadow: 'var(--shadow-sm)'
  } : {
    display: 'grid',
    gridTemplateColumns: '300px 1fr',
    height: 'calc(100dvh - 64px)',
    background: 'var(--bg)',
    overflow: 'hidden'
  }

  return (
    <div className={isAdminPath ? "fade-in" : ""} style={isAdminPath ? { display: 'flex', flexDirection: 'column' } : {}}>
      {/* Admin Panel Breadcrumb & Page Header */}
      {isAdminPath && (
        <div style={{ marginBottom: 24 }}>
          {/* ── Breadcrumb ── */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
            <Link to="/admin/dashboard" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Home</Link>
            <ChevronRight size={13} />
            <span style={{ color: 'var(--text)' }}>Messages</span>
          </nav>

          {/* ── Page Header ── */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)', margin: 0 }}>Messages</h1>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>
                Direct student communications and listing inquiries
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="chat-container" style={containerStyle}>

      {/* ── LEFT: Conversation List ── */}
      <div className={`chat-sidebar-pane ${activeId ? 'chat-hide-mobile' : ''}`} style={{ background: 'var(--bg-2)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ padding: '18px 16px 12px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 12 }}>Messages</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-3)', borderRadius: 10, padding: '8px 12px' }}>
            <Search size={14} color="var(--text-muted)" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search conversations..."
              style={{ background: 'none', border: 'none', color: 'var(--text)', fontSize: 13, outline: 'none', flex: 1 }}
            />
          </div>
        </div>

        {/* Conversation items */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {filteredList.map(c => {
            const recipientInfo = getRecipientInfo(c)
            return (
              <div
                key={c.id}
                onClick={() => {
                  setActiveId(c.id)
                  setConversations(prev => {
                    const next = prev.map(conv => conv.id === c.id ? { ...conv, unread: 0 } : conv)
                    const chatData = JSON.parse(localStorage.getItem('sturent_chat_data') || '{}')
                    chatData.conversations = next
                    localStorage.setItem('sturent_chat_data', JSON.stringify(chatData))
                    return next
                  })
                }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '14px 16px', cursor: 'pointer', borderBottom: '1px solid var(--border)',
                  background: activeId === c.id ? 'var(--primary-glow)' : 'none',
                  transition: 'background .15s',
                  borderLeft: activeId === c.id ? '3px solid var(--primary)' : '3px solid transparent',
                }}
                onMouseEnter={e => { if (activeId !== c.id) e.currentTarget.style.background = 'var(--surface-hov)' }}
                onMouseLeave={e => { if (activeId !== c.id) e.currentTarget.style.background = 'none' }}
              >
                {/* Avatar */}
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: c.color || '#6366f1', color: '#fff', fontWeight: 700, fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, position: 'relative' }}>
                  {recipientInfo.avatar}
                  {c.unread > 0 && (
                    <span style={{ position: 'absolute', top: -2, right: -2, width: 18, height: 18, borderRadius: '50%', background: 'var(--primary)', color: '#fff', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--bg-2)' }}>
                      {c.unread}
                    </span>
                  )}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                    <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>{recipientInfo.name}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>{c.lastMessageTime}</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 500, marginBottom: 2 }}>{c.productName || c.sub}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.lastMessage}</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── RIGHT: Chat Window ── */}
      <div className={`chat-window-pane ${!activeId ? 'chat-hide-mobile' : ''}`} style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--bg)' }}>
        {!activeId ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', gap: 16, background: 'var(--bg-3)', padding: 32 }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--primary-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid rgba(99,102,241,.15)', color: 'var(--primary)', marginBottom: 8, boxShadow: 'var(--shadow-sm)' }}>
              <MessageCircle size={36} />
            </div>
            <h3 style={{ fontWeight: 800, fontSize: 18, color: 'var(--text)', margin: 0 }}>Direct Messaging Portal</h3>
            <p style={{ fontSize: 13, maxWidth: 320, textAlign: 'center', lineHeight: 1.6, color: 'var(--text-muted)', margin: 0 }}>
              Select a conversation from the sidebar to view messages, answer inquiries, or coordinate student handoffs.
            </p>
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div style={{ padding: '14px 20px', background: 'var(--bg-2)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12 }}>
              <button 
                onClick={() => setActiveId(null)}
                className="chat-back-btn"
                style={{
                  marginRight: 4,
                  padding: 6,
                  borderRadius: 8,
                  border: '1px solid var(--border)',
                  background: 'var(--surface)',
                  color: 'var(--text)',
                  cursor: 'pointer',
                  display: 'none',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                title="Back to conversations"
              >
                <ArrowLeft size={16} />
              </button>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: activeConvo?.color || '#6366f1', color: '#fff', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {activeRecipient?.avatar}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{activeRecipient?.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Re: {activeConvo?.productName || activeConvo?.sub}</div>
              </div>
              <div style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--success)', display: 'inline-block' }} />
                Online
              </div>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {currentMsgs.map(m => {
                const isMine = m.senderEmail === user?.email
                return (
                  <div key={m.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isMine ? 'flex-end' : 'flex-start' }}>
                    <div style={{
                      maxWidth: '65%', padding: '10px 14px', borderRadius: isMine ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                      background: isMine ? 'var(--primary)' : 'var(--bg-2)',
                      border: isMine ? 'none' : '1px solid var(--border)',
                      color: isMine ? '#fff' : 'var(--text)',
                      fontSize: 14, lineHeight: 1.5, wordBreak: 'break-word',
                    }}>
                      {m.text}
                    </div>
                    <span style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 3, padding: '0 2px' }}>{m.time}</span>
                  </div>
                )
              })}

              {/* Typing indicator */}
              {typing && (
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
                  <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', padding: '10px 14px', borderRadius: '18px 18px 18px 4px', display: 'flex', gap: 4 }}>
                    {[0,1,2].map(i => (
                      <span key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--text-muted)', animation: 'bounce .9s infinite', animationDelay: `${i*0.15}s`, display: 'inline-block' }} />
                    ))}
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input bar */}
            <div style={{ padding: '14px 20px', background: 'var(--bg-2)', borderTop: '1px solid var(--border)', display: 'flex', gap: 10, alignItems: 'center' }}>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                placeholder="Type a message..."
                style={{ flex: 1, padding: '10px 16px', borderRadius: 24, background: 'var(--bg-3)', border: '1.5px solid var(--border)', color: 'var(--text)', fontSize: 14, outline: 'none', transition: 'border-color .2s' }}
                onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim()}
                style={{ width: 40, height: 40, borderRadius: '50%', background: input.trim() ? 'var(--primary)' : 'var(--surface)', border: '1px solid var(--border)', color: input.trim() ? '#fff' : 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: input.trim() ? 'pointer' : 'default', transition: 'all .2s', flexShrink: 0 }}
              >
                <Send size={16} />
              </button>
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-6px); }
        }
        @media (max-width: 768px) {
          .student-main-content:has(.chat-container) {
            padding: 0 !important;
          }
          .chat-container {
            grid-template-columns: 1fr !important;
            height: calc(100dvh - 64px) !important;
          }
          .chat-hide-mobile {
            display: none !important;
          }
          .chat-back-btn {
            display: flex !important;
          }
        }
      `}</style>
      </div>
    </div>
  )
}
