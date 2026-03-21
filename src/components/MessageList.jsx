export default function MessageList({
  messages,
  currentUserId,
  userProfiles,
}) {
  const groupedMessages = [];
  let currentGroup = null;

  messages.forEach((msg, index) => {
    const isSameSender =
      index > 0 && messages[index - 1].sender_id === msg.sender_id;
    const timeDiff =
      index > 0
        ? new Date(msg.created_at) -
          new Date(messages[index - 1].created_at)
        : null;
    const sameTime = timeDiff !== null && timeDiff < 60000;

    if (!isSameSender || !sameTime) {
      if (currentGroup) {
        groupedMessages.push(currentGroup);
      }
      currentGroup = {
        sender: msg.sender,
        isCurrentUser: msg.sender_id === currentUserId,
        messages: [msg],
      };
    } else {
      currentGroup.messages.push(msg);
    }
  });

  if (currentGroup) {
    groupedMessages.push(currentGroup);
  }

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div style={styles.messageList}>
      {groupedMessages.map((group, groupIdx) => (
        <div key={groupIdx} style={styles.messageGroup}>
          <div style={styles.messageGroupContent}>
            {!group.isCurrentUser && (
              <img
                src={
                  group.sender.avatar_url ||
                  'https://api.dicebear.com/7.x/avataaars/svg?seed=user'
                }
                alt={group.sender.username}
                style={styles.avatar}
              />
            )}

            <div
              style={{
                ...styles.messagesWrapper,
                alignItems: group.isCurrentUser
                  ? 'flex-end'
                  : 'flex-start',
              }}
            >
              {!group.isCurrentUser && (
                <p style={styles.username}>{group.sender.username}</p>
              )}

              {group.messages.map((msg, idx) => (
                <div
                  key={msg.id}
                  style={{
                    ...styles.messageBubble,
                    ...(group.isCurrentUser
                      ? styles.messageOwn
                      : styles.messageOther),
                    marginTop: idx > 0 ? '2px' : '0',
                  }}
                >
                  <p style={styles.messageContent}>{msg.content}</p>
                  <span style={styles.timestamp}>
                    {formatTime(msg.created_at)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

const styles = {
  messageList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  messageGroup: {
    display: 'flex',
    marginBottom: '4px',
  },
  messageGroupContent: {
    display: 'flex',
    gap: '8px',
    width: '100%',
  },
  avatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    marginTop: '2px',
    flexShrink: 0,
  },
  messagesWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    flex: 1,
  },
  username: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#b5bac1',
    margin: '0 0 4px 0',
  },
  messageBubble: {
    maxWidth: '60%',
    padding: '8px 12px',
    borderRadius: '8px',
    wordWrap: 'break-word',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  messageOwn: {
    background: '#5865f2',
    borderBottomRightRadius: '4px',
    alignSelf: 'flex-end',
    maxWidth: '70%',
  },
  messageOther: {
    background: '#383c43',
    borderBottomLeftRadius: '4px',
    alignSelf: 'flex-start',
  },
  messageContent: {
    margin: 0,
    color: '#ececf1',
    fontSize: '14px',
    lineHeight: '1.4',
  },
  timestamp: {
    fontSize: '11px',
    color: 'rgba(236, 236, 241, 0.6)',
  },
};
