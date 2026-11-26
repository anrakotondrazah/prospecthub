-- ProspectHub Notifications System
-- Migration: 004_notifications.sql
-- Created: 2026-11-26

-- Table: notifications
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  organization_id INT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT,
  link VARCHAR(500),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour optimiser les requetes frequentes
CREATE INDEX idx_notifications_org_user ON notifications(organization_id, user_id);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_notifications_is_read ON notifications(is_read) WHERE is_read = FALSE;

-- RLS (Row Level Security)
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policy: Les utilisateurs peuvent voir uniquement leurs propres notifications
CREATE POLICY notifications_select_policy ON notifications
  FOR SELECT
  USING (
    user_id = auth.uid()::text::uuid
  );

-- Policy: Le systeme peut creer des notifications
CREATE POLICY notifications_insert_policy ON notifications
  FOR INSERT
  WITH CHECK (true);

-- Policy: Les utilisateurs peuvent mettre a jour leurs propres notifications (mark as read)
CREATE POLICY notifications_update_policy ON notifications
  FOR UPDATE
  USING (
    user_id = auth.uid()::text::uuid
  );

-- Policy: Les utilisateurs peuvent supprimer leurs propres notifications
CREATE POLICY notifications_delete_policy ON notifications
  FOR DELETE
  USING (
    user_id = auth.uid()::text::uuid
  );

-- Function pour nettoyer les anciennes notifications (90 jours)
CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS void AS $$
BEGIN
  DELETE FROM notifications
  WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;

-- Commentaires pour documentation
COMMENT ON TABLE notifications IS 'Notifications systeme pour les utilisateurs';
COMMENT ON COLUMN notifications.type IS 'Types: lead_assigned, task_due, deal_won, mention';
COMMENT ON COLUMN notifications.link IS 'URL relative pour redirection (ex: /leads/123)';
