// Temporary learning adapter used only while an assigned backend/communication task is unfinished.
// It preserves the same JSON contracts as the ASP.NET Core API, so UI work can continue independently.
// Do not copy this file into the final shared repository as a production implementation.

const user = { id: 1, displayName: 'Demo Wizard', email: 'demo@wizard.local', totalXp: 350 }

const seedQuestions = [
  {
    id: 11,
    text: 'What is the main purpose of regression testing?',
    explanation: 'Regression tests check that existing behaviour still works after a change.',
    order: 1,
    answerOptions: [
      { id: 111, text: 'Protect existing behaviour after changes', isCorrect: true },
      { id: 112, text: 'Replace all integration tests', isCorrect: false },
      { id: 113, text: 'Measure network speed', isCorrect: false }
    ]
  },
  {
    id: 12,
    text: 'What does a unit test normally verify?',
    explanation: 'A unit test checks a small isolated part of the program.',
    order: 2,
    answerOptions: [
      { id: 121, text: 'The entire production environment', isCorrect: false },
      { id: 122, text: 'A small isolated code unit', isCorrect: true },
      { id: 123, text: 'Only the visual design', isCorrect: false }
    ]
  },
  {
    id: 13,
    text: 'What does integration testing examine?',
    explanation: 'Integration tests examine how components work together.',
    order: 3,
    answerOptions: [
      { id: 131, text: 'How components work together', isCorrect: true },
      { id: 132, text: 'Only individual variables', isCorrect: false },
      { id: 133, text: 'The project budget', isCorrect: false }
    ]
  }
]

let nextQuizId = 2
let nextAttemptId = 1
let signedIn = true
let quizzes = [{
  id: 1,
  ownerId: 1,
  ownerName: user.displayName,
  title: 'The Regression Dragon',
  description: 'Practice unit, integration and regression testing.',
  topic: 'Software Testing',
  isPublished: true,
  startingHp: 100,
  mistakeDamage: 20,
  bossFightEnabled: true,
  bossName: 'Regression Dragon',
  bossHp: 300,
  bossDamagePerStreak: 100,
  questions: structuredClone(seedQuestions)
}]
const attempts = new Map()
const history = []

const wait = value => new Promise(resolve => setTimeout(() => resolve(structuredClone(value)), 120))
const summary = quiz => ({
  id: quiz.id,
  title: quiz.title,
  description: quiz.description,
  topic: quiz.topic,
  ownerName: quiz.ownerName,
  isPublished: quiz.isPublished,
  bossFightEnabled: quiz.bossFightEnabled,
  questionCount: quiz.questions.length
})

function questionFor(attempt, quiz) {
  if (attempt.status !== 'Active') return null
  const q = quiz.questions[attempt.currentQuestionIndex % quiz.questions.length]
  return { id: q.id, text: q.text, answerOptions: q.answerOptions.map(({ id, text }) => ({ id, text })) }
}

function stateFor(attempt, quiz) {
  return {
    attemptId: attempt.id,
    quizTitle: quiz.title,
    playerHp: attempt.playerHp,
    playerMaxHp: quiz.startingHp,
    bossHp: attempt.bossHp,
    bossMaxHp: quiz.bossHp,
    isBossPhase: attempt.isBossPhase,
    correctStreak: attempt.correctStreak,
    score: attempt.score,
    status: attempt.status,
    question: questionFor(attempt, quiz)
  }
}

function body(options) {
  return options.body ? JSON.parse(options.body) : {}
}

function saveQuiz(payload, existing = {}) {
  const id = existing.id ?? nextQuizId++
  let optionId = id * 1000
  return {
    ...existing,
    ...payload,
    id,
    ownerId: 1,
    ownerName: user.displayName,
    questions: payload.questions.map((question, index) => ({
      ...question,
      id: question.id || id * 100 + index + 1,
      order: index + 1,
      answerOptions: question.answerOptions.map(option => ({ ...option, id: option.id || ++optionId }))
    }))
  }
}

export async function mockApi(path, options = {}) {
  const method = options.method || 'GET'

  if (path === '/auth/me') {
    if (!signedIn) throw new Error('Not authenticated')
    return wait(user)
  }
  if (path === '/auth/login' || path === '/auth/register') {
    signedIn = true
    const values = body(options)
    if (values.displayName) user.displayName = values.displayName
    if (values.email) user.email = values.email
    return wait(user)
  }
  if (path === '/auth/logout') { signedIn = false; return wait(null) }

  if (path === '/quizzes' && method === 'GET') return wait(quizzes.filter(q => q.isPublished).map(summary))
  if (path === '/quizzes/mine') return wait(quizzes.filter(q => q.ownerId === 1).map(summary))
  if (path === '/quizzes' && method === 'POST') {
    const quiz = saveQuiz(body(options))
    quizzes.push(quiz)
    return wait(quiz)
  }
  const quizMatch = path.match(/^\/quizzes\/(\d+)$/)
  if (quizMatch) {
    const id = Number(quizMatch[1])
    const quiz = quizzes.find(item => item.id === id)
    if (!quiz) throw new Error('Quiz not found')
    if (method === 'GET') return wait(quiz)
    if (method === 'PUT') {
      const updated = saveQuiz(body(options), quiz)
      quizzes = quizzes.map(item => item.id === id ? updated : item)
      return wait(updated)
    }
    if (method === 'DELETE') { quizzes = quizzes.filter(item => item.id !== id); return wait(null) }
  }

  if (path === '/game/attempts' && method === 'POST') {
    const quiz = quizzes.find(item => item.id === body(options).quizId)
    if (!quiz) throw new Error('Quiz not found')
    const attempt = { id: nextAttemptId++, quizId: quiz.id, playerHp: quiz.startingHp, bossHp: quiz.bossFightEnabled ? quiz.bossHp : null, isBossPhase: false, currentQuestionIndex: 0, correctStreak: 0, score: 0, status: 'Active', startedAt: new Date().toISOString() }
    attempts.set(attempt.id, attempt)
    return wait(stateFor(attempt, quiz))
  }
  const stateMatch = path.match(/^\/game\/attempts\/(\d+)$/)
  if (stateMatch && method === 'GET') {
    const attempt = attempts.get(Number(stateMatch[1]))
    const quiz = attempt && quizzes.find(item => item.id === attempt.quizId)
    if (!attempt || !quiz) throw new Error('Attempt not found')
    return wait(stateFor(attempt, quiz))
  }
  const answerMatch = path.match(/^\/game\/attempts\/(\d+)\/answers$/)
  if (answerMatch && method === 'POST') {
    const attempt = attempts.get(Number(answerMatch[1]))
    const quiz = attempt && quizzes.find(item => item.id === attempt.quizId)
    if (!attempt || !quiz) throw new Error('Attempt not found')
    const question = quiz.questions[attempt.currentQuestionIndex % quiz.questions.length]
    const selected = question.answerOptions.find(option => option.id === body(options).answerOptionId)
    const correct = question.answerOptions.find(option => option.isCorrect)
    if (!selected) throw new Error('Answer option not found')
    if (selected.isCorrect) {
      attempt.score += 100
      attempt.correctStreak += 1
      if (attempt.isBossPhase && attempt.correctStreak >= 3) {
        attempt.bossHp = Math.max(0, attempt.bossHp - quiz.bossDamagePerStreak)
        attempt.correctStreak = 0
      }
    } else {
      attempt.score = Math.max(0, attempt.score - 25)
      attempt.playerHp = Math.max(0, attempt.playerHp - quiz.mistakeDamage)
      attempt.correctStreak = 0
    }
    attempt.currentQuestionIndex += 1
    if (attempt.playerHp <= 0) attempt.status = 'Lost'
    else if (attempt.isBossPhase && attempt.bossHp <= 0) attempt.status = 'Won'
    else if (!attempt.isBossPhase && attempt.currentQuestionIndex >= quiz.questions.length) {
      if (quiz.bossFightEnabled) { attempt.isBossPhase = true; attempt.currentQuestionIndex = 0; attempt.correctStreak = 0 }
      else attempt.status = 'Completed'
    }
    if (attempt.status !== 'Active') {
      history.unshift({ attemptId: attempt.id, quizTitle: quiz.title, status: attempt.status, score: attempt.score, startedAt: attempt.startedAt, completedAt: new Date().toISOString() })
      if (attempt.status === 'Won' || attempt.status === 'Completed') user.totalXp += attempt.score
    }
    return wait({ isCorrect: selected.isCorrect, correctAnswerOptionId: correct.id, explanation: question.explanation, playerHp: attempt.playerHp, bossHp: attempt.bossHp, isBossPhase: attempt.isBossPhase, correctStreak: attempt.correctStreak, score: attempt.score, status: attempt.status })
  }

  if (path === '/progress') {
    const completed = history.filter(item => item.status === 'Won' || item.status === 'Completed')
    return wait({ totalXp: user.totalXp, quizzesCompleted: completed.length, bossesDefeated: history.filter(item => item.status === 'Won').length, questionsAnswered: 12, correctAnswers: 9, accuracy: 75 })
  }
  if (path === '/progress/history') return wait(history)
  if (path === '/progress/leaderboard') return wait([user, { id: 2, displayName: 'Ada Spellcraft', totalXp: 290 }])

  throw new Error(`Mock route not implemented: ${method} ${path}`)
}
