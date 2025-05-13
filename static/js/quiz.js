// 环保测验页面交互逻辑
document.addEventListener('DOMContentLoaded', function() {
    // 获取DOM元素
    const levelCards = document.querySelectorAll('.level-card');
    const quizContainer = document.getElementById('quiz-container');
    const resultContainer = document.getElementById('result-container');
    const reviewContainer = document.getElementById('review-container');
    const quizTitle = document.getElementById('quiz-title');
    const questionText = document.getElementById('question-text');
    const questionTypeBadge = document.getElementById('question-type-badge');
    const optionsContainer = document.getElementById('options-container');
    const progressBar = document.getElementById('progress-bar');
    const questionCounter = document.getElementById('question-counter');
    const nextBtn = document.getElementById('next-btn');
    const submitBtn = document.getElementById('submit-btn');
    const resultScore = document.getElementById('result-score');
    const totalQuestions = document.getElementById('total-questions');
    const resultMessage = document.getElementById('result-message');
    const correctCount = document.getElementById('correct-count');
    const wrongCount = document.getElementById('wrong-count');
    const completionTime = document.getElementById('completion-time');
    const badgeTitle = document.getElementById('badge-title');
    const badgeImg = document.getElementById('badge-img');
    const reviewBtn = document.getElementById('review-btn');
    const retryBtn = document.getElementById('retry-btn');
    const backBtn = document.getElementById('back-btn');
    const backToResultBtn = document.getElementById('back-to-result-btn');
    const questionsReview = document.getElementById('questions-review');
    
    // 测验状态
    let subjectData = null;
    let currentLevel = null;
    let currentQuestions = [];
    let currentQuestionIndex = 0;
    let score = 0;
    let userAnswers = [];
    let startTime = null;
    let endTime = null;
    let userData = null;
    let earnedBadge = null;
    
    // 加载用户数据
    loadUserData();
    
    // 加载题库数据
    loadSubjectData();
    
    // 开始测验按钮点击事件
    levelCards.forEach(card => {
        const startBtn = card.querySelector('.start-quiz-btn');
        startBtn.addEventListener('click', function() {
            const level = card.getAttribute('data-level');
            startQuiz(level);
        });
    });
    
    // 加载题库数据
    function loadSubjectData() {
        fetch('/api/subject-data')
            .then(response => response.json())
            .then(data => {
                console.log('题库数据加载成功', data);
                subjectData = data;
                
                // 更新UI，例如启用测验按钮
                levelCards.forEach(card => {
                    card.querySelector('.start-quiz-btn').disabled = false;
                });
            })
            .catch(error => {
                console.error('题库数据加载失败', error);
                alert('题库数据加载失败，请刷新页面重试。');
            });
    }
    
    // 加载用户数据
    function loadUserData() {
        fetch('/api/user-data')
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    userData = data.user_data;
                    console.log('用户数据加载成功', userData);
                } else {
                    console.error('用户数据加载失败', data.error);
                }
            })
            .catch(error => {
                console.error('用户数据请求失败', error);
            });
    }
    
    // 开始测验
    function startQuiz(level) {
        // 查找对应难度的题目
        const levelData = subjectData.find(data => data.level.trim() === level);
        
        if (!levelData || !levelData.questions || levelData.questions.length === 0) {
            alert('未找到该难度的题目，请选择其他难度。');
            return;
        }
        
        currentLevel = level;
        
        // 按题型筛选题目
        const singleChoiceQuestions = levelData.questions.filter(q => q.type === "单选");
        const multipleChoiceQuestions = levelData.questions.filter(q => q.type === "多选");
        const judgementQuestions = levelData.questions.filter(q => q.type === "判断");
        
        // 检查是否有足够的题目
        if (singleChoiceQuestions.length < 6 || multipleChoiceQuestions.length < 2 || judgementQuestions.length < 2) {
            alert('题库中没有足够的题目，请联系管理员补充题库。');
            return;
        }
        
        // 随机抽取题目
        const getRandomQuestions = (questions, count) => {
            const shuffled = [...questions].sort(() => 0.5 - Math.random());
            return shuffled.slice(0, count);
        };
        
        // 抽取6道单选题
        const selectedSingleChoice = getRandomQuestions(singleChoiceQuestions, 6);
        // 抽取2道多选题
        const selectedMultipleChoice = getRandomQuestions(multipleChoiceQuestions, 2);
        // 抽取2道判断题
        const selectedJudgement = getRandomQuestions(judgementQuestions, 2);
        
        // 合并并随机排序所有题目
        currentQuestions = [...selectedSingleChoice, ...selectedMultipleChoice, ...selectedJudgement]
            .sort(() => 0.5 - Math.random());
        
        currentQuestionIndex = 0;
        score = 0;
        userAnswers = Array(currentQuestions.length).fill(null);
        startTime = new Date();
        
        // 显示测验容器，隐藏结果容器
        quizContainer.style.display = 'block';
        resultContainer.style.display = 'none';
        reviewContainer.style.display = 'none';
        
        // 设置标题
        quizTitle.textContent = `${level}环保测验`;
        
        // 加载第一个问题
        loadQuestion();
        
        // 滚动到测验区域
        quizContainer.scrollIntoView({ behavior: 'smooth' });
    }
    
    // 加载问题
    function loadQuestion() {
        const question = currentQuestions[currentQuestionIndex];
        
        // 设置问题文本
        questionText.textContent = question.question;
        
        // 设置问题类型标签
        questionTypeBadge.textContent = question.type;
        questionTypeBadge.className = "question-type-badge";
        if (question.type === "多选") {
            questionTypeBadge.classList.add("multiple");
        } else if (question.type === "判断") {
            questionTypeBadge.classList.add("judge");
        }
        
        // 清空选项容器
        optionsContainer.innerHTML = '';
        
        // 根据题型生成不同的选项UI
        if (question.type === "判断") {
            // 判断题
            const judgeOptions = document.createElement('div');
            judgeOptions.className = 'judge-options';
            
            // 创建"正确"选项
            const trueOption = document.createElement('div');
            trueOption.className = 'judge-option';
            trueOption.textContent = '✓ 正确';
            trueOption.addEventListener('click', function() {
                selectOption(true);
            });
            
            // 创建"错误"选项
            const falseOption = document.createElement('div');
            falseOption.className = 'judge-option';
            falseOption.textContent = '✗ 错误';
            falseOption.addEventListener('click', function() {
                selectOption(false);
            });
            
            // 如果用户已经选择过答案，添加选中样式
            if (userAnswers[currentQuestionIndex] === true) {
                trueOption.classList.add('selected');
            } else if (userAnswers[currentQuestionIndex] === false) {
                falseOption.classList.add('selected');
            }
            
            judgeOptions.appendChild(trueOption);
            judgeOptions.appendChild(falseOption);
            optionsContainer.appendChild(judgeOptions);
        } else {
            // 单选题或多选题
            question.options.forEach((option, index) => {
                const optionElement = document.createElement('div');
                optionElement.className = 'option-item';
                
                if (question.type === "多选") {
                    optionElement.classList.add('multiple');
                }
                
                optionElement.textContent = option;
                
                // 如果已经选择过该选项，添加选中样式
                if (question.type === "多选") {
                    if (Array.isArray(userAnswers[currentQuestionIndex]) && 
                        userAnswers[currentQuestionIndex].includes(index)) {
                        optionElement.classList.add('selected');
                    }
                } else {
                    if (userAnswers[currentQuestionIndex] === index) {
                        optionElement.classList.add('selected');
                    }
                }
                
                optionElement.addEventListener('click', function() {
                    if (question.type === "多选") {
                        selectMultipleOption(index);
                    } else {
                        selectOption(index);
                    }
                });
                
                optionsContainer.appendChild(optionElement);
            });
        }
        
        // 更新进度
        updateProgress();
        
        // 更新按钮状态
        updateButtons();
    }
    
    // 选择单选/判断选项
    function selectOption(index) {
        userAnswers[currentQuestionIndex] = index;
        
        // 更新选中状态样式
        if (currentQuestions[currentQuestionIndex].type === "判断") {
            const judgeOptions = optionsContainer.querySelectorAll('.judge-option');
            judgeOptions.forEach((option, i) => {
                if ((i === 0 && index === true) || (i === 1 && index === false)) {
                    option.classList.add('selected');
                } else {
                    option.classList.remove('selected');
                }
            });
        } else {
            const options = optionsContainer.querySelectorAll('.option-item');
            options.forEach((option, i) => {
                if (i === index) {
                    option.classList.add('selected');
                } else {
                    option.classList.remove('selected');
                }
            });
        }
        
        // 更新按钮状态
        updateButtons();
    }
    
    // 选择多选选项
    function selectMultipleOption(index) {
        // 确保userAnswers[currentQuestionIndex]是数组
        if (!Array.isArray(userAnswers[currentQuestionIndex])) {
            userAnswers[currentQuestionIndex] = [];
        }
        
        // 切换选中状态
        const selectedIndex = userAnswers[currentQuestionIndex].indexOf(index);
        if (selectedIndex === -1) {
            userAnswers[currentQuestionIndex].push(index);
        } else {
            userAnswers[currentQuestionIndex].splice(selectedIndex, 1);
        }
        
        // 更新选中状态样式
        const options = optionsContainer.querySelectorAll('.option-item');
        options[index].classList.toggle('selected');
        
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
        const currentAnswer = userAnswers[currentQuestionIndex];
        const hasAnswer = Array.isArray(currentAnswer) ? currentAnswer.length > 0 : currentAnswer !== null;
        
        if (currentQuestionIndex === currentQuestions.length - 1) {
            nextBtn.style.display = 'none';
            submitBtn.style.display = 'block';
            submitBtn.disabled = !hasAnswer;
        } else {
            nextBtn.style.display = 'block';
            submitBtn.style.display = 'none';
            nextBtn.disabled = !hasAnswer;
        }
    }
    
    // 下一题按钮事件
    nextBtn.addEventListener('click', function() {
        const currentAnswer = userAnswers[currentQuestionIndex];
        const hasAnswer = Array.isArray(currentAnswer) ? currentAnswer.length > 0 : currentAnswer !== null;
        
        if (!hasAnswer) {
            alert('请选择一个答案');
            return;
        }
        
        currentQuestionIndex++;
        loadQuestion();
    });
    
    // 提交答案按钮事件
    submitBtn.addEventListener('click', function() {
        const currentAnswer = userAnswers[currentQuestionIndex];
        const hasAnswer = Array.isArray(currentAnswer) ? currentAnswer.length > 0 : currentAnswer !== null;
        
        if (!hasAnswer) {
            alert('请选择一个答案');
            return;
        }
        
        // 记录结束时间
        endTime = new Date();
        
        // 计算得分
        calculateScore();
        
        // 显示结果
        showResult();
    });
    
    // 计算得分
    function calculateScore() {
        score = 0;
        userAnswers.forEach((answer, index) => {
            const question = currentQuestions[index];
            
            if (question.type === "判断") {
                // 判断题判分逻辑
                if (answer === question.answer) {
                    score++;
                }
            } else if (question.type === "多选") {
                // 多选题判分逻辑
                if (Array.isArray(answer) && 
                    answer.length === question.answer.length && 
                    answer.every(a => {
                        // 将字母索引(A,B,C)转为数字索引(0,1,2)
                        const optionIndex = question.answer.map(opt => opt.charCodeAt(0) - 65);
                        return optionIndex.includes(a);
                    })) {
                    score++;
                }
            } else {
                // 单选题判分逻辑
                // 字母A的ASCII码为65，所以A对应索引0，B对应索引1，依此类推
                const correctIndex = question.answer.charCodeAt(0) - 65;
                if (answer === correctIndex) {
                    score++;
                }
            }
        });
    }
    
    // 显示结果
    function showResult() {
        quizContainer.style.display = 'none';
        resultContainer.style.display = 'block';
        reviewContainer.style.display = 'none';
        
        resultScore.textContent = score;
        totalQuestions.textContent = currentQuestions.length;
        
        // 统计数据
        correctCount.textContent = score;
        wrongCount.textContent = currentQuestions.length - score;
        
        // 计算完成时间
        const timeSpent = Math.floor((endTime - startTime) / 1000); // 秒
        let timeDisplay = '';
        
        if (timeSpent < 60) {
            timeDisplay = `${timeSpent}秒`;
        } else {
            const minutes = Math.floor(timeSpent / 60);
            const seconds = timeSpent % 60;
            timeDisplay = `${minutes}分${seconds}秒`;
        }
        completionTime.textContent = timeDisplay;
        
        // 设置徽章和消息
        earnedBadge = setBadgeAndMessage();
        
        // 保存结果到服务器
        saveQuizResult();
        
        // 滚动到结果区域
        resultContainer.scrollIntoView({ behavior: 'smooth' });
    }
    
    // 设置徽章和消息
    function setBadgeAndMessage() {
        const percentage = (score / currentQuestions.length) * 100;
        
        let badge = '';
        let message = '';
        
        if (currentLevel === "初学者") {
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
        } else if (currentLevel === "进阶者") {
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
        } else if (currentLevel === "环保专家") {
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
        
        // 设置徽章图片(暂时使用文本)
        badgeImg.src = "";
        badgeImg.alt = badge;
        const badgeEmoji = document.createElement('div');
        badgeEmoji.textContent = '🏆';
        badgeEmoji.style.fontSize = '60px';
        if (badgeImg.firstChild) {
            badgeImg.replaceChild(badgeEmoji, badgeImg.firstChild);
        } else {
            badgeImg.appendChild(badgeEmoji);
        }
        
        return badge;
    }
    
    // 保存测验结果
    function saveQuizResult() {
        const resultData = {
            level: currentLevel,
            score: score,
            total: currentQuestions.length,
            badge: earnedBadge,
            userAnswers: userAnswers,
            timeSpent: Math.floor((endTime - startTime) / 1000)
        };
        
        fetch('/api/save-quiz-result', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(resultData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log('测验结果保存成功', data);
                userData = data.user_data;
            } else {
                console.error('测验结果保存失败', data.error);
            }
        })
        .catch(error => {
            console.error('保存测验结果请求失败', error);
        });
    }
    
    // 重新测验按钮事件
    retryBtn.addEventListener('click', function() {
        startQuiz(currentLevel);
    });
    
    // 返回选择按钮事件
    backBtn.addEventListener('click', function() {
        quizContainer.style.display = 'none';
        resultContainer.style.display = 'none';
        reviewContainer.style.display = 'none';
        
        // 滚动到选择区域
        document.querySelector('.quiz-levels').scrollIntoView({ behavior: 'smooth' });
    });
    
    // 查看答案解析按钮事件
    reviewBtn.addEventListener('click', function() {
        showReview();
    });
    
    // 返回结果按钮事件
    backToResultBtn.addEventListener('click', function() {
        reviewContainer.style.display = 'none';
        resultContainer.style.display = 'block';
        resultContainer.scrollIntoView({ behavior: 'smooth' });
    });
    
    // 显示答案解析
    function showReview() {
        quizContainer.style.display = 'none';
        resultContainer.style.display = 'none';
        reviewContainer.style.display = 'block';
        
        // 清空解析容器
        questionsReview.innerHTML = '';
        
        // 添加每个问题的解析
        currentQuestions.forEach((question, index) => {
            const reviewItem = document.createElement('div');
            reviewItem.className = 'review-item';
            
            // 问题文本
            const questionElement = document.createElement('div');
            questionElement.className = 'review-question';
            questionElement.textContent = `${index + 1}. ${question.question}`;
            reviewItem.appendChild(questionElement);
            
            // 选项和用户答案
            const optionsElement = document.createElement('div');
            optionsElement.className = 'review-options';
            
            if (question.type === "判断") {
                // 判断题解析
                const trueOption = document.createElement('div');
                trueOption.className = 'review-option';
                trueOption.textContent = '✓ 正确';
                
                const falseOption = document.createElement('div');
                falseOption.className = 'review-option';
                falseOption.textContent = '✗ 错误';
                
                // 设置正确和用户选择的样式
                if (question.answer === true) {
                    trueOption.classList.add('correct');
                } else {
                    falseOption.classList.add('correct');
                }
                
                if (userAnswers[index] === true) {
                    trueOption.classList.add('user-selected');
                } else if (userAnswers[index] === false) {
                    falseOption.classList.add('user-selected');
                }
                
                optionsElement.appendChild(trueOption);
                optionsElement.appendChild(falseOption);
            } else {
                // 单选题和多选题解析
                question.options.forEach((option, optIndex) => {
                    const optionElement = document.createElement('div');
                    optionElement.className = 'review-option';
                    optionElement.textContent = option;
                    
                    if (question.type === "多选") {
                        // 多选题逻辑
                        const letterIndex = String.fromCharCode(65 + optIndex);
                        if (question.answer.includes(letterIndex)) {
                            optionElement.classList.add('correct');
                        }
                        
                        if (Array.isArray(userAnswers[index]) && userAnswers[index].includes(optIndex)) {
                            optionElement.classList.add('user-selected');
                        }
                    } else {
                        // 单选题逻辑
                        const correctIndex = question.answer.charCodeAt(0) - 65;
                        if (optIndex === correctIndex) {
                            optionElement.classList.add('correct');
                        }
                        
                        if (userAnswers[index] === optIndex) {
                            optionElement.classList.add('user-selected');
                        }
                    }
                    
                    optionsElement.appendChild(optionElement);
                });
            }
            reviewItem.appendChild(optionsElement);
            
            // 解析说明
            const explanationElement = document.createElement('div');
            explanationElement.className = 'review-explanation';
            explanationElement.textContent = question.explanation;
            reviewItem.appendChild(explanationElement);
            
            questionsReview.appendChild(reviewItem);
        });
        
        // 滚动到解析区域
        reviewContainer.scrollIntoView({ behavior: 'smooth' });
    }
});