import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// 内存存储
const memoryStore = new Map();

// 健康检查
app.get('/', (req, res) => {
  res.json({
    status: 'healthy',
    message: 'Claude MCP Remote Server is running!',
    endpoints: ['/memory', '/fetch'],
    timestamp: new Date().toISOString()
  });
});

// 存储记忆
app.post('/memory', (req, res) => {
  const { key, value } = req.body;
  memoryStore.set(key, value);
  res.json({ success: true, key });
});

// 获取记忆
app.get('/memory/:key', (req, res) => {
  const value = memoryStore.get(req.params.key);
  res.json({ key: req.params.key, value });
});

// 网页抓取
app.post('/fetch', async (req, res) => {
  try {
    const { url } = req.body;
    const response = await fetch(url);
    const text = await response.text();
    res.json({ url, content: text.substring(0, 5000) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
