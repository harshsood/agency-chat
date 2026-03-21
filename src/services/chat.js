import { supabase } from './supabaseClient';

export const chatService = {
  async getChannels() {
    try {
      const { data, error } = await supabase
        .from('channel_members')
        .select('channels:channel_id(*)')
        .order('joined_at', { ascending: false });

      if (error) throw error;

      const channels = data?.map((m) => m.channels).filter(Boolean) || [];
      return channels;
    } catch (error) {
      console.error('Error fetching channels:', error);
      return [];
    }
  },

  async getUsers() {
    try {
      const { data, error } = await supabase.from('users').select('*');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  },

  async sendMessage(senderId, content, channelId = null, recipientId = null) {
    try {
      const { data, error } = await supabase.from('messages').insert([
        {
          sender_id: senderId,
          content,
          channel_id: channelId,
          recipient_id: recipientId,
        },
      ]);

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async getChannelMessages(channelId, limit = 50) {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(
          `
          *,
          sender:sender_id(id, username, avatar_url)
        `
        )
        .eq('channel_id', channelId)
        .isNull('recipient_id')
        .order('created_at', { ascending: true })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching channel messages:', error);
      return [];
    }
  },

  async getDirectMessages(userId, otherUserId, limit = 50) {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(
          `
          *,
          sender:sender_id(id, username, avatar_url)
        `
        )
        .isNull('channel_id')
        .or(
          `and(sender_id.eq.${userId},recipient_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},recipient_id.eq.${userId})`
        )
        .order('created_at', { ascending: true })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching direct messages:', error);
      return [];
    }
  },

  async joinChannel(channelId) {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user.id;

      const { error } = await supabase.from('channel_members').insert([
        {
          channel_id: channelId,
          user_id: userId,
        },
      ]);

      if (error && error.code !== '23505') throw error;
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  subscribeToChannelMessages(channelId, callback) {
    const subscription = supabase
      .channel(`messages:channel_id=eq.${channelId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `channel_id=eq.${channelId}`,
        },
        callback
      )
      .subscribe();

    return subscription;
  },

  subscribeToDirectMessages(userId, otherUserId, callback) {
    const subscription = supabase
      .channel(`direct_messages:${userId}:${otherUserId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          const msg = payload.new;
          if (
            (msg.sender_id === userId && msg.recipient_id === otherUserId) ||
            (msg.sender_id === otherUserId && msg.recipient_id === userId)
          ) {
            callback(payload);
          }
        }
      )
      .subscribe();

    return subscription;
  },
};
