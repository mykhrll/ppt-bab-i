const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const renderIcons = () => window.lucide?.createIcons?.();

document.addEventListener('DOMContentLoaded', () => {
  renderIcons();

  const slides = $$('.slide');
  const progress = $('#progressBar');
  const count = $('#slideCount');
  const previous = $('#prevButton');
  const next = $('#nextButton');
  let current = 0;

  function showSlide(index) {
    current = Math.max(0, Math.min(slides.length - 1, index));
    slides.forEach((slide, i) => slide.classList.toggle('active', i === current));
    progress.style.width = `${((current + 1) / slides.length) * 100}%`;
    count.textContent = `${current + 1} / ${slides.length}`;
    previous.disabled = current === 0;
    next.disabled = current === slides.length - 1;
    slides[current]?.scrollTo(0, 0);
  }

  previous.addEventListener('click', () => showSlide(current - 1));
  next.addEventListener('click', () => showSlide(current + 1));
  $('#startButton').addEventListener('click', () => showSlide(1));
  $('#conceptButton').addEventListener('click', () => showSlide(3));
  document.addEventListener('keydown', event => {
    if (event.target.matches('textarea, input, button, a')) return;
    if (event.key === 'ArrowRight') showSlide(current + 1);
    if (event.key === 'ArrowLeft') showSlide(current - 1);
  });

  const fullscreen = $('#fullscreenToggle');
  fullscreen.addEventListener('click', async () => {
    if (!document.fullscreenElement) await document.documentElement.requestFullscreen?.();
    else await document.exitFullscreen?.();
  });
  document.addEventListener('fullscreenchange', () => {
    const isFullscreen = Boolean(document.fullscreenElement);
    fullscreen.innerHTML = `<i data-lucide="${isFullscreen ? 'minimize' : 'maximize'}" width="18" height="18"></i>`;
    fullscreen.setAttribute('aria-label', isFullscreen ? 'Keluar layar penuh' : 'Layar penuh');
    renderIcons();
  });

  let remaining = 15 * 60;
  let timer = null;
  const timerDisplay = $('#timerDisplay');
  const timerButton = $('#timerToggle');
  const drawTimer = () => {
    timerDisplay.textContent = `${String(Math.floor(remaining / 60)).padStart(2, '0')}:${String(remaining % 60).padStart(2, '0')}`;
  };
  timerButton.addEventListener('click', () => {
    if (timer) {
      clearInterval(timer); timer = null;
      timerButton.innerHTML = '<i data-lucide="play" width="16" height="16"></i>';
      timerDisplay.classList.remove('timer-run');
    } else {
      timerButton.innerHTML = '<i data-lucide="pause" width="16" height="16"></i>';
      timerDisplay.classList.add('timer-run');
      timer = setInterval(() => {
        if (remaining > 0) { remaining--; drawTimer(); }
        else {
          clearInterval(timer); timer = null;
          timerButton.innerHTML = '<i data-lucide="play" width="16" height="16"></i>';
          timerDisplay.classList.remove('timer-run');
        }
        renderIcons();
      }, 1000);
    }
    renderIcons();
  });
  drawTimer();

  $('#runCheck').addEventListener('click', () => {
    const steps = ['checkClaim', 'checkSource', 'checkEvidence'].map(id => $('#' + id));
    const feedback = $('#checkFeedback');
    feedback.hidden = true;
    steps.forEach(step => step.classList.remove('active-flow'));
    steps.forEach((step, index) => setTimeout(() => {
      step.classList.add('active-flow');
      if (index === steps.length - 1) feedback.hidden = false;
    }, index * 550));
  });

  const questions = $$('.question');
  const quizFeedback = $('#quizFeedback');
  const scoreButton = $('#showScore');
  const scoreBox = $('#scoreBox');
  let answers = Array(questions.length).fill(null);
  let questionIndex = 0;

  function resetQuiz() {
    answers = Array(questions.length).fill(null);
    questionIndex = 0;
    scoreButton.disabled = true;
    questions.forEach((question, i) => {
      question.classList.toggle('active-q', i === 0);
      $$('.answer', question).forEach(button => {
        button.disabled = false;
        button.classList.remove('correct', 'wrong');
      });
    });
    quizFeedback.hidden = true;
    scoreBox.classList.remove('show');
    $('#scoreText').textContent = '';
    $('#followUp').textContent = '';
  }

  $$('.answer').forEach(button => button.addEventListener('click', () => {
    if (answers[questionIndex] !== null) return;
    const isCorrect = button.dataset.correct === 'true';
    answers[questionIndex] = isCorrect;
    button.classList.add(isCorrect ? 'correct' : 'wrong');
    $$('.answer', questions[questionIndex]).forEach(option => {
      option.disabled = true;
      if (option.dataset.correct === 'true') option.classList.add('correct');
    });
    quizFeedback.hidden = false;
    quizFeedback.textContent = isCorrect ? 'Benar! Lanjut ke soal berikutnya.' : 'Belum tepat. Perhatikan jawaban yang diberi tanda hijau.';
    quizFeedback.className = `feedback ${isCorrect ? 'good' : 'warn'}`;
    scoreButton.disabled = answers.some(answer => answer === null);
    const answeredIndex = questionIndex;
    setTimeout(() => {
      if (answeredIndex < questions.length - 1) {
        questions[answeredIndex].classList.remove('active-q');
        questionIndex = answeredIndex + 1;
        questions[questionIndex].classList.add('active-q');
        quizFeedback.hidden = true;
      }
    }, 700);
  }));

  scoreButton.addEventListener('click', () => {
    if (answers.some(answer => answer === null)) return;
    const score = answers.filter(Boolean).length;
    scoreBox.classList.add('show');
    $('#scoreText').textContent = `Skor: ${score}/${questions.length} (${score} jawaban benar)`;
    $('#followUp').textContent = score === questions.length
      ? 'Hebat. Terapkan langkah pemeriksaan ini pada informasi yang kamu temui.'
      : score >= 2 ? 'Baca ulang lima aspek CRAAP dan urutan membaca lateral.'
      : 'Ulangi materi sumber, bukti, dan simpulan bersama guru.';
    scoreBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });
  $('#resetQuiz').addEventListener('click', resetQuiz);

  showSlide(0);
});
