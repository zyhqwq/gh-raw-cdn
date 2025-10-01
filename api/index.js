export default async function handler(req, res) {
    const { path } = req.query;
    if (!path) {
        return res.status(400).send("缺少必要的参数path，这是文件在仓库中的相对路径");
    }
    try {
        // 固定仓库信息
        const repo = "zyhqwq/cf-gh-images";
        const branch = "main"; 
        const baseDir = "images"; 
        // 拼接成raw.githubusercontent.com格式的链接
        const rawUrl = `https://raw.githubusercontent.com/${repo}/${branch}/${baseDir}/${path}`;
        const response = await fetch(rawUrl);
        if (!response.ok) {
            return res.status(response.status).send(`获取文件失败，请求的链接是：${rawUrl}`);
        }
        // 复制原始响应的头部信息
        response.headers.forEach((value, key) => {
            res.setHeader(key, value);
        });
        // 设置缓存控制，这里设置1小时的缓存，可根据需求调整
        res.setHeader("Cache-Control", "public, max-age=3600");
        const data = await response.arrayBuffer();
        return res.status(200).send(Buffer.from(data));
    } catch (error) {
        return res.status(500).send(`服务内部错误：${error.message}`);
    }
}