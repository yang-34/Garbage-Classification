# 导入Flask及相关模块
from flask import Flask, jsonify, request, render_template
# 导入处理库
import http.client
import urllib.parse
import json
import sys
import os
import time
import difflib  # 用于模糊匹配
import tomli    # TOML解析库

# 确保数据目录存在
if not os.path.exists('data'):
    os.makedirs('data')

# 加载配置文件
def load_config():
    try:
        with open("config.toml", "rb") as f:
            return tomli.load(f)
    except Exception as e:
        print(f"加载配置文件失败: {e}")
        # 返回默认配置
        return {
            "api": {"key": "55d27cbb9294ba22e57125f52960b458"},
            "cache": {"enabled": True, "expire_days": 7, "file": "data/search_cache.json"},
            "search": {"similarity_threshold": 0.6, "max_results": 5},
            "server": {"port": 8080, "debug": True}
        }

# 加载垃圾分类数据库
def load_garbage_db():
    try:
        with open("data/garbage_db.json", "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        print(f"加载垃圾分类数据库失败: {e}")
        return {}

# 全局配置
CONFIG = load_config()
# 全局垃圾分类数据库
GARBAGE_DB = load_garbage_db()

# 初始化Flask应用
app = Flask(__name__)

# 缓存文件路径
CACHE_FILE = CONFIG["cache"]["file"]

# 加载本地缓存
def load_cache():
    if os.path.exists(CACHE_FILE):
        try:
            with open(CACHE_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            print(f"加载缓存文件失败: {e}")
            return {}
    return {}

# 保存缓存到本地
def save_cache(cache):
    try:
        # 确保缓存目录存在
        cache_dir = os.path.dirname(CACHE_FILE)
        if not os.path.exists(cache_dir):
            os.makedirs(cache_dir)
            
        with open(CACHE_FILE, 'w', encoding='utf-8') as f:
            json.dump(cache, f, ensure_ascii=False, indent=2)
        return True
    except Exception as e:
        print(f"保存缓存文件失败: {e}")
        return False

# 根路由，返回前端页面
@app.route('/')
def index():
    return render_template('index.html')

# 环保知识页面
@app.route('/knowledge')
def knowledge():
    return render_template('knowledge.html')

# 垃圾处理流程页面
@app.route('/process')
def process():
    return render_template('process.html')

# 环保测验页面
@app.route('/quiz')
def quiz():
    return render_template('quiz.html')

# 减废技巧页面
@app.route('/tips')
def tips():
    return render_template('tips.html')

# 使用相似度进行模糊搜索
def fuzzy_search(item, threshold=None):
    if threshold is None:
        threshold = CONFIG["search"]["similarity_threshold"]
    
    print(f"执行模糊搜索: {item}, 阈值: {threshold}")
    
    # 加载缓存
    cache = load_cache()
    best_matches = []
    
    # 从本地数据库和缓存中查找相似项
    all_items = []
    
    # 从本地数据库收集所有物品
    for category, items in GARBAGE_DB.items():
        for db_item in items:
            all_items.append({
                'name': db_item,
                'category': category,
                'source': 'local'
            })
    
    # 从缓存中收集项目
    for cached_item, data in cache.items():
        # 避免重复
        if not any(item['name'] == cached_item for item in all_items):
            category = data.get('category', "未知分类")
            all_items.append({
                'name': cached_item,
                'category': category,
                'source': 'cache' 
            })
    
    # 计算相似度并排序
    matches = []
    for candidate in all_items:
        similarity = difflib.SequenceMatcher(None, item, candidate['name']).ratio()
        if similarity >= threshold:
            matches.append({
                'name': candidate['name'],
                'category': candidate['category'],
                'similarity': similarity,
                'source': candidate['source']
            })
    
    # 按相似度排序
    matches.sort(key=lambda x: x['similarity'], reverse=True)
    
    # 取前N个结果
    max_results = CONFIG["search"]["max_results"]
    best_matches = matches[:max_results]
    print(f"模糊搜索结果: {best_matches}")
    
    return best_matches

# 调用天行API进行垃圾分类查询
def search_online(item):
    # 如果缓存已启用，检查缓存
    if CONFIG["cache"]["enabled"]:
        # 首先检查缓存
        cache = load_cache()
        if item in cache:
            print(f"从缓存中获取 '{item}' 的结果")
            cached_data = cache[item]
            
            # 检查缓存是否过期
            if 'timestamp' in cached_data:
                cache_time = cached_data['timestamp']
                current_time = time.time()
                # 缓存是否超过设定天数
                if current_time - cache_time < CONFIG["cache"]["expire_days"] * 24 * 3600:
                    print(f"使用缓存的结果: {cached_data}")
                    return cached_data
                else:
                    print(f"缓存已过期，重新查询")
    
    # 获取API密钥
    API_KEY = CONFIG["api"]["key"]
    
    try:
        print(f"正在使用天行API查询物品: {item}")
        
        # 构建请求参数
        params = urllib.parse.urlencode({
            'key': API_KEY,
            'word': item
        })
        
        print(f"请求参数: {params}")
        
        # 创建HTTP连接
        conn = http.client.HTTPSConnection('apis.tianapi.com')
        
        # 设置请求头
        headers = {'Content-type': 'application/x-www-form-urlencoded'}
        
        # 发送POST请求
        print("发送请求到天行API...")
        conn.request('POST', '/lajifenlei/index', params, headers)
        
        # 获取响应
        tianapi = conn.getresponse()
        print(f"API响应状态: {tianapi.status} {tianapi.reason}")
        
        # 读取响应内容
        result = tianapi.read()
        data_str = result.decode('utf-8')
        
        # 在控制台输出完整的API响应数据（调试用）
        print(f"API原始响应数据: {data_str}")
        
        # 解析JSON数据
        data = json.loads(data_str)
        
        # 检查API返回状态
        if data['code'] == 200 and 'result' in data and 'list' in data['result'] and len(data['result']['list']) > 0:
            # 获取第一个结果
            result = data['result']['list'][0]
            print(f"找到结果: {result['name']}, 类型: {result['type']}")
            
            # 垃圾类型映射（API返回的type: 0为可回收、1为有害、2为厨余(湿)、3为其他(干)）
            type_map = {
                0: "可回收物",
                1: "有害垃圾",
                2: "厨余垃圾",
                3: "其他垃圾"
            }
            
            category = type_map.get(result['type'], "未知分类")
            
            # 创建返回结果
            response_data = {
                'category': category,
                'tips': result['tip'],
                'explain': result['explain'],
                'contain': result['contain'],
                'found': True,
                'online': True,  # 标记为在线查询结果
                'timestamp': time.time()  # 添加时间戳
            }
            
            # 如果缓存已启用，保存到缓存
            if CONFIG["cache"]["enabled"]:
                cache = load_cache()
                cache[item] = response_data
                save_cache(cache)
                print(f"已将 '{item}' 的结果保存到缓存")
            
            return response_data
        else:
            # API调用失败或无结果
            error_msg = f"API调用失败: 错误码 {data.get('code')}, 错误信息: {data.get('msg')}"
            print(error_msg)
            
            # 处理常见错误码
            if data.get('code') == 230:
                return {
                    'category': "API密钥错误",
                    'tips': "请联系管理员更新API密钥",
                    'explain': "天行API密钥无效或已过期",
                    'contain': "",
                    'found': True,
                    'online': True,
                    'error': True
                }
            elif data.get('code') == 150:
                return {
                    'category': "API可用次数不足",
                    'tips': "请联系管理员更新API配额",
                    'explain': "天行API免费调用次数已用完",
                    'contain': "",
                    'found': True,
                    'online': True,
                    'error': True
                }
            
            # 其他错误情况，返回None
            return None
            
    except Exception as e:
        print(f"API调用异常: {e}")
        import traceback
        traceback.print_exc(file=sys.stdout)  # 打印堆栈跟踪到标准输出
        return None
    finally:
        # 确保关闭连接
        if 'conn' in locals():
            conn.close()

# 分类接口，处理POST请求
@app.route('/classify', methods=['POST'])
def classify():
    try:
        # 从JSON数据中获取物品名称
        request_data = request.get_json()
        if not request_data:
            print("请求数据为空")
            return jsonify({'found': False, 'error': '请求数据为空'})
            
        item = request_data.get('item', '').strip()
        print(f"收到分类请求: {item}")
        
        if not item:
            print("请求项目名称为空")
            return jsonify({'found': False, 'error': '请输入要分类的物品名称'})
        
        # 先在本地数据库查找
        for category, items in GARBAGE_DB.items():
            if item in items:
                print(f"本地数据库找到 '{item}': {category}")
                # 找到分类时返回JSON结果
                return jsonify({
                    'category': category,      # 分类名称
                    'tips': get_tips(category),# 处理建议
                    'found': True,             # 查询成功标志
                    'online': False            # 标记为本地查询结果
                })
        
        print(f"本地数据库未找到 '{item}'，尝试联网查询")
        # 本地未找到，尝试联网查询
        online_result = search_online(item)
        
        # 打印在线查询结果以调试
        print(f"在线查询结果: {online_result}")
        
        if online_result:
            print(f"在线查询成功: {online_result}")
            return jsonify(online_result)
        else:
            print(f"在线查询也未找到'{item}'，尝试模糊搜索")
            # 执行模糊搜索
            fuzzy_results = fuzzy_search(item)
            
            if fuzzy_results:
                print(f"模糊搜索找到结果: {fuzzy_results}")
                return jsonify({
                    'found': True,
                    'fuzzy': True,
                    'results': fuzzy_results
                })
            else:
                # 如果online_result为None，说明API查询失败或无结果
                return jsonify({'found': False, 'error': '没有找到相关信息'})
        
    except Exception as e:
        print(f"处理分类请求时发生异常: {e}")
        import traceback
        traceback.print_exc(file=sys.stdout)
        return jsonify({'found': False, 'error': f'服务器内部错误: {str(e)}'})

# 获取分类对应的处理建议
def get_tips(category):
    # 建议字典（可扩展）
    tips = {
        "可回收物": "请保持清洁干燥，避免污染",
        "有害垃圾": "轻放轻投，密封处理",
        "厨余垃圾": "滤干水分，去除包装",
        "其他垃圾": "尽量沥干水分后投放"
    }
    return tips.get(category, "")

# 获取缓存信息接口
@app.route('/cache-info', methods=['GET'])
def cache_info():
    cache = load_cache()
    return jsonify({
        'cache_size': len(cache),
        'items': list(cache.keys()),
        'config': {
            'enabled': CONFIG["cache"]["enabled"],
            'expire_days': CONFIG["cache"]["expire_days"],
            'file': CONFIG["cache"]["file"]
        }
    })

# 清除缓存接口
@app.route('/clear-cache', methods=['POST'])
def clear_cache():
    if os.path.exists(CACHE_FILE):
        try:
            os.remove(CACHE_FILE)
            return jsonify({'success': True, 'message': '缓存已清除'})
        except Exception as e:
            return jsonify({'success': False, 'message': f'清除缓存失败: {str(e)}'})
    return jsonify({'success': True, 'message': '缓存文件不存在'})

# 添加简单的测试路由，直接测试API连接
@app.route('/test_api')
def test_api():
    try:
        # 测试词：眼镜（与官方示例一致）
        result = search_online("眼镜")
        if result:
            return jsonify({
                'success': True,
                'message': 'API连接成功',
                'result': result
            })
        else:
            return jsonify({
                'success': False,
                'message': 'API连接失败，请查看服务器日志'
            })
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'API测试异常: {str(e)}'
        })

# 主程序入口
if __name__ == '__main__':
    import webbrowser
    import threading
    import warnings
    import logging
    
    # 忽略警告信息
    warnings.filterwarnings('ignore')
    
    # 设置日志级别为ERROR，减少输出
    log = logging.getLogger('werkzeug')
    log.setLevel(logging.ERROR)
    
    # 自动打开浏览器函数
    def open_browser():
        port = CONFIG["server"]["port"]
        webbrowser.open(f'http://localhost:{port}/')
        
    # 创建定时器（1秒后打开浏览器）
    threading.Timer(1.0, open_browser).start()
    
    # 启动Flask开发服务器
    app.run(
        debug=CONFIG["server"]["debug"], 
        port=CONFIG["server"]["port"], 
        use_reloader=False,
        # 指定只在本地访问
        host='127.0.0.1'
    )