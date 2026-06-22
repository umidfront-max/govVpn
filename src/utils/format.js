export const rnd = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a
export const pick = (a) => a[rnd(0, a.length - 1)]
export const fmt = (n) => n.toLocaleString('ru-RU')

export const daysAgo = (d) => {
  const t = new Date()
  t.setDate(t.getDate() - d)
  return t
}

export const dStr = (dt) =>
  dt.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })

export const tStr = (dt) =>
  dt.toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })

// Длительность в минутах -> «1 ч 23 мин»
export const durStr = (min) => {
  const h = Math.floor(min / 60)
  const m = min % 60
  return h ? `${h} ч${m ? ' ' + m + ' мин' : ''}` : `${m} мин`
}

// Инициалы из имени -> «AB»
export const ini = (name) =>
  name
    .split(' ')
    .map((x) => x[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

export const PERIOD_WORD = { day: 'за день', week: 'за неделю', month: 'за месяц' }
export const PERIOD_MULT = { day: 1, week: 6.8, month: 28 }
