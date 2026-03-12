import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getApi } from "../api/api";

// Функция для преобразования дерева секций в плоский список с путями
const flattenSections = (sections, parentPath = '') => {
    let result = [];

    sections.forEach(section => {
        const currentPath = parentPath ? `${parentPath}/${section.name}` : section.name;
        result.push({
            id: section.id,
            name: section.name,
            path: currentPath,
            fullPath: currentPath
        });

        if (section.children && section.children.length > 0) {
            result = [...result, ...flattenSections(section.children, currentPath)];
        }
    });

    return result;
};

export default function EditArticlePage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [flatSections, setFlatSections] = useState([]);
    const [availableTags, setAvailableTags] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        mainPicture: '',
        source: '',
        body: '',
        sectionId: '',
        tags: []
    });

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const api = getApi();
                const [articleRes, sectionsRes, tagsRes] = await Promise.all([
                    api.get(`/knowledge/api/v1/articles/${id}`),
                    api.get('/knowledge/api/v1/sections/tree'),
                    api.get('/knowledge/api/v1/tags')
                ]);

                const article = articleRes.data;
                setFormData({
                    title: article.title || '',
                    description: article.description || '',
                    mainPicture: article.mainPicture || '',
                    source: article.source || '',
                    body: article.body || '',
                    sectionId: article.section?.id || '',
                    tags: article.tags?.map(t => t.id) || []
                });

                // Обрабатываем секции - получаем дерево и делаем плоский список
                const sectionsTree = sectionsRes.data || [];
                const flattened = flattenSections(sectionsTree);
                setFlatSections(flattened);

                // Теги приходят как прямой массив, не через .content
                setAvailableTags(tagsRes.data || []);
            } catch (err) {
                console.error(err);
                alert('Не удалось загрузить данные');
                navigate(`/articles/${id}`);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            const api = getApi();
            await api.put(`/knowledge/api/v1/articles/${id}`, formData);
            navigate(`/articles/${id}`);
        } catch (err) {
            alert('Не удалось сохранить изменения');
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleTagToggle = (tagId) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.includes(tagId)
                ? prev.tags.filter(id => id !== tagId)
                : [...prev.tags, tagId]
        }));
    };

    if (loading) {
        return <div className="p-10 text-center">Загрузка...</div>;
    }

    return (
        <div className="container mx-auto px-8 py-10 max-w-4xl">
            <h1 className="text-2xl font-bold mb-6">Редактирование статьи</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="border-2 border-black p-4">
                    <label className="block mb-2 font-medium">Заголовок *</label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                        className="w-full border-2 border-black p-2 bg-white focus:outline-none focus:bg-gray-50"
                    />
                </div>

                <div className="border-2 border-black p-4">
                    <label className="block mb-2 font-medium">Краткое описание</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows="3"
                        className="w-full border-2 border-black p-2 bg-white focus:outline-none focus:bg-gray-50"
                    />
                </div>

                <div className="border-2 border-black p-4">
                    <label className="block mb-2 font-medium">URL изображения</label>
                    <input
                        type="url"
                        name="mainPicture"
                        value={formData.mainPicture}
                        onChange={handleChange}
                        className="w-full border-2 border-black p-2 bg-white focus:outline-none focus:bg-gray-50"
                    />
                </div>

                <div className="border-2 border-black p-4">
                    <label className="block mb-2 font-medium">Источник</label>
                    <input
                        type="text"
                        name="source"
                        value={formData.source}
                        onChange={handleChange}
                        className="w-full border-2 border-black p-2 bg-white focus:outline-none focus:bg-gray-50"
                    />
                </div>

                <div className="border-2 border-black p-4">
                    <label className="block mb-2 font-medium">Секция *</label>
                    <select
                        name="sectionId"
                        value={formData.sectionId}
                        onChange={handleChange}
                        required
                        className="w-full border-2 border-black p-2 bg-white focus:outline-none focus:bg-gray-50"
                    >
                        <option value="">Выберите секцию</option>
                        {flatSections.map(section => (
                            <option key={section.id} value={section.id}>
                                {section.path}
                            </option>
                        ))}
                    </select>
                    {flatSections.length > 0 && (
                        <div className="mt-2 text-xs text-gray-500">
                            Доступные секции: {flatSections.map(s => s.path).join(', ')}
                        </div>
                    )}
                </div>

                <div className="border-2 border-black p-4">
                    <label className="block mb-2 font-medium">Теги</label>
                    <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-2 border border-gray-200">
                        {availableTags.map(tag => (
                            <button
                                key={tag.id}
                                type="button"
                                onClick={() => handleTagToggle(tag.id)}
                                className={`border-2 border-black px-3 py-1 transition ${
                                    formData.tags.includes(tag.id)
                                        ? 'bg-black text-white'
                                        : 'hover:bg-black hover:text-white'
                                }`}
                            >
                                #{tag.name}
                            </button>
                        ))}
                        {availableTags.length === 0 && (
                            <div className="text-gray-500">Нет доступных тегов</div>
                        )}
                    </div>
                </div>

                <div className="border-2 border-black p-4">
                    <label className="block mb-2 font-medium">Текст статьи (Markdown)</label>
                    <textarea
                        name="body"
                        value={formData.body}
                        onChange={handleChange}
                        rows="20"
                        className="w-full border-2 border-black p-2 bg-white font-mono text-sm focus:outline-none focus:bg-gray-50"
                    />
                </div>

                <div className="flex gap-4 pt-4">
                    <button
                        type="submit"
                        disabled={saving}
                        className="border-2 border-black px-6 py-3 bg-black text-white hover:bg-white hover:text-black transition disabled:opacity-50"
                    >
                        {saving ? 'Сохранение...' : 'Сохранить'}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate(`/articles/${id}`)}
                        className="border-2 border-black px-6 py-3 hover:bg-black hover:text-white transition"
                    >
                        Отмена
                    </button>
                </div>
            </form>
        </div>
    );
}