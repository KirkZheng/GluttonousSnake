class Snake {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.gridSize = 20;
        this.snake = [{x: 5, y: 5}];
        this.direction = 'right';
        this.food = this.generateFood();
        this.score = 0;
        this.gameLoop = null;
        this.isPaused = false;
        this.speed = 150;
        this.highScore = localStorage.getItem('snakeHighScore') || 0;
        this.gameMode = 'classic'; // 默认经典模式
        this.timeLeft = 60; // 限时模式的时间限制（秒）
        this.timeInterval = null;
        
        // 添加可爱的颜色主题
        this.colors = {
            snake: '#FF6B6B',
            snakeHead: '#FF4757',
            food: '#7BED9F',
            grid: '#F1F2F6',
            background: '#FFFFFF'
        };
        
        this.particles = [];
        
        this.initializeCanvas();
        this.setupEventListeners();
    }

    initializeCanvas() {
        this.canvas.width = 400;
        this.canvas.height = 400;
    }

    // 添加粒子效果
    createParticles(x, y, color) {
        for (let i = 0; i < 5; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 5,
                vy: (Math.random() - 0.5) * 5,
                size: Math.random() * 3 + 2,
                color: color,
                life: 1
            });
        }
    }

    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life -= 0.02;
            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    drawParticles() {
        this.particles.forEach(p => {
            this.ctx.globalAlpha = p.life;
            this.ctx.fillStyle = p.color;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fill();
        });
        this.ctx.globalAlpha = 1;
    }

    draw() {
        // 清空画布并填充背景色
        this.ctx.fillStyle = this.colors.background;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // 绘制网格
        this.drawGrid();

        // 绘制粒子
        this.updateParticles();
        this.drawParticles();

        // 绘制蛇
        this.snake.forEach((segment, index) => {
            const isHead = index === 0;
            
            this.ctx.fillStyle = isHead ? this.colors.snakeHead : this.colors.snake;
            
            // 绘制圆形作为蛇的身体
            this.ctx.beginPath();
            this.ctx.arc(
                segment.x * this.gridSize + this.gridSize/2,
                segment.y * this.gridSize + this.gridSize/2,
                this.gridSize/2 - 2,
                0,
                Math.PI * 2
            );
            this.ctx.fill();

            // 为相邻的圆之间添加连接
            if (index > 0) {
                const prevSegment = this.snake[index - 1];
                this.ctx.beginPath();
                this.ctx.fillStyle = this.colors.snake;
                this.ctx.moveTo(prevSegment.x * this.gridSize + this.gridSize/2, 
                              prevSegment.y * this.gridSize + this.gridSize/2);
                this.ctx.lineTo(segment.x * this.gridSize + this.gridSize/2,
                              segment.y * this.gridSize + this.gridSize/2);
                this.ctx.lineWidth = this.gridSize - 4;
                this.ctx.strokeStyle = this.colors.snake;
                this.ctx.stroke();
            }

            // 为蛇头添加眼睛
            if (isHead) {
                this.drawEyes(segment);
            }
        });

        // 绘制食物
        this.drawFood();
    }

    drawGrid() {
        this.ctx.strokeStyle = this.colors.grid;
        this.ctx.lineWidth = 0.5;

        for (let i = 0; i <= this.canvas.width; i += this.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(i, 0);
            this.ctx.lineTo(i, this.canvas.height);
            this.ctx.stroke();
        }

        for (let i = 0; i <= this.canvas.height; i += this.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, i);
            this.ctx.lineTo(this.canvas.width, i);
            this.ctx.stroke();
        }
    }

    drawFood() {
        const x = this.food.x * this.gridSize + this.gridSize/2;
        const y = this.food.y * this.gridSize + this.gridSize/2;
        
        // 绘制食物的主体（圆形）
        this.ctx.fillStyle = this.colors.food;
        this.ctx.beginPath();
        this.ctx.arc(x, y, this.gridSize/2 - 2, 0, Math.PI * 2);
        this.ctx.fill();

        // 添加可爱的装饰
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.beginPath();
        this.ctx.arc(x - 2, y - 2, 3, 0, Math.PI * 2);
        this.ctx.fill();
    }

    drawEyes(head) {
        const eyeSize = 3;
        const x = head.x * this.gridSize + this.gridSize/2;
        const y = head.y * this.gridSize + this.gridSize/2;
        
        // 根据方向确定眼睛位置的偏移
        let offsetX = 0;
        let offsetY = 0;
        switch(this.direction) {
            case 'right': offsetX = 4; break;
            case 'left': offsetX = -4; break;
            case 'up': offsetY = -4; break;
            case 'down': offsetY = 4; break;
        }

        // 绘制眼睛
        this.ctx.fillStyle = '#FFFFFF';
        // 左眼
        this.ctx.beginPath();
        this.ctx.arc(x - 4 + offsetX, y - 4 + offsetY, eyeSize, 0, Math.PI * 2);
        this.ctx.fill();
        // 右眼
        this.ctx.beginPath();
        this.ctx.arc(x + 4 + offsetX, y - 4 + offsetY, eyeSize, 0, Math.PI * 2);
        this.ctx.fill();

        // 眼球
        this.ctx.fillStyle = '#000000';
        this.ctx.beginPath();
        this.ctx.arc(x - 4 + offsetX, y - 4 + offsetY, eyeSize/2, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.arc(x + 4 + offsetX, y - 4 + offsetY, eyeSize/2, 0, Math.PI * 2);
        this.ctx.fill();
    }

    move() {
        const head = {...this.snake[0]};
        
        switch(this.direction) {
            case 'up': head.y--; break;
            case 'down': head.y++; break;
            case 'left': head.x--; break;
            case 'right': head.x++; break;
        }
        
        // 根据游戏模式处理边界
        if (this.gameMode === 'infinite') {
            // 无限模式：从另一边出现
            if (head.x < 0) head.x = Math.floor(this.canvas.width / this.gridSize) - 1;
            if (head.x >= this.canvas.width / this.gridSize) head.x = 0;
            if (head.y < 0) head.y = Math.floor(this.canvas.height / this.gridSize) - 1;
            if (head.y >= this.canvas.height / this.gridSize) head.y = 0;
        } else {
            // 经典模式和限时模式：撞墙结束
            if (head.x < 0 || head.x >= this.canvas.width / this.gridSize ||
                head.y < 0 || head.y >= this.canvas.height / this.gridSize) {
                this.gameOver();
                return;
            }
        }
        
        // 检查是否撞到自己
        if (this.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
            this.gameOver();
            return;
        }
        
        this.snake.unshift(head);
        
        // 检查是否吃到食物
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            document.getElementById('score').textContent = this.score;
            this.food = this.generateFood();
            // 在食物位置创建粒子效果
            this.createParticles(
                head.x * this.gridSize + this.gridSize/2,
                head.y * this.gridSize + this.gridSize/2,
                this.colors.food
            );
        } else {
            this.snake.pop();
        }
    }

    generateFood() {
        const x = Math.floor(Math.random() * (this.canvas.width / this.gridSize));
        const y = Math.floor(Math.random() * (this.canvas.height / this.gridSize));
        return {x, y};
    }

    startGame() {
        // 清除之前的游戏循环和计时器
        if (this.gameLoop) clearInterval(this.gameLoop);
        if (this.timeInterval) clearInterval(this.timeInterval);
        
        // 重置游戏状态
        this.snake = [{x: 5, y: 5}];
        this.direction = 'right';
        this.score = 0;
        document.getElementById('score').textContent = '0';
        this.food = this.generateFood();
        this.isPaused = false;
        document.getElementById('pause-btn').textContent = '暂停';
        
        // 获取选择的游戏模式
        this.gameMode = document.querySelector('input[name="mode"]:checked').value;
        
        // 如果是限时模式，初始化计时器
        if (this.gameMode === 'timed') {
            this.timeLeft = 60;
            document.getElementById('time').textContent = this.timeLeft;
            document.getElementById('time').parentElement.classList.remove('time-warning');
            
            this.timeInterval = setInterval(() => {
                if (!this.isPaused) {
                    this.timeLeft--;
                    document.getElementById('time').textContent = this.timeLeft;
                    
                    // 最后10秒添加警告效果
                    if (this.timeLeft <= 10) {
                        document.getElementById('time').parentElement.classList.add('time-warning');
                    }
                    
                    // 时间到，游戏结束
                    if (this.timeLeft <= 0) {
                        this.gameOver();
                    }
                }
            }, 1000);
        }
        
        // 启动游戏循环
        this.gameLoop = setInterval(() => {
            if (!this.isPaused) {
                this.move();
                this.draw();
            }
        }, this.speed);
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        document.getElementById('pause-btn').textContent = this.isPaused ? '继续' : '暂停';
    }

    gameOver() {
        clearInterval(this.gameLoop);
        clearInterval(this.timeInterval);
        this.gameLoop = null;
        this.timeInterval = null;
        
        // 更新最高分
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('snakeHighScore', this.highScore);
        }

        // 显示游戏结束对话框
        const modal = document.getElementById('game-over-modal');
        const finalScore = document.getElementById('final-score');
        const highScore = document.getElementById('high-score');
        const finalTime = document.getElementById('final-time');
        
        finalScore.textContent = this.score;
        highScore.textContent = this.highScore;
        
        // 显示游戏时长
        if (this.gameMode === 'timed') {
            finalTime.textContent = `${60 - this.timeLeft}秒`;
        } else {
            finalTime.textContent = '无限制';
        }
        
        // 添加彩虹效果
        if (this.score > this.highScore) {
            finalScore.classList.add('rainbow-text');
            setTimeout(() => finalScore.classList.remove('rainbow-text'), 5000);
        }
        
        modal.style.display = 'flex';
    }

    setupEventListeners() {
        // 键盘控制
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'ArrowUp':
                    if (this.direction !== 'down') this.direction = 'up';
                    break;
                case 'ArrowDown':
                    if (this.direction !== 'up') this.direction = 'down';
                    break;
                case 'ArrowLeft':
                    if (this.direction !== 'right') this.direction = 'left';
                    break;
                case 'ArrowRight':
                    if (this.direction !== 'left') this.direction = 'right';
                    break;
            }
        });

        // 按钮控制
        document.getElementById('start-btn').addEventListener('click', () => this.startGame());
        document.getElementById('pause-btn').addEventListener('click', () => this.togglePause());
        document.getElementById('restart-btn').addEventListener('click', () => {
            document.getElementById('game-over-modal').style.display = 'none';
            this.startGame();
        });
        
        // 速度控制
        document.getElementById('speed').addEventListener('change', (e) => {
            switch(e.target.value) {
                case 'slow':
                    this.speed = 200;
                    break;
                case 'medium':
                    this.speed = 150;
                    break;
                case 'fast':
                    this.speed = 100;
                    break;
            }
            if (this.gameLoop) {
                this.startGame(); // 重启游戏以应用新速度
            }
        });
        
        // 添加模式切换监听器
        document.querySelectorAll('input[name="mode"]').forEach(radio => {
            radio.addEventListener('change', () => {
                if (this.gameLoop) {
                    if (confirm('切换模式将重新开始游戏，是否继续？')) {
                        this.startGame();
                    } else {
                        // 恢复之前的选择
                        document.querySelector(`input[value="${this.gameMode}"]`).checked = true;
                    }
                }
            });
        });
    }
}

// 当页面加载完成后初始化游戏
window.addEventListener('load', () => {
    const canvas = document.getElementById('game-board');
    const game = new Snake(canvas);
});