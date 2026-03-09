set search_path to article_service;

CREATE TABLE article_outbox (
    id                  UUID                PRIMARY KEY,
    article_id          UUID                NOT NULL,
    article_name        VARCHAR(32)         NOT NULL,
    event_type          VARCHAR(32)         NOT NULL,     -- "CREATED" / "UPDATED"
    status              VARCHAR(32)         NOT NULL      DEFAULT 'PENDING',   -- PENDING, SENT, FAILED
    body                VARCHAR             NOT NULL,
    attempt_count       INT                 NOT NULL      DEFAULT 0,
    "source"            VARCHAR,
    created_at          TIMESTAMPTZ         NOT NULL      DEFAULT NOW(),
    updated_at          TIMESTAMPTZ,

    CONSTRAINT check_event_type CHECK (event_type IN ('CREATED', 'UPDATED')),
    CONSTRAINT check_status     CHECK (status     IN ('PENDING', 'SENT', 'FAILED'))
);

CREATE INDEX idx_article_outbox_status_created ON article_outbox (status, created_at) WHERE status = 'PENDING';

COMMENT ON TABLE article_outbox                IS 'Таблица для отправки сообщений в брокер';
COMMENT ON COLUMN article_outbox.id            IS 'Id';
COMMENT ON COLUMN article_outbox.article_id    IS 'Id статьи';
COMMENT ON COLUMN article_outbox.event_type    IS 'Тип отправки: создана/обработана';
COMMENT ON COLUMN article_outbox.status        IS 'Статус: обрабатывается/отправлено/ошибка';
COMMENT ON COLUMN article_outbox.body          IS 'Содержимое сообщения';
COMMENT ON COLUMN article_outbox."source"      IS 'Источник';
COMMENT ON COLUMN article_outbox.attempt_count IS 'Количество попыток отправки';
COMMENT ON COLUMN article_outbox.created_at    IS 'Время создания заявки';
COMMENT ON COLUMN article_outbox.updated_at    IS 'Время обработки заявки';
