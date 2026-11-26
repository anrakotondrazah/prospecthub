-- ProspectHub CRM - Credits System Migration
-- Systeme de credits pour deblocage de leads

-- 1. Ajout colonne credits_balance dans organizations
ALTER TABLE organizations
ADD COLUMN IF NOT EXISTS credits_balance INT DEFAULT 10;

-- 2. Table transactions de credits
CREATE TABLE IF NOT EXISTS credit_transactions (
  id SERIAL PRIMARY KEY,
  organization_id INT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('purchase', 'spend', 'bonus', 'refund', 'monthly')),
  amount INT NOT NULL,
  balance_after INT NOT NULL,
  description TEXT,
  reference_type VARCHAR(50),
  reference_id VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour queries frequentes
CREATE INDEX IF NOT EXISTS idx_credit_transactions_org
ON credit_transactions(organization_id);

CREATE INDEX IF NOT EXISTS idx_credit_transactions_created
ON credit_transactions(created_at DESC);

-- 3. Table leads debloques (tracking + evite doublons)
CREATE TABLE IF NOT EXISTS unlocked_leads (
  id SERIAL PRIMARY KEY,
  organization_id INT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  shared_company_id INT NOT NULL REFERENCES shared_companies(id) ON DELETE CASCADE,
  lead_id INT REFERENCES leads(id) ON DELETE SET NULL,
  credits_spent INT NOT NULL DEFAULT 1,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  unlocked_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  UNIQUE(organization_id, shared_company_id)
);

-- Index pour verifier si deja debloque
CREATE INDEX IF NOT EXISTS idx_unlocked_leads_org_shared
ON unlocked_leads(organization_id, shared_company_id);

-- 4. RLS Policies

-- credit_transactions: visible uniquement par l'org
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their org credit transactions"
ON credit_transactions FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id FROM profiles WHERE id = auth.uid()
  )
);

CREATE POLICY "System can insert credit transactions"
ON credit_transactions FOR INSERT
WITH CHECK (
  organization_id IN (
    SELECT organization_id FROM profiles WHERE id = auth.uid()
  )
);

-- unlocked_leads: visible uniquement par l'org
ALTER TABLE unlocked_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their org unlocked leads"
ON unlocked_leads FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id FROM profiles WHERE id = auth.uid()
  )
);

CREATE POLICY "Users can unlock leads for their org"
ON unlocked_leads FOR INSERT
WITH CHECK (
  organization_id IN (
    SELECT organization_id FROM profiles WHERE id = auth.uid()
  )
);

-- 5. shared_companies: lecture publique pour tous les users authentifies
-- (pas de RLS strict car c'est la base commune)

-- Verification si RLS deja active
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'shared_companies'
  ) THEN
    ALTER TABLE shared_companies ENABLE ROW LEVEL SECURITY;

    CREATE POLICY "Authenticated users can view shared companies"
    ON shared_companies FOR SELECT
    USING (auth.uid() IS NOT NULL);
  END IF;
END $$;

-- 6. Fonction pour calculer le cout en credits selon le score
CREATE OR REPLACE FUNCTION get_lead_credit_cost(quality_score INT)
RETURNS INT AS $$
BEGIN
  IF quality_score >= 80 THEN
    RETURN 3; -- Lead chaud
  ELSIF quality_score >= 50 THEN
    RETURN 2; -- Lead tiede
  ELSE
    RETURN 1; -- Lead froid
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 7. Fonction pour debloquer un lead (transaction atomique)
CREATE OR REPLACE FUNCTION unlock_lead(
  p_org_id INT,
  p_shared_company_id INT,
  p_user_id UUID
)
RETURNS TABLE(
  success BOOLEAN,
  message TEXT,
  lead_id INT,
  credits_spent INT,
  new_balance INT
) AS $$
DECLARE
  v_shared_company shared_companies%ROWTYPE;
  v_current_balance INT;
  v_cost INT;
  v_new_lead_id INT;
  v_new_balance INT;
BEGIN
  -- Verifier si deja debloque
  IF EXISTS (
    SELECT 1 FROM unlocked_leads
    WHERE organization_id = p_org_id AND shared_company_id = p_shared_company_id
  ) THEN
    RETURN QUERY SELECT false, 'Lead deja debloque'::TEXT, NULL::INT, NULL::INT, NULL::INT;
    RETURN;
  END IF;

  -- Recuperer shared_company
  SELECT * INTO v_shared_company FROM shared_companies WHERE id = p_shared_company_id;
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'Entreprise non trouvee'::TEXT, NULL::INT, NULL::INT, NULL::INT;
    RETURN;
  END IF;

  -- Calculer cout
  v_cost := get_lead_credit_cost(v_shared_company.quality_score);

  -- Verifier solde
  SELECT credits_balance INTO v_current_balance FROM organizations WHERE id = p_org_id FOR UPDATE;
  IF v_current_balance < v_cost THEN
    RETURN QUERY SELECT false, 'Credits insuffisants'::TEXT, NULL::INT, v_cost, v_current_balance;
    RETURN;
  END IF;

  -- Creer le lead
  INSERT INTO leads (
    organization_id,
    shared_company_id,
    company_name,
    company_siret,
    phone,
    email,
    address_city,
    address_postal_code,
    address_country,
    source,
    status,
    score,
    created_by
  ) VALUES (
    p_org_id,
    p_shared_company_id,
    v_shared_company.company_name,
    v_shared_company.siret,
    v_shared_company.phone,
    v_shared_company.email,
    v_shared_company.address_city,
    v_shared_company.address_postal_code,
    COALESCE(v_shared_company.address_country, 'FR'),
    'base_entreprises',
    'new',
    v_shared_company.quality_score,
    NULL
  ) RETURNING id INTO v_new_lead_id;

  -- Deduire credits
  v_new_balance := v_current_balance - v_cost;
  UPDATE organizations SET credits_balance = v_new_balance WHERE id = p_org_id;

  -- Enregistrer transaction
  INSERT INTO credit_transactions (
    organization_id, type, amount, balance_after, description, reference_type, reference_id
  ) VALUES (
    p_org_id, 'spend', -v_cost, v_new_balance,
    'Deblocage lead: ' || v_shared_company.company_name,
    'lead', v_new_lead_id::TEXT
  );

  -- Enregistrer deblocage
  INSERT INTO unlocked_leads (
    organization_id, shared_company_id, lead_id, credits_spent, unlocked_by
  ) VALUES (
    p_org_id, p_shared_company_id, v_new_lead_id, v_cost, p_user_id
  );

  RETURN QUERY SELECT true, 'Lead debloque avec succes'::TEXT, v_new_lead_id, v_cost, v_new_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
