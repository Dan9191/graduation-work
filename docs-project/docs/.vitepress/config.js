export default {
    title: 'Documentation',
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
                        { text: 'Введение', link: '/guide/' }
                    ]
                }
            ],

            '/api/': [
                {
                    text: 'API',
                    items: [
                        { text: 'Обзор', link: '/api/' },
                        { text: 'Endpoints', link: '/api/endpoints' },
                        { text: 'Auth', link: '/api/auth' }
                    ]
                }
            ]
        }
    }
}