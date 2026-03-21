/*
  # Create Chat Application Tables

  1. New Tables
    - `users` - Store user profiles and authentication data
      - `id` (uuid, primary key) - User ID
      - `email` (text, unique) - User email for login
      - `username` (text, unique) - Display name in chat
      - `avatar_url` (text) - Profile picture URL
      - `created_at` (timestamp) - Account creation time
    
    - `channels` - Chat channels/rooms
      - `id` (uuid, primary key) - Channel ID
      - `name` (text, unique) - Channel name (e.g., #general)
      - `description` (text) - Channel description
      - `created_by` (uuid, fk) - Creator user ID
      - `created_at` (timestamp) - Creation time
    
    - `channel_members` - User membership in channels
      - `id` (uuid, primary key)
      - `channel_id` (uuid, fk) - Associated channel
      - `user_id` (uuid, fk) - Associated user
      - `joined_at` (timestamp) - When user joined
    
    - `messages` - All chat messages
      - `id` (uuid, primary key) - Message ID
      - `sender_id` (uuid, fk) - Who sent the message
      - `channel_id` (uuid, fk) - Channel (null for DMs)
      - `recipient_id` (uuid, fk) - For DMs only
      - `content` (text) - Message text
      - `created_at` (timestamp) - Send time

  2. Security
    - Enable RLS on all tables
    - Users can read their own profile and other profiles
    - Users can only see channels they're members of
    - Users can only see messages in accessible channels or their DMs
    - Users can only send messages to channels they're in or users they can DM
*/

-- Create users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  username text UNIQUE NOT NULL,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create channels table
CREATE TABLE IF NOT EXISTS channels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text DEFAULT '',
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Create channel membership table
CREATE TABLE IF NOT EXISTS channel_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id uuid NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at timestamptz DEFAULT now(),
  UNIQUE(channel_id, user_id)
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  channel_id uuid REFERENCES channels(id) ON DELETE CASCADE,
  recipient_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE channel_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Users RLS Policies
CREATE POLICY "Users can read all profiles"
  ON users FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Channels RLS Policies
CREATE POLICY "Users can read channels they are members of"
  ON channels FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM channel_members
      WHERE channel_members.channel_id = channels.id
      AND channel_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can create channels"
  ON channels FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

-- Channel Members RLS Policies
CREATE POLICY "Users can read their channel memberships"
  ON channel_members FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM channels
    WHERE channels.id = channel_members.channel_id
    AND channels.created_by = auth.uid()
  ));

CREATE POLICY "Users can join channels"
  ON channel_members FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Messages RLS Policies
CREATE POLICY "Users can read channel messages"
  ON messages FOR SELECT
  TO authenticated
  USING (
    (channel_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM channel_members
      WHERE channel_members.channel_id = messages.channel_id
      AND channel_members.user_id = auth.uid()
    ))
    OR
    (channel_id IS NULL AND (sender_id = auth.uid() OR recipient_id = auth.uid()))
  );

CREATE POLICY "Users can send messages to channels they are in"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id = auth.uid()
    AND (
      (channel_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM channel_members
        WHERE channel_members.channel_id = messages.channel_id
        AND channel_members.user_id = auth.uid()
      ))
      OR channel_id IS NULL
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_channel_members_user ON channel_members(user_id);
CREATE INDEX IF NOT EXISTS idx_channel_members_channel ON channel_members(channel_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_channel ON messages(channel_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
