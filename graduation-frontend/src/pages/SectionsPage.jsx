import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getApi } from "../api/api";
import { getKeycloak } from "../auth/keycloak";

// ==================== МОДАЛКА (уже в бруталист-стиле) ====================
function SectionModal({ isOpen, onClose, onSave, section, parentId }) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [selectedParentId, setSelectedParentId] = useState(null);
    const [saving, setSaving] = useState(false);
    const [availableSections, setAvailableSections] = useState([]);

    useEffect(() => {
        if (!isOpen) return;
        if (section) {
            setName(section.name || '');
            setDescription(section.description || '');
            setSelectedParentId(section.parent?.id || null);
        } else {
            setName('');
            setDescription('');
            setSelectedParentId(parentId || null);
        }

        const fetchSections = async () => {
            try {
                const api = getApi();
                const res = await api.get('/knowledge/api/v1/sections/tree');
                const flatten = (nodes, level = 0) => {
                    let res = [];
                    nodes.forEach(n => {
                        res.push({ ...n, level });
                        if (n.children?.length) res = res.concat(flatten(n.children, level + 1));
                    });
                    return res;
                };
                setAvailableSections(flatten(res.data || []));
            } catch (e) { console.error(e); }
        };
        fetchSections();
    }, [isOpen, section, parentId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) return;
        setSaving(true);
        try {
            const api = getApi();
            const data = {
                name: name.trim(),
                description: description.trim() || undefined,
                parentId: selectedParentId || null
            };
            if (section) {
                await api.put(`/knowledge/api/v1/sections/${section.id}`, data);
            } else {
                await api.post('/knowledge/api/v1/sections', data);
            }
            onSave();
        } catch (err) {
            alert('Ошибка сохранения');
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2 className="modal-title">{section ? 'Редактировать секцию' : 'Создать секцию'}</h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block mb-1">Название *</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)}
                               className="brut-input" required />
                    </div>
                    <div>
                        <label className="block mb-1">Описание</label>
                        <textarea value={description} onChange={e => setDescription(e.target.value)}
                                  rows="3" className="brut-input" />
                    </div>
                    <div>
                        <label className="block mb-1">Родительская секция</label>
                        <select value={selectedParentId || ''} onChange={e => setSelectedParentId(e.target.value ? Number(e.target.value) : null)}
                                className="brut-input">
                            <option value="">(корневая)</option>
                            {availableSections.map(s => (
                                <option key={s.id} value={s.id}>
                                    {'—'.repeat(s.level)} {s.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex gap-4">
                        <button type="submit" disabled={saving} className="brut-btn primary">
                            {saving ? 'Сохранение...' : 'Сохранить'}
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

function SectionTreeItem({ section, level = 0, isAdmin, onEdit, onDelete, onCreateSubsection, onCreateArticle, onSelect }) {
    const [confirmDelete, setConfirmDelete] = useState(false);

    const handleDelete = async () => {
        try {
            await onDelete(section.id);
            setConfirmDelete(false);
        } catch (err) {}
    };

    return (
        <div className="section-node" style={{ marginLeft: `${level * 32}px` }}>
            <div className="card">
                <div className="flex justify-between items-start gap-4">
                    {/* Клик по всей левой части — переход к статьям (работает у всех) */}
                    <div className="flex-1 cursor-pointer" onClick={() => onSelect?.(section.id)}>
                        <div className="title">{section.name}</div>
                        {section.description && <div className="meta">{section.description}</div>}
                        <div className="id">ID: {section.id}</div>
                    </div>

                    {/* Только админу — действия */}
                    {isAdmin && (
                        <div className="actions">
                            <span className="action" onClick={() => onEdit(section)}>правка</span>
                            <span className="action" onClick={() => onCreateSubsection(section.id)}>+секция</span>
                            <span className="action" onClick={() => onCreateArticle(section.id)}>+статья</span>
                            <span className={`action ${confirmDelete ? 'delete' : ''}`} onClick={() => setConfirmDelete(!confirmDelete)}>
                                {confirmDelete ? 'точно?' : 'удалить'}
                            </span>
                        </div>
                    )}
                </div>

                {/* Подтверждение удаления */}
                {confirmDelete && isAdmin && (
                    <div className="delete-confirm">
                        <button className="delete-yes" onClick={handleDelete}>ДА, УДАЛИТЬ</button>
                        <button className="delete-no" onClick={() => setConfirmDelete(false)}>отмена</button>
                    </div>
                )}
            </div>

            {/* Дети — рекурсия без лишних отступов */}
            {section.children?.length > 0 && (
                <div className="children">
                    {section.children.map(child => (
                        <SectionTreeItem
                            key={child.id}
                            section={child}
                            level={level + 1}
                            isAdmin={isAdmin}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            onCreateSubsection={onCreateSubsection}
                            onCreateArticle={onCreateArticle}
                            onSelect={onSelect}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

// ==================== ОСНОВНАЯ СТРАНИЦА ====================
export default function SectionsPage() {
    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingSection, setEditingSection] = useState(null);
    const [creatingForParentId, setCreatingForParentId] = useState(null);

    const keycloak = getKeycloak();
    const isAdmin = keycloak?.authenticated && keycloak.hasRealmRole?.('graduation.admin');
    const navigate = useNavigate();

    useEffect(() => { fetchSections(); }, []);

    const fetchSections = async () => {
        setLoading(true);
        try {
            const api = getApi();
            const res = await api.get('/knowledge/api/v1/sections/tree');
            setSections(res.data || []);
        } catch (err) {
            setError('Не удалось загрузить дерево');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateRoot = () => {
        setEditingSection(null);
        setCreatingForParentId(null);
        setModalOpen(true);
    };

    const handleCreateSubsection = (parentId) => {
        setEditingSection(null);
        setCreatingForParentId(parentId);
        setModalOpen(true);
    };

    const handleEdit = (section) => {
        setEditingSection(section);
        setCreatingForParentId(null);
        setModalOpen(true);
    };

    const handleDelete = async (id) => {
        try {
            await getApi().delete(`/knowledge/api/v1/sections/${id}`);
            fetchSections();
        } catch (err) {
            if (err.response?.status === 500) {
                alert('Нельзя удалить — есть вложенные секции или статьи');
            } else {
                alert('Ошибка удаления');
            }
        }
    };

    const handleCreateArticle = (sectionId) => {
        navigate(`/articles/new?sectionId=${sectionId}`);
    };

    const handleModalSave = () => {
        setModalOpen(false);
        fetchSections();
    };

    // Клик по секции → статьи (для ВСЕХ пользователей)
    const handleSelect = (sectionId) => {
        navigate(`/articles?sectionId=${sectionId}`);
    };

    if (loading) return <div className="flex items-center justify-center py-24 text-slate-400 text-sm">Загрузка...</div>;
    if (error) return <div className="flex items-center justify-center py-24 text-red-500 text-sm">{error}</div>;

    return (
        <div className="container">
            <div className="page-header">
                <h1>Секции</h1>
                {isAdmin && (
                    <span className="create-root-btn" onClick={handleCreateRoot}>
                        + корневая секция
                    </span>
                )}
            </div>

            {sections.length === 0 ? (
                <div className="empty-card">
                    Секций пока нет
                    {isAdmin && (
                        <div className="mt-4" onClick={handleCreateRoot}>
                            Создать первую →
                        </div>
                    )}
                </div>
            ) : (
                <div className="tree">
                    {sections.map(section => (
                        <SectionTreeItem
                            key={section.id}
                            section={section}
                            level={0}
                            isAdmin={isAdmin}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onCreateSubsection={handleCreateSubsection}
                            onCreateArticle={handleCreateArticle}
                            onSelect={handleSelect}
                        />
                    ))}
                </div>
            )}

            <SectionModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onSave={handleModalSave}
                section={editingSection}
                parentId={creatingForParentId}
            />
        </div>
    );
}