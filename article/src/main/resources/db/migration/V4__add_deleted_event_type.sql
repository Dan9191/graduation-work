set search_path to article_service;

ALTER TABLE article_outbox
    DROP CONSTRAINT check_event_type,
    ADD CONSTRAINT check_event_type CHECK (event_type IN ('CREATED', 'UPDATED', 'DELETED'));
