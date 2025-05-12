// 处理流程页面交互逻辑
document.addEventListener('DOMContentLoaded', function() {
    // 处理标签切换
    const tabButtons = document.querySelectorAll('.tab-btn');
    const processPanels = document.querySelectorAll('.process-panel');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            // 移除所有按钮的活动状态
            tabButtons.forEach(btn => btn.classList.remove('active'));
            
            // 添加当前按钮的活动状态
            button.classList.add('active');
            
            // 获取目标面板ID
            const targetId = button.getAttribute('data-target');
            
            // 隐藏所有面板
            processPanels.forEach(panel => panel.classList.remove('active'));
            
            // 显示目标面板
            document.getElementById(targetId).classList.add('active');
            
            // 添加过渡动画
            setTimeout(() => {
                document.getElementById(targetId).style.opacity = 1;
            }, 10);
        });
    });
    
    // 动画效果：滚动时添加渐入效果
    const timelineItems = document.querySelectorAll('.timeline-item');
    
    // 检查元素是否在视口中
    function isElementInViewport(el) {
        const rect = el.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }
    
    // 添加动画类
    function handleScrollAnimation() {
        timelineItems.forEach(item => {
            if (isElementInViewport(item)) {
                item.classList.add('animate');
            }
        });
    }
    
    // 初始检查
    handleScrollAnimation();
    
    // 滚动时检查
    window.addEventListener('scroll', handleScrollAnimation);
    
    // 为时间轴项添加初始动画样式
    timelineItems.forEach((item, index) => {
        item.style.opacity = 0;
        item.style.transform = 'translateY(20px)';
        item.style.transition = `opacity 0.5s ease, transform 0.5s ease ${index * 0.1}s`;
    });
    
    // 页面加载后延迟显示时间轴项
    setTimeout(() => {
        timelineItems.forEach((item, index) => {
            setTimeout(() => {
                item.style.opacity = 1;
                item.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }, 300);
}); 