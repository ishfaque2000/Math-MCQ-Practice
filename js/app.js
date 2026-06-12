// app.js — Main Application Controller

document.addEventListener('DOMContentLoaded', () => {

  // ── ELEMENTS ──────────────────────────────────────────
  const screens = {
    info:     document.getElementById('screen-info'),
    config:   document.getElementById('screen-config'),
    quizOne:  document.getElementById('screen-quiz-one'),
    quizFull: document.getElementById('screen-quiz-full'),
    result:   document.getElementById('screen-result'),
    history:  document.getElementById('screen-history')
  };

  const infoForm         = document.getElementById('infoForm');
  const studentNameInput = document.getElementById('studentName');
  const studentAgeInput  = document.getElementById('studentAge');
  const errName          = document.getElementById('errName');
  const errAge           = document.getElementById('errAge');
  const viewHistoryBtn   = document.getElementById('viewHistoryBtn');

  const configForm        = document.getElementById('configForm');
  const numQuestionsInput = document.getElementById('numQuestions');
  const difficultySelect  = document.getElementById('difficulty');
  const errConfig         = document.getElementById('errConfig');

  const qCounter         = document.getElementById('qCounter');
  const scoreDisplay     = document.getElementById('scoreDisplay');
  const progressFill     = document.getElementById('progressFill');
  const questionText     = document.getElementById('questionText');
  const optionsContainer = document.getElementById('optionsContainer');
  const feedback         = document.getElementById('feedback');
  const submitAnswerBtn  = document.getElementById('submitAnswerBtn');
  const nextQuestionBtn  = document.getElementById('nextQuestionBtn');
  const qMetaRow         = document.getElementById('qMetaRow');

  const fullListContainer = document.getElementById('fullListContainer');
  const submitFullBtn     = document.getElementById('submitFullBtn');

  const resultSummary   = document.getElementById('resultSummary');
  const performanceMsg  = document.getElementById('performanceMsg');
  const gradeCircle     = document.getElementById('gradeCircle');
  const perfBarFill     = document.getElementById('perfBarFill');
  const downloadRcBtn   = document.getElementById('downloadRcBtn');
  const reviewBtn       = document.getElementById('reviewBtn');
  const reviewContainer = document.getElementById('reviewContainer');
  const restartBtn      = document.getElementById('restartBtn');

  const historyContainer = document.getElementById('historyContainer');
  const clearHistoryBtn  = document.getElementById('clearHistoryBtn');
  const darkToggle       = document.getElementById('darkToggle');

  // Timer elements
  const timerArc = document.getElementById('timerArc');
  const timerNum = document.getElementById('timerNum');
  const TIMER_SECS = 30;
  const CIRC = 145.69; // 2π × r(23.18)
  let timerInterval = null;
  let timerRemaining = TIMER_SECS;

  // ── STATE ─────────────────────────────────────────────
  let student       = { name: '', age: '' };
  let selectedOption = null;
  let lastResult    = null;
  let lastReviewData = null;

  // ── PARTICLES ─────────────────────────────────────────
  initParticles();

  function initParticles() {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H, stars = [];

    function resize() {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < 120; i++) {
      stars.push({
        x: Math.random() * 2000, y: Math.random() * 1500,
        r: Math.random() * 1.5 + 0.3,
        o: Math.random() * 0.6 + 0.1,
        speed: Math.random() * 0.3 + 0.05
      });
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      stars.forEach(s => {
        s.y -= s.speed;
        if (s.y < 0) { s.y = H; s.x = Math.random() * W; }
        ctx.beginPath();
        ctx.arc(s.x % W, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200, 200, 255, ${s.o})`;
        ctx.fill();
      });
      requestAnimationFrame(draw);
    }
    draw();
  }

  // ── NAVIGATION ────────────────────────────────────────
  function showScreen(name) {
    Object.values(screens).forEach(s => s.classList.remove('active'));
    screens[name].classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  document.querySelectorAll('[data-back]').forEach(btn => {
    btn.addEventListener('click', () => {
      const map = { 'screen-info': 'info', 'screen-config': 'config' };
      showScreen(map[btn.getAttribute('data-back')] || 'info');
    });
  });

  // ── DARK MODE ─────────────────────────────────────────
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
    const next = Storage.getTheme() === 'dark' ? 'light' : 'dark';
    Storage.setTheme(next);
    applyTheme(next);
  });

  // ── 1. STUDENT INFO ───────────────────────────────────
  infoForm.addEventListener('submit', e => {
    e.preventDefault();
    errName.textContent = '';
    errAge.textContent  = '';

    const name = studentNameInput.value.trim();
    const age  = studentAgeInput.value.trim();
    let valid  = true;

    if (!name) { errName.textContent = 'Name is required.'; valid = false; }
    if (!age || isNaN(age) || Number(age) <= 0) { errAge.textContent = 'Enter a valid age.'; valid = false; }
    if (!valid) return;

    student.name = name;
    student.age  = age;
    showScreen('config');
  });

  // ── HISTORY ───────────────────────────────────────────
  viewHistoryBtn.addEventListener('click', () => {
    renderHistory();
    showScreen('history');
  });

  function renderHistory() {
    const history = Storage.getHistory();
    historyContainer.innerHTML = '';

    if (history.length === 0) {
      historyContainer.innerHTML = '<p class="empty-msg">No previous attempts yet. Start your first quiz!</p>';
      return;
    }

    history.forEach(item => {
      const div = document.createElement('div');
      div.className = 'history-item';
      div.innerHTML = `
        <div>
          <div class="history-name">${escapeHtml(item.name)} <span style="color:var(--text-muted); font-weight:400;">(Age ${escapeHtml(String(item.age))})</span></div>
          <div class="history-meta">${escapeHtml(item.date)}</div>
        </div>
        <div>
          <div class="history-score">${item.score}/${item.total}</div>
          <div style="font-size:0.8rem; color:var(--text-muted); text-align:right;">${item.percentage}% · ${item.grade || ''}</div>
        </div>`;
      historyContainer.appendChild(div);
    });
  }

  clearHistoryBtn.addEventListener('click', () => {
    if (confirm('Clear all quiz history? This cannot be undone.')) {
      Storage.clearHistory();
      renderHistory();
    }
  });

  // ── 2. QUIZ CONFIG ────────────────────────────────────
  configForm.addEventListener('submit', async e => {
    e.preventDefault();
    errConfig.textContent = '';

    const numQuestions = parseInt(numQuestionsInput.value, 10);
    if (isNaN(numQuestions) || numQuestions < 10 || numQuestions > 100) {
      errConfig.textContent = 'Questions must be between 10 and 100.';
      return;
    }

    const mode       = configForm.querySelector('input[name="mode"]:checked').value;
    const difficulty = difficultySelect.value;

    try { await QuizEngine.loadQuestions(); }
    catch(err) { errConfig.textContent = 'Failed to load questions. Check data/questions.json.'; return; }

    QuizEngine.buildQuiz({ numQuestions, mode, difficulty });

    if (QuizEngine.quizQuestions.length === 0) {
      errConfig.textContent = 'No questions found for these filters.';
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

  // ── TIMER ─────────────────────────────────────────────
  function startTimer() {
    stopTimer();
    timerRemaining = TIMER_SECS;
    updateTimerUI(TIMER_SECS);
    timerInterval = setInterval(() => {
      timerRemaining--;
      updateTimerUI(timerRemaining);
      if (timerRemaining <= 0) {
        stopTimer();
        autoSubmit();
      }
    }, 1000);
  }

  function stopTimer() {
    if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
  }

  function updateTimerUI(secs) {
    timerNum.textContent = secs;
    const frac   = secs / TIMER_SECS;
    const offset = CIRC * (1 - frac);
    timerArc.style.strokeDashoffset = offset;

    timerArc.classList.remove('warning', 'danger');
    if (secs <= 5)  timerArc.classList.add('danger');
    else if (secs <= 10) timerArc.classList.add('warning');
  }

  function autoSubmit() {
    // Auto-submit with whatever is selected (or blank/null)
    if (submitAnswerBtn.classList.contains('hidden')) return; // already submitted
    const { isCorrect, correctAnswer } = QuizEngine.answerCurrent(selectedOption);

    optionsContainer.querySelectorAll('.option').forEach(div => {
      div.classList.add('disabled');
      const optText = div.querySelector('.opt-text')?.textContent;
      if (optText === correctAnswer) div.classList.add('correct');
      else if (optText === selectedOption && !isCorrect) div.classList.add('incorrect');
    });

    if (selectedOption === null) {
      feedback.textContent = '⏱ Time\'s up! No answer selected.';
      feedback.className = 'feedback incorrect-text';
    } else if (isCorrect) {
      feedback.textContent = '✓ Correct!';
      feedback.className = 'feedback correct-text';
    } else {
      feedback.textContent = `✗ Time's up! Correct answer: ${correctAnswer}`;
      feedback.className = 'feedback incorrect-text';
    }

    scoreDisplay.textContent = `Score: ${QuizEngine.score}`;
    submitAnswerBtn.classList.add('hidden');
    nextQuestionBtn.classList.remove('hidden');
    nextQuestionBtn.textContent = QuizEngine.hasNext() ? 'Next Question →' : 'See Results';
  }

  // ── 3. ONE QUESTION MODE ──────────────────────────────
  function renderOneQuestion() {
    const q     = QuizEngine.getCurrentQuestion();
    const total = QuizEngine.quizQuestions.length;

    qCounter.textContent       = `Q ${QuizEngine.currentIndex + 1} / ${total}`;
    scoreDisplay.textContent   = `Score: ${QuizEngine.score}`;
    progressFill.style.width   = `${QuizEngine.getProgressPercent()}%`;
    questionText.textContent   = q.question;
    optionsContainer.innerHTML = '';
    feedback.textContent       = '';
    feedback.className         = 'feedback';
    selectedOption             = null;

    // Difficulty + topic badges
    if (qMetaRow) {
      const diffClass = { Easy: 'badge-easy', Medium: 'badge-medium', Hard: 'badge-hard' }[q.difficulty] || 'badge-easy';
      qMetaRow.innerHTML = `
        <span class="badge badge-topic">${escapeHtml(q.topic)}</span>
        <span class="badge ${diffClass}">${escapeHtml(q.difficulty)}</span>`;
    }

    const letters = ['A', 'B', 'C', 'D', 'E'];
    q.options.forEach((opt, i) => {
      const div        = document.createElement('div');
      div.className    = 'option';
      div.innerHTML    = `<span class="opt-letter">${letters[i] || i + 1}</span><span class="opt-text">${escapeHtml(opt)}</span>`;
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
    startTimer();
  }

  submitAnswerBtn.addEventListener('click', () => {
    if (selectedOption === null) {
      feedback.textContent = 'Please select an answer first.';
      feedback.className   = 'feedback incorrect-text';
      return;
    }
    stopTimer();

    const { isCorrect, correctAnswer } = QuizEngine.answerCurrent(selectedOption);

    optionsContainer.querySelectorAll('.option').forEach(div => {
      div.classList.add('disabled');
      const optText = div.querySelector('.opt-text')?.textContent;
      if (optText === correctAnswer) div.classList.add('correct');
      else if (optText === selectedOption && !isCorrect) div.classList.add('incorrect');
    });

    feedback.textContent = isCorrect ? '✓ Correct!' : `✗ Incorrect. Answer: ${correctAnswer}`;
    feedback.className   = isCorrect ? 'feedback correct-text' : 'feedback incorrect-text';
    scoreDisplay.textContent = `Score: ${QuizEngine.score}`;
    submitAnswerBtn.classList.add('hidden');
    nextQuestionBtn.classList.remove('hidden');
    nextQuestionBtn.textContent = QuizEngine.hasNext() ? 'Next Question →' : 'See Results';
  });

  nextQuestionBtn.addEventListener('click', () => {
    stopTimer();
    if (QuizEngine.hasNext()) {
      QuizEngine.goNext();
      renderOneQuestion();
    } else {
      finishQuiz();
    }
  });

  // ── 5. FULL LIST MODE ─────────────────────────────────
  function renderFullList() {
    fullListContainer.innerHTML = '';
    const letters = ['A', 'B', 'C', 'D', 'E'];

    QuizEngine.quizQuestions.forEach((q, idx) => {
      const block   = document.createElement('div');
      block.className = 'full-question';

      const diffClass = { Easy: 'badge-easy', Medium: 'badge-medium', Hard: 'badge-hard' }[q.difficulty] || 'badge-easy';
      const metaBadges = `<span class="badge badge-topic" style="margin-right:6px;">${escapeHtml(q.topic)}</span><span class="badge ${diffClass}">${escapeHtml(q.difficulty)}</span>`;

      block.innerHTML = `<div style="margin-bottom:8px;">${metaBadges}</div><div class="full-q-title">${idx + 1}. ${escapeHtml(q.question)}</div>`;

      const optionsDiv     = document.createElement('div');
      optionsDiv.className = 'options';

      q.options.forEach((opt, i) => {
        const optDiv        = document.createElement('div');
        optDiv.className    = 'option';
        optDiv.innerHTML    = `<span class="opt-letter">${letters[i] || i + 1}</span><span class="opt-text">${escapeHtml(opt)}</span>`;
        optDiv.addEventListener('click', () => {
          optionsDiv.querySelectorAll('.option').forEach(o => o.classList.remove('selected'));
          optDiv.classList.add('selected');
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
    fullListContainer.querySelectorAll('.full-question').forEach((block, idx) => {
      answersMap[idx] = block.dataset.selectedAnswer || null;
    });
    QuizEngine.setAllAnswers(answersMap);
    finishQuiz();
  });

  // ── 6. RESULT ─────────────────────────────────────────
  function finishQuiz() {
    stopTimer();
    const result = QuizEngine.getResultSummary(student.name, student.age);
    lastResult   = result;
    lastReviewData = QuizEngine.getReviewData();

    Storage.saveResult({
      name: result.name, age: result.age,
      score: result.score, total: result.total,
      percentage: result.percentage,
      grade: result.grade,
      date: result.date
    });

    renderResult(result);
    showScreen('result');
  }

  function renderResult(result) {
    // Grade circle
    gradeCircle.className = `grade-circle ${result.gradeClass}`;
    gradeCircle.innerHTML = `<div class="grade-letter">${result.grade}</div>`;

    // Stats grid
    resultSummary.innerHTML = `
      <div class="result-item"><div class="result-label">Score</div><div class="result-value">${result.score}/${result.total}</div></div>
      <div class="result-item"><div class="result-label">Correct</div><div class="result-value" style="color:var(--star-mint);">${result.correct}</div></div>
      <div class="result-item"><div class="result-label">Wrong</div><div class="result-value" style="color:var(--pulsar-red);">${result.wrong}</div></div>
      <div class="result-item"><div class="result-label">Accuracy</div><div class="result-value">${result.percentage}%</div></div>`;

    performanceMsg.textContent = result.message;

    // Animate performance bar
    setTimeout(() => { perfBarFill.style.width = `${result.percentage}%`; }, 100);

    reviewContainer.classList.add('hidden');
    reviewContainer.innerHTML = '';
    reviewBtn.textContent = 'Show Answer Review';
  }

  // ── 7. ANSWER REVIEW ──────────────────────────────────
  reviewBtn.addEventListener('click', () => {
    if (reviewContainer.classList.contains('hidden')) {
      renderReview();
      reviewContainer.classList.remove('hidden');
      reviewBtn.textContent = 'Hide Review';
    } else {
      reviewContainer.classList.add('hidden');
      reviewBtn.textContent = 'Show Answer Review';
    }
  });

  function renderReview() {
    reviewContainer.innerHTML = '';
    lastReviewData.forEach((item, idx) => {
      const div       = document.createElement('div');
      div.className   = `review-item ${item.isCorrect ? 'correct-item' : 'incorrect-item'}`;
      const tag       = item.isCorrect
        ? '<span class="tag-correct">✓ Correct</span>'
        : '<span class="tag-incorrect">✗ Incorrect</span>';
      div.innerHTML   = `
        <div class="review-q">${idx + 1}. ${escapeHtml(item.question)}</div>
        <div class="review-line">Your answer: <strong>${escapeHtml(item.yourAnswer || 'Not answered')}</strong></div>
        <div class="review-line">Correct answer: <strong style="color:var(--star-mint);">${escapeHtml(item.correctAnswer)}</strong></div>
        <div class="review-line" style="margin-top:6px;">${tag}</div>`;
      reviewContainer.appendChild(div);
    });
  }

  // ── REPORT CARD DOWNLOAD ──────────────────────────────
  downloadRcBtn.addEventListener('click', () => {
    if (!lastResult || !lastReviewData) return;
    ReportCard.download(lastResult, lastReviewData);
  });

  // ── RESTART ───────────────────────────────────────────
  restartBtn.addEventListener('click', () => {
    selectedOption = null;
    showScreen('config');
  });

  // ── UTILS ─────────────────────────────────────────────
  function escapeHtml(str) {
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  // Preload questions
  QuizEngine.loadQuestions().catch(() => {});
});
