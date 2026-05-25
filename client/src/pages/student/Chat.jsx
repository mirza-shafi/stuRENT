/**
 * Chat.jsx — Fixed 2-panel messaging layout with real database persistence
 * Left: conversation list | Right: active chat window
 */
import { useState, useRef, useEffect } from 'react'
import { Send, Search, MessageCircle, ChevronRight, ArrowLeft } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useLocation, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import ChatService from '../../services/chatService'

const formatMessageTime = (isoString) => {
  if (!isoString) return ''
  const date = new Date(isoString)
  if (isNaN(date.getTime())) return isoString
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const formatLastMessageTime = (isoString) => {
  if (!isoString) return ''
  const date = new Date(isoString)
  if (isNaN(date.getTime())) return isoString
  const now = new Date()

  // Compare dates without time portion
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const msgDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const diffTime = today - msgDate
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  } else if (diffDays === 1) {
    return 'Yesterday'
  } else if (diffDays < 7) {
    return `${diffDays} days ago`
  } else {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
  }
}

export default function Chat() {
  const { user } = useAuth()
  const location = useLocation()
  
  const [conversations, setConversations] = useState([])
  const [activeMessages, setActiveMessages] = useState([])
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
  const currentMsgs = activeMessages

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

  const fetchConversations = async (selectConvoId = null) => {
    try {
      const { data } = await ChatService.getConversations()
      setConversations(data)
      if (selectConvoId) {
        setActiveId(selectConvoId)
      }
    } catch (err) {
      console.error('Failed to load conversations:', err)
    }
  }

  const fetchMessages = async (convoId) => {
    try {
      const { data } = await ChatService.getMessages(convoId)
      setActiveMessages(data)
    } catch (err) {
      console.error('Failed to load messages:', err)
    }
  }

  // Poll conversations list
  useEffect(() => {
    if (!user?.email) return

    fetchConversations()
    const interval = setInterval(() => {
      fetchConversations()
    }, 5000)

    return () => clearInterval(interval)
  }, [user])

  // Poll current messages thread
  useEffect(() => {
    if (!activeId) return

    fetchMessages(activeId)
    const interval = setInterval(() => {
      fetchMessages(activeId)
    }, 4000)

    return () => clearInterval(interval)
  }, [activeId])

  // Sync navigation state payload from product details
  useEffect(() => {
    if (!user?.email || !location.state) return
    const { recipient, product } = location.state
    if (recipient && product) {
      const sortedEmails = [user.email, recipient.email].sort()
      const convoId = `${product.id}::${sortedEmails[0]}::${sortedEmails[1]}`
      
      const existing = conversations.find(c => c.id === convoId)
      if (existing) {
        setActiveId(convoId)
      } else {
        const colors = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6']
        const randomColor = colors[Math.floor(Math.random() * colors.length)]

        const tempConvo = {
          id: convoId,
          productId: product.id,
          productName: product.name,
          participants: [user.email, recipient.email],
          participantNames: {
            [user.email]: user.username || 'You',
            [recipient.email]: recipient.name
          },
          lastMessage: `Interested in ${product.name}`,
          lastMessageTime: new Date().toISOString(),
          unread: 0,
          color: randomColor
        }

        setConversations(prev => {
          if (prev.some(c => c.id === convoId)) return prev
          return [tempConvo, ...prev]
        })
        setActiveId(convoId)
        setActiveMessages([])
      }
      
      // Clear navigation state
      window.history.replaceState({}, document.title)
    }
  }, [location.state, conversations, user])

  const sendMessage = async () => {
    if (!input.trim() || !activeId || !user?.email) return
    const messageText = input.trim()
    setInput('')

    try {
      const { data } = await ChatService.sendMessage(activeId, messageText)
      setActiveMessages(prev => [...prev, data])
      fetchConversations(activeId)
    } catch (err) {
      toast.error('Failed to send message')
      console.error(err)
    }
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
                onClick={async () => {
                  setActiveId(c.id)
                  // Immediately fetch and mark as read
                  fetchMessages(c.id)
                  setConversations(prev =>
                    prev.map(conv => conv.id === c.id ? { ...conv, unread: 0 } : conv)
                  )
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
                    <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>{formatLastMessageTime(c.lastMessageTime)}</span>
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
                    <span style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 3, padding: '0 2px' }}>{formatMessageTime(m.time)}</span>
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
