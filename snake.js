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
        this.speed = 150; // Default speed (medium)
        
        // 添加可爱的颜色主题
        this.colors = {
            snake: '#FF6B6B',  // 粉红色的蛇身
            snakeHead: '#FF4757', // 深粉色的蛇头
            food: '#7BED9F',   // 青绿色的食物
            grid: '#F1F2F6',   // 浅灰色网格
            background: '#FFFFFF' // 白色背景
        };
        
        this.initializeCanvas();
        this.setupEventListeners();
    }

    initializeCanvas() {
        this.canvas.width = 400;
        this.canvas.height = 400;
    }

    draw() {
        // 清空画布并填充背景色
        this.ctx.fillStyle = this.colors.background;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // 绘制网格
        this.drawGrid();

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

    generateFood() {
        const x = Math.floor(Math.random() * (this.canvas.width / this.gridSize));
        const y = Math.floor(Math.random() * (this.canvas.height / this.gridSize));
        return {x, y};
    }

    move() {
        const head = {...this.snake[0]};

        switch(this.direction) {
            case 'up':
                head.y--;
                // 如果超出上边界，从下方出现
                if (head.y < 0) {
                    head.y = Math.floor(this.canvas.height / this.gridSize) - 1;
                }
                break;
            case 'down':
                head.y++;
                // 如果超出下边界，从上方出现
                if (head.y >= this.canvas.height / this.gridSize) {
                    head.y = 0;
                }
                break;
            case 'left':
                head.x--;
                // 如果超出左边界，从右边出现
                if (head.x < 0) {
                    head.x = Math.floor(this.canvas.width / this.gridSize) - 1;
                }
                break;
            case 'right':
                head.x++;
                // 如果超出右边界，从左边出现
                if (head.x >= this.canvas.width / this.gridSize) {
                    head.x = 0;
                }
                break;
        }

        // 检查是否吃到食物
        if (head.x === this.food.x && head.y === this.food.y) {
            this.food = this.generateFood();
            this.score += 10;
            document.getElementById('score').textContent = this.score;
            // 添加吃到食物的视觉效果
            this.showFoodEffect();
        } else {
            this.snake.pop();
        }

        // 只检查是否撞到自己
        if (this.checkSelfCollision(head)) {
            this.gameOver();
            return;
        }

        this.snake.unshift(head);
        this.draw();
    }

    // 修改碰撞检测，只检查自身碰撞
    checkSelfCollision(head) {
        // 跳过头部位置，从索引1开始检查
        return this.snake.slice(1).some(segment => 
            segment.x === head.x && segment.y === head.y
        );
    }

    // 添加食物效果
    showFoodEffect() {
        const effect = document.createElement('div');
        effect.className = 'food-effect';
        effect.textContent = '+10';
        effect.style.left = `${this.food.x * this.gridSize}px`;
        effect.style.top = `${this.food.y * this.gridSize}px`;
        document.getElementById('game-container').appendChild(effect);
        
        setTimeout(() => effect.remove(), 1000);
    }

    startGame() {
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
        }
        this.snake = [{x: 5, y: 5}];
        this.direction = 'right';
        this.score = 0;
        document.getElementById('score').textContent = '0';
        this.food = this.generateFood();
        this.isPaused = false;
        this.gameLoop = setInterval(() => this.move(), this.speed);
    }

    togglePause() {
        if (this.isPaused) {
            this.gameLoop = setInterval(() => this.move(), this.speed);
            document.getElementById('pause-btn').textContent = '暂停';
        } else {
            clearInterval(this.gameLoop);
            document.getElementById('pause-btn').textContent = '继续';
        }
        this.isPaused = !this.isPaused;
    }

    gameOver() {
        clearInterval(this.gameLoop);
        this.gameLoop = null;
        alert(`游戏结束！得分：${this.score}`);
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
    }
}

// 当页面加载完成后初始化游戏
window.addEventListener('load', () => {
    const canvas = document.getElementById('game-board');
    const game = new Snake(canvas);
});