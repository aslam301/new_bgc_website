-- Fix follower_count to start at 0 instead of 1
-- The trigger will increment it to 1 when the first follower (admin) is added

-- Change default value
ALTER TABLE communities
ALTER COLUMN follower_count SET DEFAULT 0;

-- Update existing communities to correct count
-- (This recalculates based on actual followers)
UPDATE communities
SET follower_count = (
  SELECT COUNT(*)
  FROM community_followers
  WHERE community_id = communities.id
);
