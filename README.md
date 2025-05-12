# 垃圾分类查询系统

一个基于Flask的垃圾分类查询系统，支持本地数据库查询、在线API查询、模糊搜索和结果缓存功能。

## 功能特点

- 本地垃圾分类数据库查询
- 天行API在线垃圾分类查询
- 模糊搜索功能（当没有精确匹配时）
- 本地缓存系统（减少API调用次数）
- 响应式界面设计，支持移动设备

## 项目结构

```
├── app.py              # Flask应用主程序
├── garbage_classification.py  # 桌面GUI应用
├── config.toml         # 配置文件
├── requirements.txt    # 依赖包列表
├── run.bat             # Windows启动脚本
├── data/               # 数据目录
│   ├── garbage_db.json # 垃圾分类数据库
│   └── search_cache.json # 搜索缓存文件
├── static/             # 静态资源
│   ├── css/            # CSS样式
│   └── js/             # JavaScript脚本
└── templates/          # HTML模板
    └── index.html      # 主页面模板
```

## 运行方法

### Windows

1. 双击运行 `run.bat` 脚本
2. 等待脚本安装依赖并启动应用
3. 浏览器将自动打开应用页面

### 手动运行

1. 确保已安装Python 3.7+
2. 创建并激活虚拟环境（可选）
   ```
   python -m venv venv
   venv\Scripts\activate  # Windows
   source venv/bin/activate  # Linux/Mac
   ```
3. 安装依赖
   ```
   pip install -r requirements.txt
   ```
4. 运行应用
   ```
   python app.py
   ```

## 配置说明

编辑 `config.toml` 文件可以修改以下配置：

- API密钥
- 缓存设置
- 模糊搜索参数
- 服务器端口

## API密钥

本项目使用天行数据的垃圾分类API，默认提供的API密钥可能已过期或超出使用限额。
如需长期使用，请前往[天行数据](https://www.tianapi.com/)申请API密钥，
并在 `config.toml` 文件中更新。 