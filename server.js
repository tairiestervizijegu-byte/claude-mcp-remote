import express from 'express';
import cors from 'cors';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

const app = express();
const port = process.env.PORT || 3000;

// 启用CORS
app.use(cors());
app.use(express.json());

// 健康检查端点
app.get('/', (req, res) => {
  res.json({
    message: 'Claude MCP Remote Server is running! 🚀',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: ['fetch', 'memory', 'web-search']
  });
});

// MCP Fetch工具
app.post('/fetch', async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    const response = await fetch(url);
    const content = await response.text();
    
    res.json({
      url: url,
      status: response.status,
      content: content.substring(0, 10000), // 限制内容长度
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to fetch URL',
      message: error.message 
    });
  }
});

// MCP Memory存储
let memoryStore = new Map();

app.post('/memory/store', (req, res) => {
  try {
    const { key, value } = req.body;
    
    if (!key || !value) {
      return res.status(400).json({ error: 'Key and value are required' });
    }

    memoryStore.set(key, {
      value: value,
      timestamp: new Date().toISOString()
    });

    res.json({
      message: 'Memory stored successfully',
      key: key,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to store memory',
      message: error.message 
    });
  }
});

app.get('/memory/retrieve/:key', (req, res) => {
  try {
    const { key } = req.params;
    const memory = memoryStore.get(key);

    if (!memory) {
      return res.status(404).json({ error: 'Memory not found' });
    }

    res.json({
      key: key,
      value: memory.value,
      stored_at: memory.timestamp,
      retrieved_at: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to retrieve memory',
      message: error.message 
    });
  }
});

// 获取所有内存记录
app.get('/memory/list', (req, res) => {
  try {
    const memories = Array.from(memoryStore.entries()).map(([key, data]) => ({
      key: key,
      value: data.value,
      timestamp: data.timestamp
    }));

    res.json({
      total: memories.length,
      memories: memories
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to list memories',
      message: error.message 
    });
  }
});

// 启动服务器
app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Claude MCP Remote Server running on port ${port}`);
  console.log(`📍 Health check: http://localhost:${port}/`);
  console.log(`🔗 Fetch endpoint: http://localhost:${port}/fetch`);
  console.log(`💾 Memory endpoints: http://localhost:${port}/memory/*`);
});

export default app;
