import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import ChatArea from '../components/ChatArea';
import { chatService } from '../services/chat';
import { authService } from '../services/auth';

export default function Dashboard({ user, onLogout }) {
  const [channels, setChannels] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [userProfiles, setUserProfiles] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const channelsData = await chatService.getChannels();
    const usersData = await chatService.getUsers();

    setChannels(channelsData);
    setUsers(usersData.filter((u) => u.id !== user.id));

    const profiles = {};
    for (const u of usersData) {
      profiles[u.id] = u;
    }
    setUserProfiles(profiles);

    if (channelsData.length > 0) {
      setActiveChat({ type: 'channel', data: channelsData[0] });
    }

    setLoading(false);
  };

  const handleSelectChannel = (channel) => {
    setActiveChat({ type: 'channel', data: channel });
  };

  const handleSelectUser = (selectedUser) => {
    setActiveChat({ type: 'direct', data: selectedUser });
  };

  const handleLogout = async () => {
    await authService.logout();
    onLogout();
  };

  return (
    <div style={styles.container}>
      <Sidebar
        channels={channels}
        users={users}
        activeChat={activeChat}
        onSelectChannel={handleSelectChannel}
        onSelectUser={handleSelectUser}
        onLogout={handleLogout}
        currentUser={user}
        userProfiles={userProfiles}
      />
      <div style={styles.chatContainer}>
        {loading ? (
          <div style={styles.loadingContainer}>
            <p style={styles.loadingText}>Loading chats...</p>
          </div>
        ) : activeChat ? (
          <ChatArea
            activeChat={activeChat}
            currentUser={user}
            userProfiles={userProfiles}
            onRefreshChannels={loadData}
          />
        ) : (
          <div style={styles.emptyState}>
            <p style={styles.emptyText}>Select a channel or user to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    height: '100vh',
    background: '#2a2d34',
  },
  chatContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    background: '#2a2d34',
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  loadingText: {
    color: '#b5bac1',
    fontSize: '14px',
  },
  emptyState: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  emptyText: {
    color: '#72767d',
    fontSize: '16px',
  },
};
