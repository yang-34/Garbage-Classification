// 减废技巧页面交互逻辑
document.addEventListener('DOMContentLoaded', function() {
    // 处理筛选按钮点击
    const filterButtons = document.querySelectorAll('.filter-btn');
    const tipCards = document.querySelectorAll('.tip-card');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // 移除所有按钮的活动状态
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // 添加当前按钮的活动状态
            button.classList.add('active');
            
            // 获取目标类别
            const category = button.getAttribute('data-category');
            
            // 筛选卡片
            filterTips(category);
        });
    });
    
    // 筛选提示卡片
    function filterTips(category) {
        tipCards.forEach(card => {
            if (category === 'all' || card.getAttribute('data-category') === category) {
                card.style.display = 'block';
                
                // 添加动画效果
                setTimeout(() => {
                    card.style.opacity = 1;
                    card.style.transform = 'translateY(0)';
                }, 10);
            } else {
                card.style.opacity = 0;
                card.style.transform = 'translateY(20px)';
                
                // 等待动画完成后隐藏元素
                setTimeout(() => {
                    card.style.display = 'none';
                }, 300);
            }
        });
    }
    
    // 设置初始动画效果
    tipCards.forEach((card, index) => {
        card.style.opacity = 0;
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        
        // 页面加载后逐一显示卡片
        setTimeout(() => {
            card.style.opacity = 1;
            card.style.transform = 'translateY(0)';
        }, 100 + index * 50);
    });
    
    // 处理评论提交
    const submitCommentBtn = document.getElementById('submit-comment');
    const commenterNameInput = document.getElementById('commenter-name');
    const commentTextInput = document.getElementById('comment-text');
    const commentsContainer = document.getElementById('comments-container');
    
    submitCommentBtn.addEventListener('click', function() {
        const name = commenterNameInput.value.trim();
        const comment = commentTextInput.value.trim();
        
        if (!name) {
            alert('请输入您的昵称');
            return;
        }
        
        if (!comment) {
            alert('请输入您的分享内容');
            return;
        }
        
        // 添加评论
        addComment(name, comment);
        
        // 清空输入框
        commenterNameInput.value = '';
        commentTextInput.value = '';
    });
    
    // 添加评论
    function addComment(name, text) {
        // 创建评论元素
        const commentItem = document.createElement('div');
        commentItem.classList.add('comment-item');
        
        // 获取当前日期
        const now = new Date();
        const dateString = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;
        
        // 设置评论内容
        commentItem.innerHTML = `
            <div class="comment-header">
                <span class="commenter-name">${name}</span>
                <span class="comment-date">${dateString}</span>
            </div>
            <div class="comment-text">${text}</div>
        `;
        
        // 将评论添加到容器
        if (commentsContainer.innerHTML === '<p>用户分享加载中...</p>') {
            commentsContainer.innerHTML = '';
        }
        
        commentsContainer.prepend(commentItem);
        
        // 添加动画效果
        commentItem.style.opacity = 0;
        commentItem.style.transform = 'translateY(20px)';
        commentItem.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        
        setTimeout(() => {
            commentItem.style.opacity = 1;
            commentItem.style.transform = 'translateY(0)';
        }, 10);
        
        // 提示成功消息
        setTimeout(() => {
            alert('感谢您的分享！');
        }, 300);
    }
    
    // 初始化一些示例评论
    function initComments() {
        const sampleComments = [
            {
                name: '环保爱好者',
                text: '我尝试了厨余堆肥，效果很好！现在我家的植物都用自制肥料，既环保又节约。',
                date: '2023-05-15'
            },
            {
                name: '绿色生活家',
                text: '自从开始自带餐具和水杯，我每年至少减少了300个一次性餐具的使用。小小行动，大大改变！',
                date: '2023-05-10'
            },
            {
                name: '零浪费达人',
                text: '推荐一个减少包装废弃物的方法：选择散装商品，自带容器购买。我已经坚持半年了，垃圾减少了一半以上。',
                date: '2023-05-05'
            }
        ];
        
        // 清空加载提示
        commentsContainer.innerHTML = '';
        
        // 添加示例评论
        sampleComments.forEach(comment => {
            const commentItem = document.createElement('div');
            commentItem.classList.add('comment-item');
            
            commentItem.innerHTML = `
                <div class="comment-header">
                    <span class="commenter-name">${comment.name}</span>
                    <span class="comment-date">${comment.date}</span>
                </div>
                <div class="comment-text">${comment.text}</div>
            `;
            
            commentsContainer.appendChild(commentItem);
        });
    }
    
    // 加载示例评论
    setTimeout(initComments, 1000);
}); 