set search_path to article_service;

-- section
CREATE TABLE IF NOT EXISTS a_section (
                                 id          BIGSERIAL PRIMARY KEY,
                                 name        TEXT NOT NULL,
                                 description TEXT,
                                 parent_id   BIGINT REFERENCES a_section(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_a_section_parent_id ON a_section(parent_id);

COMMENT ON TABLE a_section IS 'Секция/раздел';
COMMENT ON COLUMN a_section.id IS 'Id';
COMMENT ON COLUMN a_section.name IS 'Название раздела';
COMMENT ON COLUMN a_section.description IS 'Описание';
COMMENT ON COLUMN a_section.parent_id IS 'Родительский элемент';

-- article
CREATE TABLE IF NOT EXISTS article (
                         id           UUID PRIMARY KEY,
                         title        TEXT NOT NULL,
                         description  TEXT NOT NULL,
                         main_picture TEXT NOT NULL,
                         "source"     TEXT,
                         body         TEXT NOT NULL,
                         created_at   TIMESTAMPTZ DEFAULT NOW() NOT NULL,
                         updated_at   TIMESTAMPTZ,
                         view_count   BIGINT DEFAULT 0 NOT NULL,
                         section_id   BIGINT NOT NULL REFERENCES a_section(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_a_section_id ON article(section_id);

COMMENT ON TABLE article IS 'Статья';
COMMENT ON COLUMN article.id IS 'Id';
COMMENT ON COLUMN article.title IS 'Заголовок статьи';
COMMENT ON COLUMN article.description IS 'Описание статьи';
COMMENT ON COLUMN article.main_picture IS 'Основное изображение';
COMMENT ON COLUMN article."source" IS 'Источник';
COMMENT ON COLUMN article.body IS 'Содержимое статьи в формате markdown';
COMMENT ON COLUMN article.created_at IS 'Дата создания';
COMMENT ON COLUMN article.updated_at IS 'Дата последнего обновления';
COMMENT ON COLUMN article.view_count IS 'Количество просмотров';
COMMENT ON COLUMN article.section_id IS 'Id секции';

-- tag
CREATE TABLE IF NOT EXISTS tag (
                     id   BIGSERIAL PRIMARY KEY,
                     name TEXT UNIQUE NOT NULL
);

COMMENT ON TABLE tag IS 'Тег';
COMMENT ON COLUMN tag.id IS 'Id';
COMMENT ON COLUMN tag.name IS 'Название тега';

-- article_tag
CREATE TABLE IF NOT EXISTS article_tag (
                             article_id UUID NOT NULL REFERENCES article(id) ON DELETE CASCADE,
                             tag_id     BIGINT NOT NULL REFERENCES tag(id) ON DELETE CASCADE,
                             PRIMARY KEY (article_id, tag_id)
);

CREATE INDEX IF NOT EXISTS idx_article_tag_tag_id ON article_tag(tag_id);
CREATE INDEX IF NOT EXISTS idx_article_tag_article_id ON article_tag(article_id);

COMMENT ON TABLE article_tag IS 'Связь статьи с тегами';
COMMENT ON COLUMN article_tag.article_id IS 'Id статьи';
COMMENT ON COLUMN article_tag.tag_id IS 'Id тега';
