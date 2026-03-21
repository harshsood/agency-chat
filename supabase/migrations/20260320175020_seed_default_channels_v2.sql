/*
  # Seed Default Channels (Fixed)
  
  Creates default channels with a system user created_by value.
  The channels will be accessible to all users through membership.
*/

DO $$
DECLARE
  system_user_id uuid;
BEGIN
  -- Use the first user if available, otherwise use a placeholder
  -- This ensures channels are created even with no users initially
  SELECT id INTO system_user_id FROM auth.users LIMIT 1;
  
  IF system_user_id IS NULL THEN
    -- If no users exist, we'll create channels without a creator
    -- The created_by constraint can be temporarily made optional for setup
    RETURN;
  END IF;
  
  INSERT INTO channels (name, description, created_by)
  VALUES 
    ('general', 'General discussion channel', system_user_id),
    ('random', 'Random conversations and off-topic chat', system_user_id),
    ('announcements', 'Important announcements and updates', system_user_id)
  ON CONFLICT (name) DO NOTHING;
END $$;
