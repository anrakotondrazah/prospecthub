-- ProspectHub CRM - Commerce Module (Quotes & Products)
-- HubSpot-like quoting system

-- 1. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
  organization_id INT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  sku VARCHAR(100),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  unit_price DECIMAL(15,2) NOT NULL DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'EUR',
  unit VARCHAR(50) DEFAULT 'unit', -- 'unit', 'hour', 'day', 'month', 'year', 'kg', 'm2', etc.
  tax_rate DECIMAL(5,2) DEFAULT 20.00, -- TVA rate
  category VARCHAR(100),
  is_recurring BOOLEAN DEFAULT false,
  billing_frequency VARCHAR(20), -- 'monthly', 'quarterly', 'yearly'
  is_active BOOLEAN DEFAULT true,
  image_url VARCHAR(500),
  metadata JSONB,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. QUOTES TABLE
CREATE TABLE IF NOT EXISTS quotes (
  id SERIAL PRIMARY KEY,
  uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
  organization_id INT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  quote_number VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'pending', 'sent', 'approved', 'rejected', 'expired'

  -- Associated records
  deal_id INT REFERENCES deals(id) ON DELETE SET NULL,
  company_id INT REFERENCES companies(id) ON DELETE SET NULL,
  lead_id INT REFERENCES leads(id) ON DELETE SET NULL,
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Recipient info
  recipient_name VARCHAR(255),
  recipient_email VARCHAR(255),
  recipient_phone VARCHAR(50),
  recipient_company VARCHAR(255),
  recipient_address TEXT,

  -- Dates
  quote_date DATE DEFAULT CURRENT_DATE,
  valid_until DATE,
  sent_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,

  -- Totals (computed from quote_lines)
  subtotal DECIMAL(15,2) DEFAULT 0,
  discount_type VARCHAR(20) DEFAULT 'percentage', -- 'percentage', 'fixed'
  discount_value DECIMAL(15,2) DEFAULT 0,
  discount_amount DECIMAL(15,2) DEFAULT 0,
  tax_amount DECIMAL(15,2) DEFAULT 0,
  total DECIMAL(15,2) DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'EUR',

  -- Content
  introduction TEXT,
  terms TEXT,
  notes TEXT,
  signature_url VARCHAR(500),

  -- PDF
  pdf_url VARCHAR(500),
  pdf_generated_at TIMESTAMPTZ,

  -- Metadata
  metadata JSONB,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,

  UNIQUE(organization_id, quote_number)
);

-- 3. QUOTE_LINES TABLE
CREATE TABLE IF NOT EXISTS quote_lines (
  id SERIAL PRIMARY KEY,
  uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
  quote_id INT NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  product_id INT REFERENCES products(id) ON DELETE SET NULL,

  -- Line details (can override product values)
  name VARCHAR(255) NOT NULL,
  description TEXT,
  sku VARCHAR(100),
  quantity DECIMAL(15,4) NOT NULL DEFAULT 1,
  unit VARCHAR(50) DEFAULT 'unit',
  unit_price DECIMAL(15,2) NOT NULL DEFAULT 0,

  -- Discount on line
  discount_type VARCHAR(20) DEFAULT 'percentage', -- 'percentage', 'fixed'
  discount_value DECIMAL(15,2) DEFAULT 0,
  discount_amount DECIMAL(15,2) DEFAULT 0,

  -- Tax
  tax_rate DECIMAL(5,2) DEFAULT 20.00,
  tax_amount DECIMAL(15,2) DEFAULT 0,

  -- Totals
  subtotal DECIMAL(15,2) DEFAULT 0, -- quantity * unit_price - discount
  total DECIMAL(15,2) DEFAULT 0, -- subtotal + tax

  -- Ordering
  display_order INT DEFAULT 0,

  -- Metadata
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. INDEXES
CREATE INDEX idx_products_organization_id ON products(organization_id);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_is_active ON products(is_active);

CREATE INDEX idx_quotes_organization_id ON quotes(organization_id);
CREATE INDEX idx_quotes_quote_number ON quotes(quote_number);
CREATE INDEX idx_quotes_status ON quotes(status);
CREATE INDEX idx_quotes_deal_id ON quotes(deal_id);
CREATE INDEX idx_quotes_company_id ON quotes(company_id);
CREATE INDEX idx_quotes_lead_id ON quotes(lead_id);
CREATE INDEX idx_quotes_owner_id ON quotes(owner_id);
CREATE INDEX idx_quotes_quote_date ON quotes(quote_date);
CREATE INDEX idx_quotes_valid_until ON quotes(valid_until);

CREATE INDEX idx_quote_lines_quote_id ON quote_lines(quote_id);
CREATE INDEX idx_quote_lines_product_id ON quote_lines(product_id);
CREATE INDEX idx_quote_lines_display_order ON quote_lines(display_order);

-- 5. ROW LEVEL SECURITY
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_lines ENABLE ROW LEVEL SECURITY;

-- RLS Policies for products
CREATE POLICY "Users can view their organization's products"
  ON products FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can insert products in their organization"
  ON products FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update products in their organization"
  ON products FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can delete products in their organization"
  ON products FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

-- RLS Policies for quotes
CREATE POLICY "Users can view their organization's quotes"
  ON quotes FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can insert quotes in their organization"
  ON quotes FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update quotes in their organization"
  ON quotes FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can delete quotes in their organization"
  ON quotes FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

-- RLS Policies for quote_lines
CREATE POLICY "Users can view quote lines in their organization"
  ON quote_lines FOR SELECT
  USING (
    quote_id IN (
      SELECT id FROM quotes WHERE organization_id IN (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can insert quote lines in their organization"
  ON quote_lines FOR INSERT
  WITH CHECK (
    quote_id IN (
      SELECT id FROM quotes WHERE organization_id IN (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update quote lines in their organization"
  ON quote_lines FOR UPDATE
  USING (
    quote_id IN (
      SELECT id FROM quotes WHERE organization_id IN (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can delete quote lines in their organization"
  ON quote_lines FOR DELETE
  USING (
    quote_id IN (
      SELECT id FROM quotes WHERE organization_id IN (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

-- 6. FUNCTION: Generate quote number
CREATE OR REPLACE FUNCTION generate_quote_number(org_id INT)
RETURNS VARCHAR(50) AS $$
DECLARE
  current_year VARCHAR(4);
  next_number INT;
  quote_prefix VARCHAR(10);
BEGIN
  current_year := TO_CHAR(NOW(), 'YYYY');

  -- Get next number for this organization and year
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(quote_number FROM 'DEV-' || current_year || '-(\d+)') AS INT)
  ), 0) + 1
  INTO next_number
  FROM quotes
  WHERE organization_id = org_id
    AND quote_number LIKE 'DEV-' || current_year || '-%';

  RETURN 'DEV-' || current_year || '-' || LPAD(next_number::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- 7. FUNCTION: Calculate quote line totals
CREATE OR REPLACE FUNCTION calculate_quote_line_totals()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate discount amount
  IF NEW.discount_type = 'percentage' THEN
    NEW.discount_amount := ROUND((NEW.quantity * NEW.unit_price) * (NEW.discount_value / 100), 2);
  ELSE
    NEW.discount_amount := NEW.discount_value;
  END IF;

  -- Calculate subtotal
  NEW.subtotal := ROUND((NEW.quantity * NEW.unit_price) - NEW.discount_amount, 2);

  -- Calculate tax
  NEW.tax_amount := ROUND(NEW.subtotal * (NEW.tax_rate / 100), 2);

  -- Calculate total
  NEW.total := NEW.subtotal + NEW.tax_amount;

  NEW.updated_at := NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. TRIGGER: Auto-calculate quote line totals
CREATE TRIGGER trigger_calculate_quote_line_totals
  BEFORE INSERT OR UPDATE ON quote_lines
  FOR EACH ROW EXECUTE FUNCTION calculate_quote_line_totals();

-- 9. FUNCTION: Update quote totals from lines
CREATE OR REPLACE FUNCTION update_quote_totals()
RETURNS TRIGGER AS $$
DECLARE
  quote_record RECORD;
  calculated_subtotal DECIMAL(15,2);
  calculated_tax DECIMAL(15,2);
  calculated_discount DECIMAL(15,2);
  calculated_total DECIMAL(15,2);
BEGIN
  -- Get the quote_id based on operation
  IF TG_OP = 'DELETE' THEN
    -- Calculate totals for the quote
    SELECT
      COALESCE(SUM(subtotal), 0),
      COALESCE(SUM(tax_amount), 0)
    INTO calculated_subtotal, calculated_tax
    FROM quote_lines
    WHERE quote_id = OLD.quote_id;

    -- Get quote discount info
    SELECT discount_type, discount_value INTO quote_record
    FROM quotes WHERE id = OLD.quote_id;

    -- Calculate quote discount
    IF quote_record.discount_type = 'percentage' THEN
      calculated_discount := ROUND(calculated_subtotal * (quote_record.discount_value / 100), 2);
    ELSE
      calculated_discount := quote_record.discount_value;
    END IF;

    calculated_total := calculated_subtotal - calculated_discount + calculated_tax;

    -- Update quote
    UPDATE quotes
    SET
      subtotal = calculated_subtotal,
      discount_amount = calculated_discount,
      tax_amount = calculated_tax,
      total = calculated_total,
      updated_at = NOW()
    WHERE id = OLD.quote_id;

    RETURN OLD;
  ELSE
    -- Calculate totals for the quote
    SELECT
      COALESCE(SUM(subtotal), 0),
      COALESCE(SUM(tax_amount), 0)
    INTO calculated_subtotal, calculated_tax
    FROM quote_lines
    WHERE quote_id = NEW.quote_id;

    -- Get quote discount info
    SELECT discount_type, discount_value INTO quote_record
    FROM quotes WHERE id = NEW.quote_id;

    -- Calculate quote discount
    IF quote_record.discount_type = 'percentage' THEN
      calculated_discount := ROUND(calculated_subtotal * (quote_record.discount_value / 100), 2);
    ELSE
      calculated_discount := quote_record.discount_value;
    END IF;

    calculated_total := calculated_subtotal - calculated_discount + calculated_tax;

    -- Update quote
    UPDATE quotes
    SET
      subtotal = calculated_subtotal,
      discount_amount = calculated_discount,
      tax_amount = calculated_tax,
      total = calculated_total,
      updated_at = NOW()
    WHERE id = NEW.quote_id;

    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- 10. TRIGGER: Auto-update quote totals
CREATE TRIGGER trigger_update_quote_totals
  AFTER INSERT OR UPDATE OR DELETE ON quote_lines
  FOR EACH ROW EXECUTE FUNCTION update_quote_totals();

-- 11. FUNCTION: Update products/quotes updated_at timestamp
CREATE OR REPLACE FUNCTION update_commerce_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 12. TRIGGERS: Auto-update timestamps
CREATE TRIGGER trigger_update_products_timestamp
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_commerce_updated_at();

CREATE TRIGGER trigger_update_quotes_timestamp
  BEFORE UPDATE ON quotes
  FOR EACH ROW EXECUTE FUNCTION update_commerce_updated_at();
