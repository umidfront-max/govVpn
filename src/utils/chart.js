import Chart from 'chart.js/auto'

// Глобальные настройки — применяются один раз при импорте модуля.
Chart.defaults.color = '#5F6B85'
Chart.defaults.font.family = "'Inter', sans-serif"
Chart.defaults.font.size = 11

// Вертикальный градиент под линейными графиками.
export function ctxGrad(hex, h = 240) {
  const c = document.createElement('canvas').getContext('2d')
  const g = c.createLinearGradient(0, 0, 0, h)
  g.addColorStop(0, hex + '55')
  g.addColorStop(1, hex + '00')
  return g
}

export function lineOpts(legend = false) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: !!legend,
        labels: { boxWidth: 10, boxHeight: 10, usePointStyle: true, padding: 14 },
      },
    },
    scales: {
      x: { grid: { color: '#1C2741' }, ticks: { maxTicksLimit: 12 } },
      y: { grid: { color: '#1C2741' }, beginAtZero: true },
    },
  }
}

export function barOpts() {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false } },
      y: { grid: { color: '#1C2741' }, beginAtZero: true },
    },
  }
}

export { Chart }
