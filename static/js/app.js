function classifyItem() {
    const input = document.getElementById('itemInput');
    const resultDiv = document.getElementById('result');
    
    if (!input.value.trim()) {
        resultDiv.innerHTML = '<p class="error">请输入要分类的物品名称！</p>';
        return;
    }

    // 显示加载状态
    resultDiv.innerHTML = '<p>正在查询中，请稍候...</p>';

    // 记录查询开始时间，用于调试
    console.time('API查询耗时');
    
    fetch('/classify', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({item: input.value})
    })
    .then(res => {
        // 记录查询结束时间
        console.timeEnd('API查询耗时');
        
        // 检查响应状态
        if (!res.ok) {
            console.error('服务器响应错误:', res.status, res.statusText);
            throw new Error(`服务器响应错误: ${res.status} ${res.statusText}`);
        }
        return res.json();
    })
    .then(data => {
        // 调试: 打印完整的响应数据
        console.log('服务器返回数据:', data);
        
        if (data.found) {
            // 判断是否为模糊搜索结果
            if (data.fuzzy && data.results && data.results.length > 0) {
                // 显示模糊搜索结果
                let resultsHTML = `
                    <h3>未找到"${input.value}"的精确匹配，您可能要找：</h3>
                `;
                
                // 为每个模糊匹配结果创建点击选项
                data.results.forEach(result => {
                    const similarity = Math.round(result.similarity * 100);
                    resultsHTML += `
                        <div class="fuzzy-result" onclick="selectItem('${result.name}')">
                            <div class="result-name">${result.name}</div>
                            <div class="result-category ${getCategoryClass(result.category)}">${result.category}</div>
                            <div class="result-similarity">相似度: ${similarity}%</div>
                            <div class="result-source">来源: ${result.source === 'local' ? '本地数据库' : '历史查询'}</div>
                        </div>
                    `;
                });
                
                resultDiv.innerHTML = resultsHTML;
                return;
            }
            
            // 判断是本地结果还是在线查询结果
            if (data.online) {
                // 检查是否是API错误
                if (data.error) {
                    resultDiv.innerHTML = `
                        <h3>${input.value}</h3>
                        <div class="result-category error-category">${data.category}</div>
                        <p class="explain"><strong>错误说明：</strong>${data.explain || ''}</p>
                        <p class="tips"><strong>建议：</strong>${data.tips || ''}</p>
                        <div class="source">API状态：连接失败</div>
                    `;
                } else {
                    // 正常的在线API返回结果
                    resultDiv.innerHTML = `
                        <h3>${input.value}</h3>
                        <div class="result-category">${data.category}</div>
                        <p class="explain"><strong>分类说明：</strong>${data.explain || ''}</p>
                        <p class="contain"><strong>包含类型：</strong>${data.contain || ''}</p>
                        <p class="tips"><strong>处理建议：</strong>${data.tips || ''}</p>
                        <div class="source">来源：天行垃圾分类API${data.timestamp ? ' (已缓存)' : ''}</div>
                    `;
                }
            } else {
                // 本地数据库结果
                resultDiv.innerHTML = `
                    <h3>${input.value}</h3>
                    <div class="result-category">${data.category}</div>
                    <p class="tips"><strong>处理建议：</strong>${data.tips || ''}</p>
                    <div class="source">来源：本地数据库</div>
                `;
            }
        } else {
            let errorMsg = '';
            if (data.error) {
                errorMsg = `<p class="error">${data.error}</p>`;
            }
            
            resultDiv.innerHTML = `
                <p class="warning">未找到分类信息</p>
                <p>本地数据库和在线查询均无结果</p>
                ${errorMsg}
                <p>建议参考最新垃圾分类标准</p>
            `;
        }
    })
    .catch(err => {
        console.error('查询过程发生错误:', err);
        resultDiv.innerHTML = `<p class="error">分类服务暂不可用: ${err.message}</p>`;
    });
}

// 选择模糊搜索结果中的项目
function selectItem(name) {
    document.getElementById('itemInput').value = name;
    classifyItem();
}

// 获取分类对应的CSS类名
function getCategoryClass(category) {
    const classMap = {
        "可回收物": "recyclable",
        "有害垃圾": "hazardous",
        "厨余垃圾": "food",
        "其他垃圾": "other"
    };
    return classMap[category] || "unknown";
}

// 获取缓存信息
function getCacheInfo() {
    fetch('/cache-info')
    .then(res => res.json())
    .then(data => {
        const cacheInfoDiv = document.getElementById('cacheInfo');
        if (cacheInfoDiv) {
            cacheInfoDiv.innerHTML = `
                <p>缓存中的项目数: ${data.cache_size}</p>
                <button onclick="clearCache()" class="small-button">清除缓存</button>
            `;
            
            // 如果有缓存项，显示它们
            if (data.items && data.items.length > 0) {
                let itemsHTML = '<div class="cache-items"><strong>已缓存项目:</strong><ul>';
                data.items.forEach(item => {
                    itemsHTML += `<li>${item}</li>`;
                });
                itemsHTML += '</ul></div>';
                cacheInfoDiv.innerHTML += itemsHTML;
            }
        }
    })
    .catch(err => {
        console.error('获取缓存信息出错:', err);
    });
}

// 清除缓存
function clearCache() {
    fetch('/clear-cache', { method: 'POST' })
    .then(res => res.json())
    .then(data => {
        alert(data.message);
        getCacheInfo(); // 刷新缓存信息
    })
    .catch(err => {
        console.error('清除缓存出错:', err);
        alert('清除缓存失败: ' + err.message);
    });
}

// 输入框回车事件
document.getElementById('itemInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') classifyItem();
});

// 页面加载完成后，添加调试信息和获取缓存信息
window.addEventListener('load', function() {
    console.log('页面已加载，JavaScript已运行，查询功能已就绪');
    
    // 创建缓存信息显示区域
    const container = document.querySelector('.container');
    if (container) {
        const cacheInfoDiv = document.createElement('div');
        cacheInfoDiv.id = 'cacheInfo';
        cacheInfoDiv.className = 'cache-info';
        container.appendChild(cacheInfoDiv);
        
        // 获取缓存信息
        getCacheInfo();
    }
});