// app.js - Main application controller

document.addEventListener('DOMContentLoaded', () => {

  // ============ ELEMENTS ============
  const screens = {
    info: document.getElementById('screen-info'),
    config: document.getElementById('screen-config'),
    quizOne: document.getElementById('screen-quiz-one'),
    quizFull: document.getElementById('screen-quiz-full'),
    result: document.getElementById('screen-result'),
    history: document.getElementById('screen-history')
  };

  const infoForm = document.getElementById('infoForm');
  const studentNameInput = document.getElementById('studentName');
  const studentAgeInput = document.getElementById('studentAge');
  const errName = document.getElementById('errName');
  const errAge = document.getElementById('errAge');
  const viewHistoryBtn = document.getElementById('viewHistoryBtn');

  const configForm = document.getElementById('configForm');
  const numQuestionsInput = document.getElementById('numQuestions');
  const difficultySelect = document.getElementById('difficulty');
  const topicSelect = document.getElementById('topic');
  const errConfig = document.getElementById('errConfig');

  const qCounter = document.getElementById('qCounter');
  const scoreDisplay = document.getElementById('scoreDisplay');
  const progressFill = document.getElementById('progressFill');
  const questionText = document.getElementById('questionText');
  const optionsContainer = document.getElementById('optionsContainer');
  const feedback = document.getElementById('feedback');
  const submitAnswerBtn = document.getElementById('submitAnswerBtn');
  const nextQuestionBtn = document.getElementById('nextQuestionBtn');

  const fullListContainer = document.getElementById('fullListContainer');
  const submitFullBtn = document.getElementById('submitFullBtn');

  const resultSummary = document.getElementById('resultSummary');
  const performanceMsg = document.getElementById('performanceMsg');
  const downloadCsvBtn = document.getElementById('downloadCsvBtn');
  const reviewBtn = document.getElementById('reviewBtn');
  const reviewContainer = document.getElementById('reviewContainer');
  const restartBtn = document.getElementById('restartBtn');

  const historyContainer = document.getElementById('historyContainer');
  const clearHistoryBtn = document.getElementById('clearHistoryBtn');

  const darkToggle = document.getElementById('darkToggle');

  // ============ STATE ============
  let student = { name: '', age: '' };
  let selectedOption = null;
  let lastResult = null;
  let lastReviewData = null;

  // ============ NAVIGATION ============
  function showScreen(name) {
    Object.values(screens).forEach(s => s.classList.remove('active'));
    screens[name].classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  document.querySelectorAll('[data-back]').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-back');
      const map = {
        'screen-info': 'info',
        'screen-config': 'config'
      };
      showScreen(map[target] || 'info');
    });
  });

  // ============ DARK MODE ============
  function applyTheme(theme) {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      darkToggle.textContent = '☀️';
    } else {
      document.documentElement.removeAttribute('data-theme');
      darkToggle.textContent = '🌙';
    }
  }

  applyTheme(Storage.getTheme());

  darkToggle.addEventListener('click', () => {
    const current = Storage.getTheme();
    const next = current === 'dark' ? 'light' : 'dark';
    Storage.setTheme(next);
    applyTheme(next);
  });

  // ============ 1. STUDENT INFO FORM ============
  infoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    errName.textContent = '';
    errAge.textContent = '';

    const name = studentNameInput.value.trim();
    const age = studentAgeInput.value.trim();
    let valid = true;

    if (!name) {
      errName.textContent = 'Name is required.';
      valid = false;
    }

    if (!age || isNaN(age) || Number(age) <= 0) {
      errAge.textContent = 'Age must be a positive number.';
      valid = false;
    }

    if (!valid) return;

    student.name = name;
    student.age = age;

    showScreen('config');
  });

  // ============ VIEW HISTORY ============
  viewHistoryBtn.addEventListener('click', () => {
    renderHistory();
    showScreen('history');
  });

  function renderHistory() {
    const history = Storage.getHistory();
    historyContainer.innerHTML = '';

    if (history.length === 0) {
      historyContainer.innerHTML = '<p class="empty-msg">No previous attempts yet.</p>';
      return;
    }

    history.forEach(item => {
      const div = document.createElement('div');
      div.className = 'history-item';
      div.innerHTML = `
        <div>
          <div class="history-name">${escapeHtml(item.name)} (Age: ${escapeHtml(String(item.age))})</div>
          <div class="history-meta">${escapeHtml(item.date)}</div>
        </div>
        <div class="history-score">${item.score}/${item.total} (${item.percentage}%)</div>
      `;
      historyContainer.appendChild(div);
    });
  }

  clearHistoryBtn.addEventListener('click', () => {
    if (confirm('Clear all quiz history? This cannot be undone.')) {
      Storage.clearHistory();
      renderHistory();
    }
  });

  // ============ 2. QUIZ CONFIGURATION ============
  configForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    errConfig.textContent = '';

    const numQuestions = parseInt(numQuestionsInput.value, 10);
    if (isNaN(numQuestions) || numQuestions < 10 || numQuestions > 100) {
      errConfig.textContent = 'Number of questions must be between 10 and 100.';
      return;
    }

    const mode = configForm.querySelector('input[name="mode"]:checked').value;
    const difficulty = difficultySelect.value;
    const topic = topicSelect.value;

    try {
      await QuizEngine.loadQuestions();
    } catch (err) {
      errConfig.textContent = 'Failed to load question data. Please check data/questions.json.';
      return;
    }

    QuizEngine.buildQuiz({ numQuestions, mode, difficulty, topic });

    if (QuizEngine.quizQuestions.length === 0) {
      errConfig.textContent = 'No questions available for the selected filters.';
      return;
    }

    if (mode === 'one') {
      selectedOption = null;
      renderOneQuestion();
      showScreen('quizOne');
    } else {
      renderFullList();
      showScreen('quizFull');
    }
  });

  // ============ 3 & 4. ONE QUESTION MODE ============
  function renderOneQuestion() {
    const q = QuizEngine.getCurrentQuestion();
    const total = QuizEngine.quizQuestions.length;

    qCounter.textContent = `Question ${QuizEngine.currentIndex + 1} / ${total}`;
    scoreDisplay.textContent = `Score: ${QuizEngine.score}`;
    progressFill.style.width = `${QuizEngine.getProgressPercent()}%`;

    questionText.textContent = q.question;
    optionsContainer.innerHTML = '';
    feedback.textContent = '';
    feedback.className = 'feedback';
    selectedOption = null;

    q.options.forEach(opt => {
      const div = document.createElement('div');
      div.className = 'option';
      div.textContent = opt;
      div.addEventListener('click', () => {
        if (div.classList.contains('disabled')) return;
        optionsContainer.querySelectorAll('.option').forEach(o => o.classList.remove('selected'));
        div.classList.add('selected');
        selectedOption = opt;
      });
      optionsContainer.appendChild(div);
    });

    submitAnswerBtn.classList.remove('hidden');
    nextQuestionBtn.classList.add('hidden');
  }

  submitAnswerBtn.addEventListener('click', () => {
    if (selectedOption === null) {
      feedback.textContent = 'Please select an option before submitting.';
      feedback.className = 'feedback incorrect-text';
      return;
    }

    const { isCorrect, correctAnswer } = QuizEngine.answerCurrent(selectedOption);

    optionsContainer.querySelectorAll('.option').forEach(div => {
      div.classList.add('disabled');
      if (div.textContent === correctAnswer) {
        div.classList.add('correct');
      } else if (div.textContent === selectedOption && !isCorrect) {
        div.classList.add('incorrect');
      }
    });

    if (isCorrect) {
      feedback.textContent = '✓ Correct!';
      feedback.className = 'feedback correct-text';
    } else {
      feedback.textContent = `✗ Incorrect. Correct answer: ${correctAnswer}`;
      feedback.className = 'feedback incorrect-text';
    }

    scoreDisplay.textContent = `Score: ${QuizEngine.score}`;
    submitAnswerBtn.classList.add('hidden');

    if (QuizEngine.hasNext()) {
      nextQuestionBtn.classList.remove('hidden');
      nextQuestionBtn.textContent = 'Next Question';
    } else {
      nextQuestionBtn.classList.remove('hidden');
      nextQuestionBtn.textContent = 'Finish Quiz';
    }
  });

  nextQuestionBtn.addEventListener('click', () => {
    if (QuizEngine.hasNext()) {
      QuizEngine.goNext();
      renderOneQuestion();
    } else {
      finishQuiz();
    }
  });

  // ============ 5. FULL LIST MODE ============
  function renderFullList() {
    fullListContainer.innerHTML = '';

    QuizEngine.quizQuestions.forEach((q, idx) => {
      const block = document.createElement('div');
      block.className = 'full-question';

      const title = document.createElement('div');
      title.className = 'full-q-title';
      title.textContent = `${idx + 1}. ${q.question}`;
      block.appendChild(title);

      const optionsDiv = document.createElement('div');
      optionsDiv.className = 'options';

      q.options.forEach(opt => {
        const optDiv = document.createElement('div');
        optDiv.className = 'option';
        optDiv.textContent = opt;
        optDiv.dataset.questionIdx = idx;
        optDiv.addEventListener('click', () => {
          optionsDiv.querySelectorAll('.option').forEach(o => o.classList.remove('selected'));
          optDiv.classList.add('selected');
          optDiv.dataset.value = opt;
          block.dataset.selectedAnswer = opt;
        });
        optionsDiv.appendChild(optDiv);
      });

      block.appendChild(optionsDiv);
      fullListContainer.appendChild(block);
    });
  }

  submitFullBtn.addEventListener('click', () => {
    const answersMap = {};
    const blocks = fullListContainer.querySelectorAll('.full-question');
    blocks.forEach((block, idx) => {
      answersMap[idx] = block.dataset.selectedAnswer || null;
    });

    QuizEngine.setAllAnswers(answersMap);
    finishQuiz();
  });

  // ============ 6. RESULT PAGE ============
  function finishQuiz() {
    const result = QuizEngine.getResultSummary(student.name, student.age);
    lastResult = result;
    lastReviewData = QuizEngine.getReviewData();

    // Save to history (without full review to keep storage light)
    Storage.saveResult({
      name: result.name,
      age: result.age,
      score: result.score,
      total: result.total,
      percentage: result.percentage,
      date: result.date
    });

    renderResult(result);
    showScreen('result');
  }

  function renderResult(result) {
    resultSummary.innerHTML = `
      <div class="result-item"><div class="result-label">Name</div><div class="result-value">${escapeHtml(result.name)}</div></div>
      <div class="result-item"><div class="result-label">Age</div><div class="result-value">${escapeHtml(String(result.age))}</div></div>
      <div class="result-item"><div class="result-label">Score</div><div class="result-value">${result.score} / ${result.total}</div></div>
      <div class="result-item"><div class="result-label">Correct</div><div class="result-value">${result.correct}</div></div>
      <div class="result-item"><div class="result-label">Wrong</div><div class="result-value">${result.wrong}</div></div>
      <div class="result-item"><div class="result-label">Percentage</div><div class="result-value">${result.percentage}%</div></div>
    `;
    performanceMsg.textContent = result.message;
    reviewContainer.classList.add('hidden');
    reviewContainer.innerHTML = '';
    reviewBtn.textContent = 'Show Answer Review';
  }

  // ============ 7. ANSWER REVIEW ============
  reviewBtn.addEventListener('click', () => {
    if (reviewContainer.classList.contains('hidden')) {
      renderReview();
      reviewContainer.classList.remove('hidden');
      reviewBtn.textContent = 'Hide Answer Review';
    } else {
      reviewContainer.classList.add('hidden');
      reviewBtn.textContent = 'Show Answer Review';
    }
  });

  function renderReview() {
    reviewContainer.innerHTML = '';
    lastReviewData.forEach((item, idx) => {
      const div = document.createElement('div');
      div.className = 'review-item';
      const resultTag = item.isCorrect
        ? '<span class="tag-correct">✓ Correct</span>'
        : '<span class="tag-incorrect">✗ Incorrect</span>';

      div.innerHTML = `
        <div class="review-q">${idx + 1}. ${escapeHtml(item.question)}</div>
        <div class="review-line">Your Answer: ${escapeHtml(item.yourAnswer || 'Not Answered')}</div>
        <div class="review-line">Correct Answer: ${escapeHtml(item.correctAnswer)}</div>
        <div class="review-line">${resultTag}</div>
      `;
      reviewContainer.appendChild(div);
    });
  }

  // ============ 9. CSV EXPORT ============
  downloadCsvBtn.addEventListener('click', () => {
    if (!lastResult || !lastReviewData) return;
    CSVExporter.download(lastResult, lastReviewData);
  });

  // ============ RESTART ============
  restartBtn.addEventListener('click', () => {
    selectedOption = null;
    showScreen('config');
  });

  // ============ UTILS ============
  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // Preload questions in background
  QuizEngine.loadQuestions().catch(() => {});
});
