
const { createApp } = Vue;
createApp({
    data() {
        return {
            screenMode: 0,
            minLimit: 1,
            maxLimit: 100,
            allowNegativeResults: false,
            operations: ['+', '−', '×', '÷'],
            selectedOperations: ['+'],
            num1: 0,
            num2: 0,
            correctAnswer: 0,
            userAnswer: '',
            question: '',
            showResult: false,
            resultMessage: '',
            resultEmoji: '',
            digits: [1,2,3,4,5,6,7,8,9,0],
            totalQuestions: 10, // Số lượng câu hỏi mặc định
            currentQuestion: 0,
            correctCount: 0,
            timeLimit: 30, // Thời gian giới hạn mặc định
            remainingTime: 0, // Thời gian còn lại cho câu hỏi hiện tại
            timer: null, // Bộ đếm thời gian
            totalTime: 0,
            fastestTime: null,
            slowestTime: null,
            currentStreak: 0,
            maxCorrectStreak: 0,
            maxIncorrectStreak: 0,
            incorrectStreak: 0,
        };
    },
    computed: {
        accuracyPercentage() {
            return this.currentQuestion === 1 ? 0 : ((this.correctCount / (this.currentQuestion - 1)) * 100).toFixed(0);
        },
        finalAccuracyPercentage() {
            return this.currentQuestion === 1 ? 0 : ((this.correctCount / (this.currentQuestion)) * 100).toFixed(0);
        },
    },
    methods: {
        getResponseTime() {
            return this.timeLimit - this.remainingTime + 1
        },
        startTimer() {
            this.remainingTime = this.timeLimit;
            this.timer = setInterval(() => {
                this.remainingTime--;
                if (this.remainingTime <= 0) {
                    clearInterval(this.timer);
                    this.checkAnswer(true); // Tự động kiểm tra khi hết thời gian
                }
            }, 1000);
        },
        stopTimer() {
            clearInterval(this.timer);
            this.timer = null;
        },
        generateQuestion() {
            if (this.currentQuestion >= this.totalQuestions) {
                this.showStatistics();
                return;
            }

            this.currentQuestion++;
            this.stopTimer(); // Dừng bộ đếm thời gian của câu trước (nếu có)
            do {
                this.num1 = Math.floor(Math.random() * (this.maxLimit - this.minLimit + 1)) + this.minLimit;
                this.num2 = Math.floor(Math.random() * (this.maxLimit - this.minLimit + 1)) + this.minLimit;

                const operation = this.selectedOperations[Math.floor(Math.random() * this.selectedOperations.length)];

                if (operation === '÷') {
                    this.num1 = this.num1 * this.num2;
                }

                switch (operation) {
                    case '+':
                        this.correctAnswer = this.num1 + this.num2;
                        break;
                    case '−':
                        this.correctAnswer = this.num1 - this.num2;
                        break;
                    case '×':
                        this.correctAnswer = this.num1 * this.num2;
                        break;
                    case '÷':
                        this.correctAnswer = this.num1 / this.num2;
                        break;
                }

                this.question = `${this.num1} ${operation} ${this.num2} =`;
            } while (!this.allowNegativeResults && this.correctAnswer < 0);
            this.startTimer(); // Bắt đầu đếm ngược cho câu hỏi mới
        },
        appendDigit(digit) {
            this.userAnswer += digit;
        },
        deleteLastDigit() {
            this.userAnswer = this.userAnswer.slice(0, -1);
        },
        checkAnswer(timeout = false) {
            const responseTime = this.getResponseTime()
            this.totalTime += responseTime
            this.stopTimer();
            if (!timeout && parseFloat(this.userAnswer) === this.correctAnswer) {
                document.getElementById("correct").play();
                this.correctCount++;
                this.currentStreak++;
                this.maxCorrectStreak = Math.max(this.maxCorrectStreak, this.currentStreak);
                this.incorrectStreak = 0;
                if (this.fastestTime === null || responseTime < this.fastestTime) {
                    this.fastestTime = responseTime;
                }
                if (this.slowestTime === null || responseTime > this.slowestTime) {
                    this.slowestTime = responseTime;
                }

                this.resultMessage = 'Chính xác!';
                document.body.style.backgroundColor = '#eeffed';
                this.resultEmoji = this.getSuccessEmoji(true);
            } else {

                this.currentStreak = 0;
                this.incorrectStreak++;
                this.maxIncorrectStreak = Math.max(this.maxIncorrectStreak, this.incorrectStreak);

                document.getElementById("incorrect").play();
                this.resultMessage = timeout ? `Hết giờ! Đáp án đúng là: ${this.question} ${this.correctAnswer}.` : `Sai! Đáp án đúng là: ${this.question} ${this.correctAnswer}.`;
                document.body.style.backgroundColor = '#faf3de';
                this.resultEmoji = this.getSuccessEmoji(false);
            }
            this.showResult = true;
        },
        getSuccessEmoji(isCorrect = false) {
            const w_emoji = ['💯', '♥️',  '💖', '💞', '💡', '🎁', '🎉', '🎊', '🥉', '🥈', '🥇', '🏅', '🏆', '⭐', '⭐⭐', '⭐🌟⭐', '✨','💫', '🌠', '☀️', '💎', '👑', '🚀']
            const r_emoji = ['😊', '😄', '🤭', '🤓', '😁', '👍', '😆', '😎', '😤', '✌️', '🤗', '😘', '🥰', '😍', '👏', '😸', '😻', '🤩', '⭐']
            const l_emoji = ['😟', '😞', '😕', '🙁', '😣', '😦', '😒', '🙄', '😠', '😫', '😩', '😧', '😖', '😢', '😥', '😪', '😵', '🥺', '🤕', '😭', '😨', '😰', '😱', '🤯', '🐣', '👶', '🙈', '🐧', '🤡', '💔', '💩']
            const accuracy = (this.correctCount / this.currentQuestion) * 100;
            const minModl = 3
            let modl = 3
            if (this.totalQuestions > (w_emoji.length*modl)){
                modl = Math.floor(this.totalQuestions/w_emoji.length)
            }
            const qIndexNormalize =  Math.floor(this.currentQuestion/modl)
            let emoji = l_emoji
            if (accuracy >= 95) {
                emoji = w_emoji
            } else if (accuracy >= 80 || isCorrect) {
                emoji = r_emoji
            }
            
            const rindex = Math.min(qIndexNormalize, emoji.length - 1)
            return emoji[rindex]
        },
        showStatistics() {
            this.screenMode = 2;
        },
        resetGame() {
            this.stopTimer();
            this.showResult = false;
            this.screenMode = 1;
            this.resultMessage = '';
            this.userAnswer = '';
            document.body.style.backgroundColor = '#f9f9f9';
            this.generateQuestion();
        },
        resetAll() {
            this.screenMode = 0;
        },
        startGame() {
            if (this.selectedOperations.length === 0) {
                alert('Vui lòng chọn ít nhất một phép tính.');
                return;
            }

            if (!Number.isInteger(this.minLimit) || !Number.isInteger(this.maxLimit)) {
                alert('Giới hạn số hạng phải là số nguyên (Không có dấu chấm/phẩy).');
                return;
            }

            if (this.minLimit < -10000 || this.maxLimit > 10000) {
                alert('Giới hạn số hạng phải nằm trong khoảng từ -10000 đến 10000.');
                return;
            }

            if (this.minLimit > this.maxLimit) {
                alert('Giới hạn nhỏ nhất phải nhỏ hơn giới hạn lớn nhất.');
                return;
            }


            this.screenMode = 1;
            this.currentQuestion = 0;
            this.correctCount = 0;
            this.totalTime = 0;
            this.fastestTime = null;
            this.slowestTime = null;
            this.currentStreak = 0;
            this.maxCorrectStreak = 0;
            this.maxIncorrectStreak = 0;
            this.generateQuestion();
        },
    },
}).mount('#app');