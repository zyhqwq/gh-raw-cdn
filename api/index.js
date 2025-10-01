export default async function handler(req, res) {
  // 从请求URL中获取参数：repo（仓库名）、branch（分支）、path（文件路径）
  const { repo, branch, path } = req.query;
  // 校验必要参数，缺失则返回错误
  if (!repo || !branch || !path) {
    return res.status(400).send("参数缺失，需包含：repo（仓库名，如xxx/xxx）、branch（分支，如main）、path（文件路径，如img/1.jpg）");
  }

  try {
    // 拼接raw.githubusercontent.com原始链接
    const rawUrl = `https://raw.githubusercontent.com/${repo}/${branch}/${path}`;
    // 请求GitHub原始文件
    const response = await fetch(rawUrl);
    // 若GitHub返回错误，直接将错误码返回给用户
    if (!response.ok) {
      return res.status(response.status).send(`GitHub文件请求失败：${rawUrl}`);
    }

    // 复制GitHub响应的头部信息（如文件类型、缓存时间等）
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });
    // 设置CDN缓存（1小时，可根据需求调整max-age值，单位秒）
    res.setHeader("Cache-Control", "public, max-age=3600");
    // 将GitHub返回的文件流转发给用户
    const data = await response.arrayBuffer();
    return res.status(200).send(Buffer.from(data));
  } catch (error) {
    // 捕获异常，返回错误信息
    return res.status(500).send(`服务错误：${error.message}`);
  }
}