const { Octokit } = require('@octokit/rest');
const { Buffer } = require('buffer');

export default async function handler(req, res) {
    const { file, filename } = req.body;

    if (!file || !filename) {
        return res.status(400).json({ error: "Файл и имя файла обязательны" });
    }

    const octokit = new Octokit({
        auth: process.env.GITHUB_TOKEN,
    });

    try {
        console.log("Попытка загрузить файл:", filename);

        // Получаем текущее содержимое файла (если он уже существует)
        const repoData = await octokit.repos.getContent({
            owner: process.env.GITHUB_REPO_OWNER,
            repo: process.env.GITHUB_REPO_NAME,
            path: `products/${filename}`,
            ref: 'main'
        }).catch(() => ({ data: null }));

        // Преобразуем DataURL в Base64
        const base64Content = Buffer.from(file.split(',')[1], 'base64').toString('base64');

        console.log("Загружаем файл на GitHub...");

        // Загружаем файл в GitHub
        await octokit.repos.createOrUpdateFile({
            owner: process.env.GITHUB_REPO_OWNER,
            repo: process.env.GITHUB_REPO_NAME,
            path: `products/${filename}`,
            message: 'Добавлено через админку',
            content: base64Content,
            sha: repoData?.data?.sha, // Если файл есть — обновляем его
            branch: 'main'
        });

        console.log("Файл успешно загружен на GitHub");

        // Формируем URL через Vercel CDN
        const imageUrl = `https://${process.env.GITHUB_REPO_NAME}-${process.env.GITHUB_REPO_OWNER}.vercel.app/products/${filename}`;

        console.log("Сформирован URL:", imageUrl);

        res.status(200).json({ url: imageUrl });
    } catch (error) {
        console.error("Ошибка при загрузке:", error.message);
        res.status(500).json({ error: "Не удалось загрузить изображение" });
    }
}