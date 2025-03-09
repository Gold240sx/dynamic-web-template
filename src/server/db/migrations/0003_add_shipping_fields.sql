-- Create shipping_estimates table
CREATE TABLE IF NOT EXISTS shipping_estimates (
  id TEXT PRIMARY KEY,
  variant_id TEXT NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
  estimated_days INTEGER NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS shipping_estimates_variant_id_idx ON shipping_estimates(variant_id);

-- Create site_settings table
CREATE TABLE IF NOT EXISTS site_settings (
  id TEXT PRIMARY KEY,
  shipment_grouping_days INTEGER NOT NULL DEFAULT 7,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Add shipping fields to product_variants
ALTER TABLE product_variants ADD COLUMN is_physical INTEGER DEFAULT 0;
ALTER TABLE product_variants ADD COLUMN weight INTEGER DEFAULT 0;
ALTER TABLE product_variants ADD COLUMN length INTEGER DEFAULT 0;
ALTER TABLE product_variants ADD COLUMN width INTEGER DEFAULT 0;
ALTER TABLE product_variants ADD COLUMN height INTEGER DEFAULT 0;
ALTER TABLE product_variants ADD COLUMN requires_shipping INTEGER DEFAULT 0;
ALTER TABLE product_variants ADD COLUMN flat_rate_shipping INTEGER DEFAULT 0; 