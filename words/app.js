const app = Vue.createApp({
  data() {
    return {
      screen: 'settings', // Possible values: 'settings', 'quiz', 'result'
      vocabularyInput: '',
      vocabulary: [],
      currentWord: null,
      shuffledWord: [],
      currentIndex: 0,
      countdownTime: 30,
      timeLeft: 0,
      timer: null,
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
      this.shuffledWord = this.shuffle(this.currentWord.split(''));
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
    onDragStart(index) {
      this.draggedIndex = index;
    },
    onDrop(index) {
      const temp = this.shuffledWord[index];
      this.shuffledWord[index] = this.shuffledWord[this.draggedIndex];
      this.shuffledWord[this.draggedIndex] = temp;
    },
    checkAnswer() {
      clearInterval(this.timer);
      this.isAnswerCorrect = this.shuffledWord.join('') === this.currentWord;
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
