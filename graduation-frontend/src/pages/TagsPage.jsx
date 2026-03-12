import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getApi } from "../api/api";
import { getKeycloak } from "../auth/keycloak";

export default function TagsPage() {
    const [tags, setTags] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newTagName, setNewTagName] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    const keycloak = getKeycloak();
    const isAdmin = keycloak?.authenticated &&
        keycloak.hasRealmRole?.('graduation.admin');
    const isAuthenticated = keycloak?.authenticated;

    useEffect(() => {
        fetchTags();
    }, []);

    const fetchTags = async () => {
        setLoading(true);
        try {
            const api = getApi();
            const res = await api.get('/knowledge/api/v1/tags');
            setTags(res.data || []);
        } catch (err) {
            setError("Не удалось загрузить теги");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTag = async (e) => {
        e.preventDefault();
        if (!newTagName.trim()) return;

        setIsCreating(true);
        try {
            const api = getApi();
            const res = await api.post('/knowledge/api/v1/tags', {
                name: newTagName.trim()
            });

            // Добавляем новый тег в список
            setTags(prev => [...prev, res.data].sort((a, b) =>
                a.name.localeCompare(b.name)
            ));
            setNewTagName('');
        } catch (err) {
            alert('Не удалось создать тег');
            console.error(err);
        } finally {
            setIsCreating(false);
        }
    };

    const handleDeleteTag = async (tagId, tagName) => {
        if (!window.confirm(`Вы уверены, что хотите удалить тег "${tagName}"?`)) {
            return;
        }

        setDeletingId(tagId);
        try {
            const api = getApi();
            await api.delete(`/knowledge/api/v1/tags/${tagId}`);

            // Удаляем тег из списка
            setTags(prev => prev.filter(tag => tag.id !== tagId));
        } catch (err) {
            alert('Не удалось удалить тег');
            console.error(err);
        } finally {
            setDeletingId(null);
        }
    };

    if (loading) return <div className="p-10 text-center">Загрузка...</div>;
    if (error) return <div className="p-10 text-red-600">{error}</div>;

    return (
        <div className="container px-8 py-10 max-w-4xl mx-auto">
            {/* Заголовок */}
            <div className="flex justify-between items-center mb-8 border-b-2 border-black pb-4">
                <h1 className="text-2xl font-bold">Теги</h1>
                <span className="text-sm text-gray-600">
                    Всего тегов: {tags.length}
                </span>
            </div>

            {/* Форма создания нового тега (только для админа) */}
            {isAdmin && (
                <div className="mb-8 border-2 border-black p-6">
                    <h2 className="text-lg font-medium mb-4">Создать новый тег</h2>
                    <form onSubmit={handleCreateTag} className="flex gap-4">
                        <input
                            type="text"
                            value={newTagName}
                            onChange={(e) => setNewTagName(e.target.value)}
                            placeholder="Введите название тега"
                            className="flex-1 border-2 border-black p-2 bg-white focus:outline-none focus:bg-gray-50"
                            disabled={isCreating}
                            autoFocus
                        />
                        <button
                            type="submit"
                            disabled={isCreating || !newTagName.trim()}
                            className="border-2 border-black px-6 py-2 bg-black text-white hover:bg-white hover:text-black transition disabled:opacity-50"
                        >
                            {isCreating ? 'Создание...' : 'Создать'}
                        </button>
                    </form>
                </div>
            )}

            {/* Сетка тегов */}
            {tags.length === 0 ? (
                <div className="text-center py-20 border-2 border-black">
                    <p className="text-gray-500">Теги не найдены</p>
                    {isAdmin && (
                        <p className="text-sm text-gray-400 mt-2">
                            Создайте первый тег с помощью формы выше
                        </p>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {tags.map(tag => (
                        <div
                            key={tag.id}
                            className="border-2 border-black bg-white hover:bg-gray-50 transition group"
                        >
                            {/* Ссылка на статьи с тегом */}
                            <Link
                                to={`/articles?tagId=${tag.id}`}
                                className="block p-4"
                            >
                                <div className="font-medium text-lg mb-1">
                                    #{tag.name}
                                </div>
                                <div className="text-xs text-gray-500">
                                    ID: {tag.id}
                                </div>
                            </Link>

                            {/* Кнопка удаления (только для админа) */}
                            {isAdmin && (
                                <div className="border-t-2 border-black p-2 flex justify-end">
                                    <button
                                        onClick={() => handleDeleteTag(tag.id, tag.name)}
                                        disabled={deletingId === tag.id}
                                        className="text-xs border border-black px-2 py-1 hover:bg-black hover:text-white transition disabled:opacity-30"
                                    >
                                        {deletingId === tag.id ? '...' : '× Удалить'}
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Информация о доступных действиях */}
            {isAuthenticated && !isAdmin && (
                <div className="mt-8 p-4 border-2 border-black bg-gray-50 text-sm text-gray-600">
                    <p>👤 Вы вошли как пользователь. Доступен просмотр тегов.</p>
                </div>
            )}

            {isAdmin && (
                <div className="mt-8 p-4 border-2 border-black bg-gray-50 text-sm text-gray-600">
                    <p>👑 Вы вошли как администратор. Доступно создание и удаление тегов.</p>
                </div>
            )}
        </div>
    );
}