import { useState } from 'react';
import { LogOut, ChevronDown, Plus } from 'lucide-react';

export default function Sidebar({
  channels,
  users,
  activeChat,
  onSelectChannel,
  onSelectUser,
  onLogout,
  currentUser,
  userProfiles,
}) {
  const [expandedSections, setExpandedSections] = useState({
    channels: true,
    directMessages: true,
  });

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const isChannelActive = (channelId) => {
    return (
      activeChat?.type === 'channel' && activeChat?.data?.id === channelId
    );
  };

  const isUserActive = (userId) => {
    return (
      activeChat?.type === 'direct' && activeChat?.data?.id === userId
    );
  };

  return (
    <div style={styles.sidebar}>
      <div style={styles.header}>
        <h1 style={styles.title}>ChatHub</h1>
        <button
          onClick={onLogout}
          style={styles.logoutButton}
          title="Logout"
        >
          <LogOut size={18} />
        </button>
      </div>

      <div style={styles.userCard}>
        <img
          src={userProfiles[currentUser.id]?.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=user'}
          alt={userProfiles[currentUser.id]?.username}
          style={styles.avatar}
        />
        <div style={styles.userInfo}>
          <p style={styles.username}>
            {userProfiles[currentUser.id]?.username || 'User'}
          </p>
          <p style={styles.email}>{currentUser.email}</p>
        </div>
      </div>

      <div style={styles.divider} />

      <div style={styles.section}>
        <button
          onClick={() => toggleSection('channels')}
          style={styles.sectionHeader}
        >
          <ChevronDown
            size={16}
            style={{
              transform: expandedSections.channels ? 'rotate(0)' : 'rotate(-90deg)',
              transition: 'transform 0.2s',
            }}
          />
          <span>CHANNELS</span>
        </button>

        {expandedSections.channels && (
          <div style={styles.itemList}>
            {channels.map((channel) => (
              <button
                key={channel.id}
                onClick={() => onSelectChannel(channel)}
                style={{
                  ...styles.item,
                  ...(isChannelActive(channel.id) && styles.itemActive),
                }}
              >
                <span style={styles.itemIcon}>#</span>
                <span style={styles.itemText}>{channel.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div style={styles.section}>
        <button
          onClick={() => toggleSection('directMessages')}
          style={styles.sectionHeader}
        >
          <ChevronDown
            size={16}
            style={{
              transform: expandedSections.directMessages ? 'rotate(0)' : 'rotate(-90deg)',
              transition: 'transform 0.2s',
            }}
          />
          <span>DIRECT MESSAGES</span>
        </button>

        {expandedSections.directMessages && (
          <div style={styles.itemList}>
            {users.map((user) => (
              <button
                key={user.id}
                onClick={() => onSelectUser(user)}
                style={{
                  ...styles.item,
                  ...(isUserActive(user.id) && styles.itemActive),
                }}
              >
                <img
                  src={user.avatar_url}
                  alt={user.username}
                  style={styles.userAvatar}
                />
                <span style={styles.itemText}>{user.username}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div style={styles.spacer} />
    </div>
  );
}

const styles = {
  sidebar: {
    width: '280px',
    background: '#1e1f25',
    display: 'flex',
    flexDirection: 'column',
    borderRight: '1px solid #404249',
    overflowY: 'auto',
  },
  header: {
    padding: '16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#5865f2',
    margin: 0,
  },
  logoutButton: {
    background: 'none',
    border: 'none',
    color: '#b5bac1',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    padding: '4px 8px',
    borderRadius: '4px',
    transition: 'background-color 0.2s',
  },
  userCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    margin: '0 8px',
    background: '#2a2d34',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  avatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
  },
  userInfo: {
    flex: 1,
    minWidth: 0,
  },
  username: {
    margin: 0,
    fontSize: '13px',
    fontWeight: '600',
    color: '#ececf1',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  email: {
    margin: 0,
    fontSize: '12px',
    color: '#b5bac1',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  divider: {
    height: '1px',
    background: '#404249',
    margin: '8px 0',
  },
  section: {
    padding: '0 8px',
  },
  sectionHeader: {
    width: '100%',
    padding: '8px 12px',
    background: 'none',
    border: 'none',
    color: '#949ba4',
    fontSize: '12px',
    fontWeight: '700',
    textAlign: 'left',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'color 0.2s',
  },
  itemList: {
    marginBottom: '8px',
  },
  item: {
    width: '100%',
    padding: '8px 12px',
    background: 'none',
    border: 'none',
    color: '#b5bac1',
    fontSize: '13px',
    textAlign: 'left',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    borderRadius: '4px',
    transition: 'background-color 0.2s, color 0.2s',
  },
  itemActive: {
    background: '#5865f2',
    color: '#fff',
  },
  itemIcon: {
    fontSize: '16px',
  },
  itemText: {
    flex: 1,
    textAlign: 'left',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  userAvatar: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
  },
  spacer: {
    flex: 1,
  },
};
