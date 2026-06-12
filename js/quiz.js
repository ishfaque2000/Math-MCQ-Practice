// quiz.js - MCQ Engine

const QuizEngine = {
  allQuestions: [],
  quizQuestions: [],
  userAnswers: [], // index-aligned with quizQuestions; null if unanswered
  currentIndex: 0,
  score: 0,
  config: {},

  async loadQuestions() {
    if (this.allQuestions.length > 0) return this.allQuestions;
    const res = await fetch('data/questions.json');
    if (!res.ok) throw new Error('Failed to load questions');
    this.allQuestions = await res.json();
    return this.allQuestions;
  },

  /**
   * Filters questions based on topic & difficulty, then randomly selects
   * the requested number without repeats.
   */
  buildQuiz(config) {
    this.config = config;
    let pool = this.allQuestions.slice();

    if (config.topic !== 'Mixed') {
      pool = pool.filter(q => q.topic === config.topic);
    }
    if (config.difficulty !== 'Mixed') {
      pool = pool.filter(q => q.difficulty === config.difficulty);
    }

    // If pool too small, fall back to all questions matching topic only,
    // then fall back to entire bank to ensure we can fill the quiz.
    if (pool.length < config.numQuestions) {
      let fallback = this.allQuestions.slice();
      if (config.topic !== 'Mixed') {
        fallback = fallback.filter(q => q.topic === config.topic);
      }
      if (fallback.length > pool.length) pool = fallback;
    }
    if (pool.length < config.numQuestions) {
      pool = this.allQuestions.slice();
    }

    // Shuffle pool (Fisher-Yates)
    const shuffled = this.shuffle(pool.slice());
    const count = Math.min(config.numQuestions, shuffled.length);
    this.quizQuestions = shuffled.slice(0, count).map(q => {
      // Shuffle options per question too
      return { ...q, options: this.shuffle(q.options.slice()) };
    });

    this.userAnswers = new Array(this.quizQuestions.length).fill(null);
    this.currentIndex = 0;
    this.score = 0;

    return this.quizQuestions;
  },

  shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  },

  getCurrentQuestion() {
    return this.quizQuestions[this.currentIndex];
  },

  /**
   * Records an answer for the current question (one-question mode).
   * Returns { isCorrect, correctAnswer }
   */
  answerCurrent(selectedOption) {
    const q = this.quizQuestions[this.currentIndex];
    this.userAnswers[this.currentIndex] = selectedOption;
    const isCorrect = selectedOption === q.answer;
    if (isCorrect) this.score++;
    return { isCorrect, correctAnswer: q.answer };
  },

  /**
   * For full-list mode: set all answers at once from a map {index: option}
   */
  setAllAnswers(answersMap) {
    this.score = 0;
    this.quizQuestions.forEach((q, idx) => {
      const ans = answersMap[idx] ?? null;
      this.userAnswers[idx] = ans;
      if (ans === q.answer) this.score++;
    });
  },

  hasNext() {
    return this.currentIndex < this.quizQuestions.length - 1;
  },

  goNext() {
    if (this.hasNext()) this.currentIndex++;
  },

  getProgressPercent() {
    return ((this.currentIndex + 1) / this.quizQuestions.length) * 100;
  },

  getResultSummary(name, age) {
    const total = this.quizQuestions.length;
    const correct = this.score;
    const wrong = total - correct;
    const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;

    let message = '';
    if (percentage >= 90) message = '🌟 Excellent!';
    else if (percentage >= 75) message = '👍 Good Job!';
    else if (percentage >= 50) message = '🙂 Average — Keep Practicing!';
    else message = '📚 Needs Improvement — Don\'t Give Up!';

    return {
      name,
      age,
      score: correct,
      total,
      correct,
      wrong,
      percentage,
      message,
      date: new Date().toLocaleString()
    };
  },

  getReviewData() {
    return this.quizQuestions.map((q, idx) => {
      const userAns = this.userAnswers[idx];
      return {
        question: q.question,
        yourAnswer: userAns,
        correctAnswer: q.answer,
        isCorrect: userAns === q.answer,
        options: q.options,
        topic: q.topic,
        difficulty: q.difficulty
      };
    });
  }
};
