import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getApi } from "../api/api";
import { getKeycloak } from "../auth/keycloak";
import { useNavigate } from "react-router-dom";

// Модальное окно для создания/редактирования секции
function SectionModal({ isOpen, onClose, onSave, section, parentId }) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [selectedParentId, setSelectedParentId] = useState(null);
    const [saving, setSaving] = useState(false);
    const [availableSections, setAvailableSections] = useState([]);

    useEffect(() => {
        if (isOpen) {
            if (section) {
                setName(section.name || '');
                setDescription(section.description || '');
                setSelectedParentId(section.parent?.id || null);
            } else {
                setName('');
                setDescription('');
                setSelectedParentId(parentId || null);
            }
            // Загружаем список всех секций для выбора родителя
            const fetchSections = async () => {
                try {
                    const api = getApi();
                    const res = await api.get('/knowledge/api/v1/sections/tree');
                    // Преобразуем дерево в плоский список для select
                    const flatten = (sections, level = 0) => {
                        let result = [];
                        sections.forEach(s => {
                            result.push({ ...s, level });
                            if (s.children && s.children.length) {
                                result = result.concat(flatten(s.children, level + 1));
                            }
                        });
                        return result;
                    };
                    setAvailableSections(flatten(res.data || []));
                } catch (err) {
                    console.error('Не удалось загрузить секции для выбора родителя', err);
                }
            };
            fetchSections();
        }
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
                // Редактирование
                await api.put(`/knowledge/api/v1/sections/${section.id}`, data);
            } else {
                // Создание
                await api.post('/knowledge/api/v1/sections', data);
            }
            onSave();
        } catch (err) {
            alert('Не удалось сохранить секцию');
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white border-4 border-black p-6 w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">
                    {section ? 'Редактировать секцию' : 'Создать секцию'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block mb-1 font-medium">Название *</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full border-2 border-black p-2 bg-white focus:outline-none focus:bg-gray-50"
                            required
                        />
                    </div>
                    <div>
                        <label className="block mb-1 font-medium">Описание</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows="3"
                            className="w-full border-2 border-black p-2 bg-white focus:outline-none focus:bg-gray-50"
                        />
                    </div>
                    <div>
                        <label className="block mb-1 font-medium">Родительская секция</label>
                        <select
                            value={selectedParentId || ''}
                            onChange={(e) => setSelectedParentId(e.target.value ? Number(e.target.value) : null)}
                            className="w-full border-2 border-black p-2 bg-white focus:outline-none focus:bg-gray-50"
                        >
                            <option value="">(корневая секция)</option>
                            {availableSections.map(s => (
                                <option key={s.id} value={s.id}>
                                    {'—'.repeat(s.level)} {s.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex gap-4 pt-4">
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-1 border-2 border-black px-4 py-2 bg-black text-white hover:bg-white hover:text-black transition disabled:opacity-50"
                        >
                            {saving ? 'Сохранение...' : 'Сохранить'}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 border-2 border-black px-4 py-2 hover:bg-black hover:text-white transition"
                        >
                            Отмена
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// Рекурсивный компонент для отображения дерева секций
function SectionTreeItem({ section, level = 0, isAdmin, onEdit, onDelete, onCreateSubsection, onCreateArticle }) {
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await onDelete(section.id);
        } catch (err) {
            // ошибка уже обработана в родителе
        } finally {
            setDeleting(false);
            setConfirmDelete(false);
        }
    };

    return (
        <div className="border-2 border-black mb-2" style={{ marginLeft: `${level * 24}px` }}>
            <div className="p-4 bg-white hover:bg-gray-50 transition">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <Link
                            to={`/articles?sectionId=${section.id}`}
                            className="block"
                        >
                            <div className="font-semibold text-lg">{section.name}</div>
                            {section.description && (
                                <div className="text-sm text-gray-600 mt-1">{section.description}</div>
                            )}
                            <div className="text-xs text-gray-400 mt-1">ID: {section.id}</div>
                        </Link>
                    </div>
                    {isAdmin && (
                        <div className="flex gap-2 ml-4">
                            <button
                                onClick={() => onCreateArticle(section.id)}
                                className="border border-black px-2 py-1 text-xs hover:bg-black hover:text-white transition"
                                title="Создать статью в этой секции"
                            >
                                + Статья
                            </button>
                            <button
                                onClick={() => onCreateSubsection(section.id)}
                                className="border border-black px-2 py-1 text-xs hover:bg-black hover:text-white transition"
                                title="Создать подсекцию"
                            >
                                + Подсекция
                            </button>
                            <button
                                onClick={() => onEdit(section)}
                                className="border border-black px-2 py-1 text-xs hover:bg-black hover:text-white transition"
                                title="Редактировать"
                            >
                                ✎
                            </button>
                            {!confirmDelete ? (
                                <button
                                    onClick={() => setConfirmDelete(true)}
                                    disabled={deleting}
                                    className="border border-black px-2 py-1 text-xs hover:bg-black hover:text-white transition disabled:opacity-30"
                                    title="Удалить"
                                >
                                    ×
                                </button>
                            ) : (
                                <div className="flex gap-1">
                                    <button
                                        onClick={handleDelete}
                                        disabled={deleting}
                                        className="border border-red-600 px-2 py-1 text-xs text-red-600 hover:bg-red-600 hover:text-white transition"
                                    >
                                        Да
                                    </button>
                                    <button
                                        onClick={() => setConfirmDelete(false)}
                                        className="border border-black px-2 py-1 text-xs hover:bg-black hover:text-white transition"
                                    >
                                        Нет
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
            {section.children && section.children.length > 0 && (
                <div className="pl-4 border-l-2 border-black">
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
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export default function SectionsPage() {
    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingSection, setEditingSection] = useState(null);
    const [creatingForParentId, setCreatingForParentId] = useState(null);

    const keycloak = getKeycloak();
    const isAdmin = keycloak?.authenticated &&
        keycloak.hasRealmRole?.('graduation.admin');
    const isAuthenticated = keycloak?.authenticated;

    useEffect(() => {
        fetchSections();
    }, []);

    const fetchSections = async () => {
        setLoading(true);
        try {
            const api = getApi();
            const res = await api.get('/knowledge/api/v1/sections/tree');
            setSections(res.data || []);
        } catch (err) {
            setError('Не удалось загрузить секции');
            console.error(err);
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

    const handleDelete = async (sectionId) => {
        try {
            const api = getApi();
            await api.delete(`/knowledge/api/v1/sections/${sectionId}`);
            // Обновляем дерево после удаления
            await fetchSections();
        } catch (err) {
            if (err.response?.status === 500) {
                alert('Нельзя удалить секцию, у которой есть вложенные секции или статьи');
            } else {
                alert('Не удалось удалить секцию');
            }
            console.error(err);
            throw err; // пробрасываем для обработки в компоненте
        }
    };

    const navigate = useNavigate();

    const handleCreateArticle = (sectionId) => {
        navigate(`/articles/new?sectionId=${sectionId}`);
    };

    const handleModalSave = () => {
        setModalOpen(false);
        fetchSections(); // обновляем дерево
    };

    if (loading) return <div className="p-10 text-center">Загрузка...</div>;
    if (error) return <div className="p-10 text-red-600">{error}</div>;

    return (
        <div className="container px-8 py-10 max-w-4xl mx-auto">
            {/* Заголовок */}
            <div className="flex justify-between items-center mb-8 border-b-2 border-black pb-4">
                <h1 className="text-2xl font-bold">Секции</h1>
                <div className="flex gap-4">
                    {isAdmin && (
                        <button
                            onClick={handleCreateRoot}
                            className="border-2 border-black px-4 py-1 hover:bg-black hover:text-white transition text-sm"
                        >
                            + Корневая секция
                        </button>
                    )}
                </div>
            </div>

            {/* Дерево секций */}
            {sections.length === 0 ? (
                <div className="text-center py-20 border-2 border-black">
                    <p className="text-gray-500">Секции не найдены</p>
                    {isAdmin && (
                        <button
                            onClick={handleCreateRoot}
                            className="mt-4 border-2 border-black px-4 py-2 hover:bg-black hover:text-white transition"
                        >
                            Создать первую секцию
                        </button>
                    )}
                </div>
            ) : (
                <div className="space-y-2">
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
                        />
                    ))}
                </div>
            )}

            {/* Модальное окно создания/редактирования */}
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