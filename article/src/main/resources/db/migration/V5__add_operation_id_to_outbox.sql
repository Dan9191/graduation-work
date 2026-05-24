SET search_path TO article_service;

ALTER TABLE article_outbox
    ADD COLUMN operation_id UUID;

COMMENT ON COLUMN article_outbox.operation_id IS 'Идентификатор операции для сквозной трассировки через MDC';
