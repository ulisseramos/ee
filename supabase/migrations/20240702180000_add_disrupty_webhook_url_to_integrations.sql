-- Adiciona a coluna para integração Disrupty
ALTER TABLE integrations
ADD COLUMN disrupty_webhook_url TEXT; 