export default {
    title: 'Документация',
    description: 'Документация выпускного проекта',

    themeConfig: {
        nav: [
            { text: 'О проекте', link: '/project/' },
            { text: 'Пользовательская история', link: '/user-story/' },
            { text: 'Архитектура', link: '/architecture/' },
            { text: 'Инфраструктура', link: '/infrastructure/' },
            { text: 'Сервисы', link: '/services/' },
        ],

        sidebar: {
            '/guide/': [
                {
                    text: 'Guide',
                    items: [
                        { text: 'Введение', link: '/guide/' }
                    ]
                }
            ],

            '/user-story/': [
                {
                    text: 'Пользовательская история',
                    items: [
                        { text: 'Введение', link: '/user-story/' },
                        { text: 'Теги', link: '/user-story/tags' },
                        { text: 'Секции', link: '/user-story/sections' },
                        { text: 'Статьи', link: '/user-story/articles' },
                        { text: 'Векторный поиск', link: '/user-story/vector' },
                    ]
                }
            ],

            '/architecture/': [
                {
                    text: 'Архитектура приложения',
                    items: [
                        { text: 'Подход к работе с ИИ моделями', link: '/architecture/models' },
                        { text: 'Обзор системы', link: '/architecture/system' }
                    ]
                }
            ],

            '/infrastructure/': [
                {
                    text: 'Инфраструктура',
                    items: [
                        { text: 'Монорепозиторий проекта', link: '/infrastructure/github' },
                        { text: 'Инфраструктурный репозиторий', link: '/infrastructure/argo-cd' },
                        { text: 'Наблюдаемость', link: '/infrastructure/observability' }
                    ]
                }
            ],

            '/services/': [
                {
                    text: 'Сервисы',
                    items: [
                        { text: 'Frontend', link: '/services/frontend' },
                        { text: 'Article service', link: '/services/article' },
                        { text: 'RAG service', link: '/services/rag' },
                        { text: 'Gateway', link: '/services/Gateway' }
                    ]
                }
            ]
        }
    }
}