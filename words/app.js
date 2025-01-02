const app = Vue.createApp({
  data() {
    return {
      screen: 'settings',
      vocabularyInput: '',
      vocabulary: [],
      currentWord: null,
      resultArray: [], // Phần A: kết quả
      shuffledWord: [], // Phần B: ký tự chưa chọn
      currentIndex: 0,
      countdownTime: 30,
      timeLeft: 0,
      timer: null,
      selectedResultIndex: null, // Vị trí được chọn trong Phần A
      isAnswerCorrect: false,
      correctAnswers: 0,
      totalQuestions: 0,
    };
  },
  computed: {
    percentage() {
      return this.totalQuestions === 0
        ? 0
        : Math.round((this.correctAnswers / this.totalQuestions) * 100);
    },
  },
  methods: {
    startQuiz() {
      this.vocabulary = this.vocabularyInput
        .split(',')
        .map(word => word.trim())
        .filter(word => word);
      if (this.vocabulary.length === 0 || this.countdownTime < 5) {
        alert('Please provide valid input!');
        return;
      }
      this.correctAnswers = 0;
      this.totalQuestions = 0;
      this.currentIndex = 0;
      this.loadWord();
      this.screen = 'quiz';
    },
    loadWord() {
      this.currentWord = this.vocabulary[this.currentIndex];
      this.resultArray = Array(this.currentWord.length).fill(''); // Tạo ô trống
      this.shuffledWord = this.shuffle(this.currentWord.split(''));
      this.selectedResultIndex = 0; // Mặc định chọn ô đầu tiên
      this.timeLeft = this.countdownTime;
      this.startTimer();
    },
    shuffle(array) {
      return array.sort(() => Math.random() - 0.5);
    },
    startTimer() {
      clearInterval(this.timer);
      this.timer = setInterval(() => {
        this.timeLeft -= 1;
        if (this.timeLeft <= 0) {
          clearInterval(this.timer);
          this.checkAnswer();
        }
      }, 1000);
    },
    selectFromShuffled(index) {
      const selectedChar = this.shuffledWord[index];
      if (this.selectedResultIndex !== null) {
        // Điền ký tự vào ô được chọn trong Phần A
        this.resultArray[this.selectedResultIndex] = selectedChar;
        this.shuffledWord.splice(index, 1); // Xóa ký tự khỏi Phần B

        // Tìm ô trống tiếp theo
        this.findNextEmptyResult();
      }
    },
    selectFromResult(index) {
      if (this.resultArray[index]) {
        // Chuyển ký tự từ Phần A về Phần B
        const charToReturn = this.resultArray[index];
        this.resultArray[index] = '';
        this.shuffledWord.push(charToReturn);
      }
      // Chọn ô hiện tại
      this.selectedResultIndex = index;
    },
    findNextEmptyResult() {
      const nextEmptyIndex = this.resultArray.indexOf('');
      this.selectedResultIndex = nextEmptyIndex !== -1 ? nextEmptyIndex : null;
    },
    checkAnswer() {
      clearInterval(this.timer);
      this.isAnswerCorrect = this.resultArray.join('') === this.currentWord;
      if (this.isAnswerCorrect) this.correctAnswers += 1;
      this.totalQuestions += 1;
      this.screen = 'result';
    },
    nextWord() {
      this.currentIndex += 1;
      this.loadWord();
      this.screen = 'quiz';
    },
    resetQuiz() {
      this.screen = 'settings';
    },
  },
});

app.mount('#app');
