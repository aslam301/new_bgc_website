-- Run this in Supabase SQL Editor to check if your community exists

-- Check if community was created
SELECT id, slug, name, city, is_active, created_at
FROM communities
WHERE slug = 'board-game-jungle';

-- Check if you're an admin of this community
SELECT ca.role, ca.created_at, p.email
FROM community_admins ca
JOIN profiles p ON p.id = ca.user_id
WHERE ca.community_id = (SELECT id FROM communities WHERE slug = 'board-game-jungle');

-- Check if you're following it
SELECT cf.created_at, p.email
FROM community_followers cf
JOIN profiles p ON p.id = cf.user_id
WHERE cf.community_id = (SELECT id FROM communities WHERE slug = 'board-game-jungle');
