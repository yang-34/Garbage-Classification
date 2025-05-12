// 环保测验页面交互逻辑
document.addEventListener('DOMContentLoaded', function() {
    // 测验数据
    const quizData = {
        beginner: {
            title: "初学者环保测验",
            questions: [
                {
                    question: "以下哪种垃圾属于可回收物？",
                    options: ["废弃的塑料瓶", "剩饭剩菜", "废电池", "卫生纸"],
                    answer: 0
                },
                {
                    question: "以下哪种垃圾属于有害垃圾？",
                    options: ["旧衣服", "过期药品", "果皮", "纸箱"],
                    answer: 1
                },
                {
                    question: "废旧灯管应该投放到哪个垃圾桶？",
                    options: ["可回收物", "其他垃圾", "有害垃圾", "厨余垃圾"],
                    answer: 2
                },
                {
                    question: "蓝色垃圾桶通常用于投放哪类垃圾？",
                    options: ["厨余垃圾", "有害垃圾", "可回收物", "其他垃圾"],
                    answer: 2
                },
                {
                    question: "以下哪种物品不属于厨余垃圾？",
                    options: ["果皮", "剩菜", "茶叶渣", "一次性筷子"],
                    answer: 3
                }
            ]
        },
        intermediate: {
            title: "进阶环保测验",
            questions: [
                {
                    question: "可回收纸类中，以下哪种不适合回收？",
                    options: ["报纸", "杂志", "纸板箱", "被油污染的纸巾"],
                    answer: 3
                },
                {
                    question: "废弃的充电宝属于什么垃圾？",
                    options: ["可回收物", "有害垃圾", "电子垃圾", "其他垃圾"],
                    answer: 1
                },
                {
                    question: "废旧塑料瓶在回收前应该如何处理？",
                    options: ["直接回收即可", "清洗并去除瓶盖", "压扁以节省空间", "以上都是"],
                    answer: 3
                },
                {
                    question: "以下哪种行为不是正确的垃圾分类做法？",
                    options: ["将易拉罐压扁后投入可回收物", "将废旧电池投入有害垃圾", "将厨余垃圾沥干水分后投放", "将碎玻璃与陶瓷混合投放"],
                    answer: 3
                },
                {
                    question: "关于厨余垃圾处理，以下说法正确的是？",
                    options: ["可以直接填埋", "可以通过堆肥变为有机肥料", "不会对环境造成影响", "无需分类处理"],
                    answer: 1
                }
            ]
        },
        expert: {
            title: "环保专家测验",
            questions: [
                {
                    question: "关于塑料污染，以下说法不正确的是？",
                    options: ["塑料在自然环境中可能需要数百年才能降解", "微塑料已经被发现在海洋和人体内", "所有塑料制品都可以回收再利用", "塑料污染对海洋生物造成严重威胁"],
                    answer: 2
                },
                {
                    question: "以下哪项不是减少碳足迹的有效方法？",
                    options: ["使用公共交通替代私家车", "减少肉类消费", "使用节能电器", "增加包装材料使用以保护产品"],
                    answer: 3
                },
                {
                    question: "关于垃圾焚烧发电，以下说法正确的是？",
                    options: ["是完全清洁的垃圾处理方式", "可以减少垃圾填埋量并产生能源", "适用于所有类型的垃圾", "不会产生任何有害物质"],
                    answer: 1
                },
                {
                    question: "生活中产生的废弃食用油应该如何处理？",
                    options: ["倒入下水道", "混入其他垃圾", "收集后交给专门回收点", "作为肥料直接用于植物"],
                    answer: 2
                },
                {
                    question: "关于"零废弃"生活方式，以下理解错误的是？",
                    options: ["尽量减少一次性物品的使用", "选择可回收或可降解的产品", "所有垃圾必须100%回收才算达标", "重视产品的全生命周期"],
                    answer: 2
                }
            ]
        }
    };
    
    // 获取DOM元素
    const levelCards = document.querySelectorAll('.level-card');
    const quizContainer = document.getElementById('quiz-container');
    const resultContainer = document.getElementById('result-container');
    const quizTitle = document.getElementById('quiz-title');
    const questionText = document.getElementById('question-text');
    const optionsContainer = document.getElementById('options-container');
    const progressBar = document.getElementById('progress-bar');
    const questionCounter = document.getElementById('question-counter');
    const nextBtn = document.getElementById('next-btn');
    const submitBtn = document.getElementById('submit-btn');
    const resultScore = document.getElementById('result-score');
    const totalQuestions = document.getElementById('total-questions');
    const resultMessage = document.getElementById('result-message');
    const badgeTitle = document.getElementById('badge-title');
    const badgeImg = document.getElementById('badge-img');
    const reviewBtn = document.getElementById('review-btn');
    const retryBtn = document.getElementById('retry-btn');
    const backBtn = document.getElementById('back-btn');
    
    // 测验状态
    let currentQuiz = null;
    let currentQuestions = [];
    let currentQuestionIndex = 0;
    let score = 0;
    let userAnswers = [];
    
    // 开始测验按钮点击事件
    levelCards.forEach(card => {
        const startBtn = card.querySelector('.start-quiz-btn');
        startBtn.addEventListener('click', function() {
            const level = card.getAttribute('data-level');
            startQuiz(level);
        });
    });
    
    // 开始测验
    function startQuiz(level) {
        currentQuiz = level;
        currentQuestions = quizData[level].questions;
        currentQuestionIndex = 0;
        score = 0;
        userAnswers = Array(currentQuestions.length).fill(-1);
        
        // 显示测验容器，隐藏结果容器
        quizContainer.style.display = 'block';
        resultContainer.style.display = 'none';
        
        // 设置标题
        quizTitle.textContent = quizData[level].title;
        
        // 加载第一个问题
        loadQuestion();
        
        // 滚动到测验区域
        quizContainer.scrollIntoView({ behavior: 'smooth' });
    }
    
    // 加载问题
    function loadQuestion() {
        const question = currentQuestions[currentQuestionIndex];
        questionText.textContent = question.question;
        
        // 清空选项容器
        optionsContainer.innerHTML = '';
        
        // 添加选项
        question.options.forEach((option, index) => {
            const optionElement = document.createElement('div');
            optionElement.classList.add('option-item');
            optionElement.textContent = option;
            
            // 如果已经选择过该选项，添加选中样式
            if (userAnswers[currentQuestionIndex] === index) {
                optionElement.classList.add('selected');
            }
            
            optionElement.addEventListener('click', function() {
                selectOption(index);
            });
            
            optionsContainer.appendChild(optionElement);
        });
        
        // 更新进度
        updateProgress();
        
        // 更新按钮状态
        updateButtons();
    }
    
    // 选择选项
    function selectOption(index) {
        userAnswers[currentQuestionIndex] = index;
        
        // 更新选中状态样式
        const options = optionsContainer.querySelectorAll('.option-item');
        options.forEach((option, i) => {
            if (i === index) {
                option.classList.add('selected');
            } else {
                option.classList.remove('selected');
            }
        });
        
        // 更新按钮状态
        updateButtons();
    }
    
    // 更新进度条和计数器
    function updateProgress() {
        const progress = ((currentQuestionIndex + 1) / currentQuestions.length) * 100;
        progressBar.style.width = `${progress}%`;
        questionCounter.textContent = `问题 ${currentQuestionIndex + 1}/${currentQuestions.length}`;
    }
    
    // 更新按钮状态
    function updateButtons() {
        if (currentQuestionIndex === currentQuestions.length - 1) {
            nextBtn.style.display = 'none';
            submitBtn.style.display = 'block';
        } else {
            nextBtn.style.display = 'block';
            submitBtn.style.display = 'none';
        }
    }
    
    // 下一题按钮事件
    nextBtn.addEventListener('click', function() {
        if (userAnswers[currentQuestionIndex] === -1) {
            alert('请选择一个选项');
            return;
        }
        
        currentQuestionIndex++;
        loadQuestion();
    });
    
    // 提交答案按钮事件
    submitBtn.addEventListener('click', function() {
        if (userAnswers[currentQuestionIndex] === -1) {
            alert('请选择一个选项');
            return;
        }
        
        // 计算得分
        calculateScore();
        
        // 显示结果
        showResult();
    });
    
    // 计算得分
    function calculateScore() {
        score = 0;
        userAnswers.forEach((answer, index) => {
            if (answer === currentQuestions[index].answer) {
                score++;
            }
        });
    }
    
    // 显示结果
    function showResult() {
        quizContainer.style.display = 'none';
        resultContainer.style.display = 'block';
        
        resultScore.textContent = score;
        totalQuestions.textContent = currentQuestions.length;
        
        // 设置徽章和消息
        setBadgeAndMessage();
        
        // 滚动到结果区域
        resultContainer.scrollIntoView({ behavior: 'smooth' });
    }
    
    // 设置徽章和消息
    function setBadgeAndMessage() {
        const percentage = (score / currentQuestions.length) * 100;
        
        let badge = '';
        let message = '';
        
        if (currentQuiz === 'beginner') {
            if (percentage === 100) {
                badge = '回收达人';
                message = '太棒了！你对基础垃圾分类知识已经掌握得非常好了，继续保持！';
            } else if (percentage >= 60) {
                badge = '分类新手';
                message = '做得不错！你已经具备了基本的垃圾分类知识，但还有提升空间。';
            } else {
                badge = '环保学徒';
                message = '垃圾分类的旅程才刚刚开始，不要气馁，继续学习吧！';
            }
        } else if (currentQuiz === 'intermediate') {
            if (percentage === 100) {
                badge = '生态守护者';
                message = '了不起！你对进阶环保知识已经驾轻就熟，你是垃圾分类的践行者！';
            } else if (percentage >= 60) {
                badge = '环保卫士';
                message = '很好！你对环保知识有一定的理解，再接再厉！';
            } else {
                badge = '绿色先锋';
                message = '环保之路任重道远，别灰心，继续努力！';
            }
        } else if (currentQuiz === 'expert') {
            if (percentage === 100) {
                badge = '地球卫士';
                message = '太完美了！你在环保领域的知识已经达到专家水平，你就是环保的典范！';
            } else if (percentage >= 60) {
                badge = '环保大使';
                message = '优秀！你对环保有着深入的了解，已经超过大多数人！';
            } else {
                badge = '环保先行者';
                message = '专家级别的知识需要更多学习，但你已经走在了正确的道路上！';
            }
        }
        
        badgeTitle.textContent = badge;
        resultMessage.textContent = message;
        badgeImg.src = `/static/images/badges/${badge}.png`;
        badgeImg.alt = badge;
    }
    
    // 重新测验按钮事件
    retryBtn.addEventListener('click', function() {
        startQuiz(currentQuiz);
    });
    
    // 返回选择按钮事件
    backBtn.addEventListener('click', function() {
        quizContainer.style.display = 'none';
        resultContainer.style.display = 'none';
        
        // 滚动到选择区域
        document.querySelector('.quiz-levels').scrollIntoView({ behavior: 'smooth' });
    });
    
    // 查看答案解析按钮事件（预留功能，实际查看答案页面需要另外开发）
    reviewBtn.addEventListener('click', function() {
        alert('答案解析功能正在开发中，敬请期待！');
    });
}); 