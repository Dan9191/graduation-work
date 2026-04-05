import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getApi } from "../api/api";

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

const FieldBlock = ({ label, required, children }) => (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <label className="block mb-2 text-xs font-semibold" style={{ fontFamily: "var(--mono)", color: "var(--muted)" }}>
            <span style={{ color: "var(--accent)" }}>&gt;</span> {label.toLowerCase().replace(/ /g, "_")}
            {required && <span className="ml-1" style={{ color: "#ef4444" }}>*</span>}
        </label>
        {children}
    </div>
);

const inputClass = "w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-white text-slate-900 focus:outline-none transition";

export default function CreateArticlePage() {
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const preselectedSectionId = queryParams.get('sectionId');

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
        sectionId: preselectedSectionId || '',
        tags: []
    });

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const api = getApi();
                const [sectionsRes, tagsRes] = await Promise.all([
                    api.get('/knowledge/api/v1/sections/tree'),
                    api.get('/knowledge/api/v1/tags')
                ]);

                setFlatSections(flattenSections(sectionsRes.data || []));
                setAvailableTags(tagsRes.data || []);
            } catch (err) {
                console.error(err);
                alert('Не удалось загрузить данные для создания статьи');
                navigate('/articles');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            const api = getApi();
            const response = await api.post('/knowledge/api/v1/articles', formData);
            navigate(`/articles/${response.data.id}`);
        } catch (err) {
            alert('Не удалось создать статью');
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
        return <div className="flex items-center justify-center py-24 text-slate-400 text-sm">Загрузка...</div>;
    }

    return (
        <div className="max-w-3xl mx-auto px-6 py-10">
            <div className="flex items-center gap-2 text-sm text-slate-400 mb-6">
                <button onClick={() => navigate('/articles')} className="hover:text-indigo-600 transition">Статьи</button>
                <span>/</span>
                <span className="text-slate-600">Новая статья</span>
            </div>

            <h1 className="text-2xl font-bold text-slate-900 mb-8">Создание статьи</h1>

            <form onSubmit={handleSubmit} className="space-y-4">
                <FieldBlock label="Заголовок" required>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                        className={inputClass}
                        placeholder="Название статьи"
                    />
                </FieldBlock>

                <FieldBlock label="Краткое описание">
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows="3"
                        className={inputClass}
                        placeholder="Краткое описание статьи..."
                    />
                </FieldBlock>

                <FieldBlock label="URL изображения">
                    <input
                        type="url"
                        name="mainPicture"
                        value={formData.mainPicture}
                        onChange={handleChange}
                        className={inputClass}
                        placeholder="https://..."
                    />
                </FieldBlock>

                <FieldBlock label="Источник">
                    <input
                        type="text"
                        name="source"
                        value={formData.source}
                        onChange={handleChange}
                        className={inputClass}
                        placeholder="Ссылка или название источника"
                    />
                </FieldBlock>

                <FieldBlock label="Секция" required>
                    <select
                        name="sectionId"
                        value={formData.sectionId}
                        onChange={handleChange}
                        required
                        className={inputClass}
                    >
                        <option value="">Выберите секцию</option>
                        {flatSections.map(section => (
                            <option key={section.id} value={section.id}>
                                {section.path}
                            </option>
                        ))}
                    </select>
                </FieldBlock>

                <FieldBlock label="Теги">
                    <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
                        {availableTags.map(tag => (
                            <button
                                key={tag.id}
                                type="button"
                                onClick={() => handleTagToggle(tag.id)}
                                                    style={{
                                    fontFamily: "var(--mono)",
                                    fontSize: "0.75rem",
                                    padding: "4px 12px",
                                    borderRadius: "4px",
                                    border: formData.tags.includes(tag.id) ? "1px solid var(--accent)" : "1px solid var(--border)",
                                    background: formData.tags.includes(tag.id) ? "var(--accent)" : "white",
                                    color: formData.tags.includes(tag.id) ? "white" : "var(--muted)",
                                    cursor: "pointer",
                                    transition: "all 0.15s",
                                }}
                            >
                                #{tag.name}
                            </button>
                        ))}
                        {availableTags.length === 0 && (
                            <div className="text-slate-400 text-sm">Нет доступных тегов</div>
                        )}
                    </div>
                </FieldBlock>

                <FieldBlock label="Текст статьи (Markdown)">
                    <textarea
                        name="body"
                        value={formData.body}
                        onChange={handleChange}
                        rows="20"
                        className={`${inputClass} font-mono text-sm`}
                        placeholder="# Заголовок&#10;&#10;Текст статьи..."
                    />
                </FieldBlock>

                <div className="flex gap-3 pt-2">
                    <button
                        type="submit"
                        disabled={saving}
                        className="px-6 py-2.5 rounded-lg text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ fontFamily: "var(--mono)", background: "var(--accent)", color: "white", border: "none" }}
                    >
                        {saving ? '$ creating...' : '$ create article'}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/articles')}
                                    className="px-6 py-2.5 rounded-lg border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
                        style={{ fontFamily: "var(--mono)" }}
                    >
                        Отмена
                    </button>
                </div>
            </form>
        </div>
    );
}
