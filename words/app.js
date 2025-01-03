const predefinedVocabularies = [
  { name: "Anh văn lớp 1", words: ["apple", "banana", "cat", "dog"] },
  { name: "Anh văn lớp 2", words: ["orange", "grape", "rabbit", "horse"] },
  { name: "Anh văn lớp 3", words: ["tiger", "lion", "zebra", "elephant"] },
];

function saveToCookie(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function loadFromCookie(key) {
  return JSON.parse(localStorage.getItem(key)) || [];
}

const app = Vue.createApp({
  data() {
    return {
      screenMode: 0,
      vocabularyInput: '',
      vocabulary: [],
      currentWord: null,
      resultArray: [], // Phần A: kết quả
      shuffledWord: [], // Phần B: ký tự chưa chọn
      currentIndex: 0,
      timeLimit: 30,
      timeLeft: 0,
      timer: null,
      selectedResultIndex: null, // Vị trí được chọn trong Phần A
      resultMessage: '',
      resultEmoji: '',
      correctAnswers: 0,
      totalQuestions: 0,
      predefinedVocabularies,
      userDefinedVocabularies: loadFromCookie("userVocabularies"),
      selectedVocabulary: null,
      history: loadFromCookie("gameHistory").slice(0, 20),
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

    // Thêm từ vựng từ bộ được chọn
    addPredefinedVocabulary() {
      if (this.selectedVocabulary) {
        const selectedWords = this.selectedVocabulary.words.join(", ");
        this.vocabularyInput = this.vocabularyInput
          ? this.vocabularyInput + ", " + selectedWords
          : selectedWords;
      }
    },
    // Thêm từ vựng từ bộ được chọn (người dùng)
    addUserVocabulary() {
      if (this.selectedUserVocabulary) {
        const selectedWords = this.selectedUserVocabulary.words.join(", ");
        this.vocabularyInput = this.vocabularyInput
          ? this.vocabularyInput + ", " + selectedWords
          : selectedWords;
      }
    },
    // Xóa bộ từ vựng người dùng đã chọn
    deleteSelectedUserVocabulary() {
      if (this.selectedUserVocabulary) {
        const index = this.userDefinedVocabularies.findIndex(
          (vocab) => vocab.name === this.selectedUserVocabulary.name
        );
        if (index !== -1) {
          this.userDefinedVocabularies.splice(index, 1);
          saveToCookie("userVocabularies", this.userDefinedVocabularies);
          this.selectedUserVocabulary = null; // Xóa lựa chọn
        }
      }
    },
    saveUserVocabulary(name) {
      if (!name) {
        alert("Hãy đặt tên cho bộ từ vựng!");
        return;
      }
      const newVocabulary = {
        name,
        words: this.vocabularyInput.split(",").map(word => word.trim()).filter(word => word),
      };
      this.userDefinedVocabularies.push(newVocabulary);
      saveToCookie("userVocabularies", this.userDefinedVocabularies);
      alert("Lưu thành công!");
    },
    // Xóa bộ từ vựng người dùng tạo
    deleteUserVocabulary(index) {
      this.userDefinedVocabularies.splice(index, 1);
      saveToCookie("userVocabularies", this.userDefinedVocabularies);
    },
    // Lưu lịch sử trò chơi
    saveGameHistory(startTime, endTime, wordCount, correct) {
      const newRecord = { start_time: startTime, end_time: endTime, word_count: wordCount, correct };
      this.history.unshift(newRecord);
      this.history = this.history.slice(0, 20); // Giới hạn 20 bản ghi
      saveToCookie("gameHistory", this.history);
    },

    startQuiz() {
      const words = this.vocabularyInput.split(",").map(word => word.trim()).filter(word => word);
      if (words.length === 0 || this.timeLimit < 5) {
        alert("Hãy nhập từ vựng hợp lệ!");
        return;
      }
      this.vocabulary = words;
      this.currentIndex = 0;
      this.correctAnswers = 0;
      this.totalQuestions = 0;
      this.loadWord();
      this.screenMode = 1;
      this.saveGameHistory(new Date().toISOString(), "", words.length, 0); // Lưu thời gian bắt đầu
    },
    loadWord() {
      this.currentWord = this.vocabulary[this.currentIndex];
      this.resultArray = Array(this.currentWord.length).fill(''); // Tạo ô trống
      this.shuffledWord = this.shuffle(this.currentWord.split(''));
      this.selectedResultIndex = 0; // Mặc định chọn ô đầu tiên
      this.timeLeft = this.timeLimit;
      this.startTimer();
      console.log('this.currentWord', this.currentWord)
    },
    checkAnswer() {
      clearInterval(this.timer);
      this.correctAnswers += this.currentWord === this.resultArray.join("") ? 1 : 0;
      this.totalQuestions += 1;
      this.currentIndex += 1;
      if (this.currentIndex < this.vocabulary.length) {
        this.loadWord();
      } else {
        this.saveGameHistory(
          this.history[0].start_time,
          new Date().toISOString(),
          this.vocabulary.length,
          this.correctAnswers
        );
        this.screen = 'result';
      }
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
      this.screenMode = 2;
    },
    nextWord() {
      this.currentIndex += 1;
      this.loadWord();
      this.screenMode = 1;
    },
    resetQuiz() {
      this.screenMode = 0;
    },
  },
});

app.mount('#app');
