// 知识页面交互逻辑
document.addEventListener('DOMContentLoaded', function() {
    // 处理侧边栏导航点击
    const sidebarLinks = document.querySelectorAll('.sidebar-menu a');
    
    sidebarLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // 阻止默认跳转行为
            e.preventDefault();
            
            // 移除所有active类
            sidebarLinks.forEach(item => item.classList.remove('active'));
            
            // 给当前点击的链接添加active类
            link.classList.add('active');
            
            // 获取目标部分的ID
            const targetId = link.getAttribute('href').substring(1);
            
            // 滚动到对应位置
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                // 平滑滚动
                targetSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
    
    // 处理图片加载失败情况
    const images = document.querySelectorAll('.knowledge-image img');
    images.forEach(img => {
        img.addEventListener('error', function() {
            // 图片加载失败时替换为占位图
            img.src = '/static/images/placeholder.jpg';
            img.alt = '图片暂未上传';
        });
    });
    
    // 添加滚动监听，实现动态高亮当前阅读的节点
    window.addEventListener('scroll', function() {
        // 获取所有知识部分
        const sections = document.querySelectorAll('.knowledge-section');
        
        // 当前滚动位置
        const scrollPosition = window.scrollY;
        
        // 遍历所有部分，找到当前可见的
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionBottom = sectionTop + section.offsetHeight;
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                // 当前部分的ID
                const id = section.getAttribute('id');
                
                // 更新侧边栏高亮
                sidebarLinks.forEach(link => {
                    if (link.getAttribute('href') === '#' + id) {
                        link.classList.add('active');
                    } else {
                        link.classList.remove('active');
                    }
                });
            }
        });
    });
}); 