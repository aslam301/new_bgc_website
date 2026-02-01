-- Fix infinite recursion in community_admins RLS policies
-- Drop the problematic policies
DROP POLICY IF EXISTS "Community admins viewable by community members" ON community_admins;
DROP POLICY IF EXISTS "Community owners can manage admins" ON community_admins;

-- Create simplified policies that don't cause recursion

-- Allow users to view admin records for communities they're part of
-- Use a security definer function to avoid recursion
CREATE OR REPLACE FUNCTION is_community_admin(check_community_id UUID, check_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM community_admins
    WHERE community_id = check_community_id
    AND user_id = check_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_community_owner(check_community_id UUID, check_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM community_admins
    WHERE community_id = check_community_id
    AND user_id = check_user_id
    AND role = 'owner'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- New policies using security definer functions
CREATE POLICY "Users can view community_admins for their communities"
  ON community_admins FOR SELECT
  USING (
    user_id = auth.uid()  -- Can see their own admin records
    OR
    is_community_admin(community_id, auth.uid())  -- Can see other admins in their communities
    OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Community owners can insert admins"
  ON community_admins FOR INSERT
  WITH CHECK (
    is_community_owner(community_id, auth.uid())
    OR
    (user_id = auth.uid() AND community_id IN (
      SELECT id FROM communities WHERE created_by = auth.uid()
    ))
  );

CREATE POLICY "Community owners can update admins"
  ON community_admins FOR UPDATE
  USING (
    is_community_owner(community_id, auth.uid())
  );

CREATE POLICY "Community owners can delete admins"
  ON community_admins FOR DELETE
  USING (
    is_community_owner(community_id, auth.uid())
  );
