import { useEffect, useState, useRef } from 'react';
import { Send } from 'lucide-react';
import { chatService } from '../services/chat';
import MessageList from './MessageList';

export default function ChatArea({
  activeChat,
  currentUser,
  userProfiles,
  onRefreshChannels,
}) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  const isChannel = activeChat.type === 'channel';
  const chatName = isChannel ? `#${activeChat.data.name}` : activeChat.data.username;
  const chatId = activeChat.data.id;

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 1000);
    return () => clearInterval(interval);
  }, [activeChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = async () => {
    setLoading(true);
    let fetchedMessages = [];

    if (isChannel) {
      fetchedMessages = await chatService.getChannelMessages(chatId);
    } else {
      fetchedMessages = await chatService.getDirectMessages(
        currentUser.id,
        activeChat.data.id
      );
    }

    setMessages(fetchedMessages);
    setLoading(false);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!input.trim()) return;

    setSending(true);

    if (isChannel) {
      await chatService.sendMessage(currentUser.id, input, chatId);
    } else {
      await chatService.sendMessage(
        currentUser.id,
        input,
        null,
        activeChat.data.id
      );
    }

    setInput('');
    setSending(false);
    await loadMessages();
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.chatName}>{chatName}</h2>
        {activeChat.data.description && (
          <p style={styles.description}>{activeChat.data.description}</p>
        )}
      </div>

      <div style={styles.messagesContainer}>
        {loading && messages.length === 0 ? (
          <div style={styles.loadingState}>
            <p style={styles.loadingText}>Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div style={styles.emptyState}>
            <p style={styles.emptyText}>
              {isChannel
                ? 'No messages in this channel yet. Start the conversation!'
                : 'No messages yet. Start a conversation!'}
            </p>
          </div>
        ) : (
          <MessageList
            messages={messages}
            currentUserId={currentUser.id}
            userProfiles={userProfiles}
          />
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} style={styles.inputContainer}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Message ${chatName}...`}
          disabled={sending}
          style={styles.input}
        />
        <button
          type="submit"
          disabled={sending || !input.trim()}
          style={{
            ...styles.sendButton,
            opacity: sending || !input.trim() ? 0.5 : 1,
          }}
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  header: {
    padding: '16px 24px',
    borderBottom: '1px solid #404249',
    background: '#2a2d34',
  },
  chatName: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#ececf1',
    margin: '0 0 4px 0',
  },
  description: {
    fontSize: '13px',
    color: '#b5bac1',
    margin: 0,
  },
  messagesContainer: {
    flex: 1,
    overflowY: 'auto',
    padding: '16px 24px',
    display: 'flex',
    flexDirection: 'column',
  },
  loadingState: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  loadingText: {
    color: '#b5bac1',
    fontSize: '14px',
    margin: 0,
  },
  emptyState: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  emptyText: {
    color: '#72767d',
    fontSize: '14px',
    margin: 0,
  },
  inputContainer: {
    display: 'flex',
    gap: '8px',
    padding: '16px 24px',
    borderTop: '1px solid #404249',
    background: '#2a2d34',
  },
  input: {
    flex: 1,
    padding: '10px 16px',
    background: '#383c43',
    border: '1px solid #404249',
    borderRadius: '20px',
    color: '#ececf1',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  sendButton: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: '#5865f2',
    border: 'none',
    color: '#fff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.2s',
  },
};
