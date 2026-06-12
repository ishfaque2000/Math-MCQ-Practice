// quiz.js — MCQ Engine

const QuizEngine = {
  allQuestions: [],
  quizQuestions: [],
  userAnswers: [],
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

  buildQuiz(config) {
    this.config = config;
    let pool = this.allQuestions.slice();

    if (config.difficulty !== 'Mixed') {
      pool = pool.filter(q => q.difficulty === config.difficulty);
    }

    // Fallback: if pool too small, use everything
    if (pool.length < config.numQuestions) {
      pool = this.allQuestions.slice();
    }

    const shuffled = this.shuffle(pool.slice());
    const count = Math.min(config.numQuestions, shuffled.length);
    this.quizQuestions = shuffled.slice(0, count).map(q => ({
      ...q,
      options: this.shuffle(q.options.slice())
    }));

    this.userAnswers = new Array(this.quizQuestions.length).fill(null);
    this.currentIndex = 0;
    this.score = 0;

    return this.quizQuestions;
  },

  shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  },

  getCurrentQuestion() { return this.quizQuestions[this.currentIndex]; },

  answerCurrent(selectedOption) {
    const q = this.quizQuestions[this.currentIndex];
    this.userAnswers[this.currentIndex] = selectedOption;
    const isCorrect = selectedOption === q.answer;
    if (isCorrect) this.score++;
    return { isCorrect, correctAnswer: q.answer };
  },

  setAllAnswers(answersMap) {
    this.score = 0;
    this.quizQuestions.forEach((q, idx) => {
      const ans = answersMap[idx] ?? null;
      this.userAnswers[idx] = ans;
      if (ans === q.answer) this.score++;
    });
  },

  hasNext() { return this.currentIndex < this.quizQuestions.length - 1; },
  goNext()  { if (this.hasNext()) this.currentIndex++; },

  getProgressPercent() {
    return ((this.currentIndex + 1) / this.quizQuestions.length) * 100;
  },

  getGrade(pct) {
    if (pct >= 90) return 'A+';
    if (pct >= 80) return 'A';
    if (pct >= 70) return 'B';
    if (pct >= 60) return 'C';
    if (pct >= 50) return 'D';
    return 'F';
  },

  getGradeClass(grade) {
    if (grade.startsWith('A')) return 'grade-a';
    if (grade.startsWith('B')) return 'grade-b';
    if (grade.startsWith('C')) return 'grade-c';
    if (grade.startsWith('D')) return 'grade-d';
    return 'grade-f';
  },

  getResultSummary(name, age) {
    const total   = this.quizQuestions.length;
    const correct = this.score;
    const wrong   = total - correct;
    const pct     = total > 0 ? Math.round((correct / total) * 100) : 0;
    const grade   = this.getGrade(pct);

    const messages = {
      'A+': '🌟 Perfect score! You\'re a math genius!',
      'A' : '🚀 Outstanding performance! Keep it up!',
      'B' : '👍 Great work! You\'re mastering the concepts!',
      'C' : '📈 Good effort! A little more practice and you\'ll excel!',
      'D' : '💪 Keep going! Practice makes perfect!',
      'F' : '📚 Don\'t give up! Every expert was once a beginner!'
    };

    return {
      name, age,
      score: correct, total, correct, wrong,
      percentage: pct,
      grade,
      gradeClass: this.getGradeClass(grade),
      message: messages[grade] || messages['F'],
      date: new Date().toLocaleString()
    };
  },

  getReviewData() {
    return this.quizQuestions.map((q, idx) => {
      const userAns = this.userAnswers[idx];
      return {
        question:      q.question,
        yourAnswer:    userAns,
        correctAnswer: q.answer,
        isCorrect:     userAns === q.answer,
        options:       q.options,
        topic:         q.topic,
        difficulty:    q.difficulty
      };
    });
  }
};
