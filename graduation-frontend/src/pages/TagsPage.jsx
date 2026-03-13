// TagsPage.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getApi } from "../api/api";
import { getKeycloak } from "../auth/keycloak";

// ==================== МОДАЛКА СОЗДАНИЯ ТЕГА ====================
function TagModal({ isOpen, onClose, onSave, tag }) {
    const [name, setName] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!isOpen) return;
        setName(tag ? tag.name || "" : "");
    }, [isOpen, tag]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) return;

        setSaving(true);
        try {
            const api = getApi();
            if (tag) {
                alert("Редактирование тегов пока не поддерживается");
            } else {
                await api.post("/knowledge/api/v1/tags", { name: name.trim() });
            }
            onSave();
        } catch (err) {
            alert("Ошибка при сохранении тега");
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2 className="modal-title">Создать тег</h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block mb-1">Название тега *</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="brut-input"
                            required
                            autoFocus
                        />
                    </div>

                    <div className="flex gap-4">
                        <button
                            type="submit"
                            disabled={saving || !name.trim()}
                            className="brut-btn primary"
                        >
                            {saving ? "Сохранение..." : "Создать"}
                        </button>
                        <button type="button" onClick={onClose} className="brut-btn">
                            Отмена
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ==================== КАРТОЧКА ТЕГА ====================
function TagCard({ tag, isAdmin, onDelete, onClick }) {
    const [confirming, setConfirming] = useState(false);

    return (
        <div className="card tag-card">
            <div
                className="title cursor-pointer hover:underline"
                onClick={() => onClick?.(tag.id)}
            >
                {tag.name}
            </div>

            <div className="meta mt-1">ID: {tag.id}</div>

            {isAdmin && (
                <div className="actions mt-auto">
                    <span
                        className="action delete"
                        onClick={() => setConfirming(!confirming)}
                    >
                        удалить
                    </span>

                    {confirming && (
                        <span className="confirm-group">
                            <button
                                className="confirm-btn yes"
                                onClick={() => {
                                    onDelete(tag.id);
                                    setConfirming(false);
                                }}
                            >
                                да
                            </button>
                            <button
                                className="confirm-btn no"
                                onClick={() => setConfirming(false)}
                            >
                                нет
                            </button>
                        </span>
                    )}
                </div>
            )}
        </div>
    );
}

// ==================== ОСНОВНАЯ СТРАНИЦА ====================
export default function TagsPage() {
    const [tags, setTags] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);

    const keycloak = getKeycloak();
    const isAdmin = keycloak?.authenticated && keycloak.hasRealmRole?.("graduation.admin");
    const navigate = useNavigate();

    useEffect(() => {
        fetchTags();
    }, []);

    const fetchTags = async () => {
        setLoading(true);
        try {
            const api = getApi();
            const res = await api.get("/knowledge/api/v1/tags");
            setTags(res.data || []);
        } catch (err) {
            setError("Не удалось загрузить теги");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setModalOpen(true);
    };

    const handleDelete = async (id) => {
        try {
            await getApi().delete(`/knowledge/api/v1/tags/${id}`);
            fetchTags();
        } catch (err) {
            if (err.response?.status === 409 || err.response?.status === 400) {
                alert("Нельзя удалить — тег используется в статьях");
            } else {
                alert("Ошибка удаления тега");
            }
        }
    };

    const handleTagClick = (tagId) => {
        navigate(`/articles?tagId=${tagId}`);
    };

    const handleModalSave = () => {
        setModalOpen(false);
        fetchTags();
    };

    if (loading) return <div className="loading">Загрузка тегов...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="container">
            <div className="page-header">
                <h1>Теги</h1>
                {isAdmin && (
                    <span className="create-root-btn" onClick={handleCreate}>
                        + новый тег
                    </span>
                )}
            </div>

            {tags.length === 0 ? (
                <div className="empty-card">
                    Тегов пока нет
                    {isAdmin && (
                        <div className="mt-4 cursor-pointer" onClick={handleCreate}>
                            Создать первый тег →
                        </div>
                    )}
                </div>
            ) : (
                <div className="tags-grid">
                    {tags.map((tag) => (
                        <TagCard
                            key={tag.id}
                            tag={tag}
                            isAdmin={isAdmin}
                            onDelete={handleDelete}
                            onClick={handleTagClick}
                        />
                    ))}
                </div>
            )}

            <TagModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onSave={handleModalSave}
            />
        </div>
    );
}