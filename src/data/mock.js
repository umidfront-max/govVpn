import { rnd, pick, daysAgo, tStr } from '@/utils/format'

export const AVC = ['#5AA9E6', '#4FC3D9', '#46CBA2', '#54C0E6', '#6F86E0', '#7C8CF8', '#5BC0BE']

const firstN = [
  'Ali', 'Diyor', 'Sardor', 'Madina', 'Jasur', 'Nodira', 'Otabek', 'Kamola', 'Bekzod', 'Laylo',
  'Rustam', 'Ozoda', 'Aziz', 'Dilnoza', 'Ravshan', 'Sevara', 'Bobur', 'Malika', 'Akmal', 'Gulnoza',
]
const lastN = [
  'Karimov', 'Yusupova', 'Tashkenov', 'Rahimov', 'Aliyeva', 'Nazarov', 'Saidova', 'Ergashev',
  'Mirzaev', 'Tursunova',
]

export const BLOCK_REASONS = [
  'Нарушение правил использования',
  'Подозрение на мошенничество',
  'Спам / злоупотребление трафиком',
  'Неоплаченная подписка',
  'Запрос пользователя',
]

const PLANS = ['Free', 'Free', 'Pro', 'Pro', 'Premium']
const DEVTYPES = [
  ['Android', 'phone'],
  ['iPhone', 'phone'],
  ['Windows', 'desktop'],
  ['macOS', 'desktop'],
  ['Router', 'router'],
  ['Linux', 'desktop'],
]

const SERVERS_BASE = [
  { n: 'nl-amsterdam-1', c: '🇳🇱', lo: 'Amsterdam, NL', reg: 'Europe', cap: 2000 },
  { n: 'de-frankfurt-2', c: '🇩🇪', lo: 'Frankfurt, DE', reg: 'Europe', cap: 2000 },
  { n: 'tr-istanbul-1', c: '🇹🇷', lo: 'Istanbul, TR', reg: 'Europe', cap: 1000 },
  { n: 'sg-singapore-1', c: '🇸🇬', lo: 'Singapore, SG', reg: 'Asia', cap: 1500 },
  { n: 'jp-tokyo-3', c: '🇯🇵', lo: 'Tokyo, JP', reg: 'Asia', cap: 1500 },
  { n: 'us-newyork-2', c: '🇺🇸', lo: 'New York, US', reg: 'America', cap: 2000 },
  { n: 'us-losangeles-1', c: '🇺🇸', lo: 'Los Angeles, US', reg: 'America', cap: 1000 },
  { n: 'kz-almaty-1', c: '🇰🇿', lo: 'Almaty, KZ', reg: 'Asia', cap: 1000 },
]

export const ERRTYPES = ['AUTH_FAIL', 'TIMEOUT', 'HANDSHAKE', 'DNS', 'OVERLOAD']
export const ERRMSG = {
  AUTH_FAIL: 'Неверный токен авторизации',
  TIMEOUT: 'Превышено время ожидания узла',
  HANDSHAKE: 'Сбой TLS-рукопожатия',
  DNS: 'Не удалось разрешить DNS',
  OVERLOAD: 'Узел перегружен, отказ соединения',
}

export const PAYMETHODS = ['Click', 'Payme', 'Uzcard', 'Humo', 'Visa']
export const PAYPLANS = ['Pro · мес', 'Pro · год', 'Premium · мес', 'Premium · год']
const PAYPRICE = {
  'Pro · мес': 35000,
  'Pro · год': 336000,
  'Premium · мес': 59000,
  'Premium · год': 566000,
}
const PAYSTAT = ['paid', 'paid', 'paid', 'paid', 'pending', 'failed', 'refund']

export function makeServers() {
  return SERVERS_BASE.map((s, i) => {
    const st = i === 2 ? 'degraded' : i === 6 ? 'offline' : 'online'
    const conns = st === 'offline' ? 0 : rnd(180, 920)
    const load =
      st === 'offline'
        ? 0
        : rnd(Math.round(s.cap * 0.12), Math.round(s.cap * (st === 'degraded' ? 0.92 : 0.78)))
    const upDays = st === 'offline' ? 0 : rnd(3, 210)
    return {
      ...s,
      id: 'srv-' + (i + 1),
      ip: '185.' + rnd(10, 250) + '.' + rnd(1, 250) + '.' + rnd(1, 250),
      status: st,
      conns,
      load, // текущая нагрузка, Mbps
      upDays,
      upPct: st === 'offline' ? 0 : +(99 + Math.random()).toFixed(2),
    }
  })
}

export function makeUsers(servers) {
  return Array.from({ length: 138 }, (_, i) => {
    const fn = pick(firstN)
    const ln = pick(lastN)
    const reg = daysAgo(rnd(0, 120))
    const ndev = rnd(1, 4)
    const blocked = Math.random() < 0.13
    return {
      id: 'U-' + (10240 + i),
      name: fn + ' ' + ln,
      email: (fn + '.' + ln).toLowerCase().replace(/[^a-z.]/g, '') + '@mail.uz',
      plan: pick(PLANS),
      reg,
      last: daysAgo(rnd(0, 9)),
      status: blocked ? 'blocked' : 'active',
      blockReason: blocked ? pick(BLOCK_REASONS) : null,
      blockedAt: blocked ? tStr(daysAgo(rnd(0, 40))) : null,
      av: pick(AVC),
      devices: Array.from({ length: ndev }, () => {
        const d = pick(DEVTYPES)
        return {
          name: d[0] + ' · ' + pick(['Chrome', 'GoVPN App', 'Safari', 'Edge']),
          type: d[1],
          last: tStr(daysAgo(rnd(0, 5))),
        }
      }),
      history: Array.from({ length: rnd(4, 8) }, () => ({
        srv: pick(servers).n,
        ip: rnd(11, 250) + '.' + rnd(1, 250) + '.' + rnd(1, 250) + '.' + rnd(1, 250),
        at: tStr(daysAgo(rnd(0, 14))),
        dur: rnd(3, 420),
      })),
    }
  })
}

export function makeErrors(servers, users) {
  return Array.from({ length: 50 }, () => {
    const t = pick(ERRTYPES)
    return {
      time: new Date(Date.now() - rnd(0, 86400000)),
      type: t,
      srv: pick(servers).n,
      user: pick(users).id,
      msg: ERRMSG[t],
      lvl: t === 'OVERLOAD' || t === 'DNS' ? 'warn' : 'error',
    }
  }).sort((a, b) => b.time - a.time)
}

export function makePayments(users) {
  return Array.from({ length: 55 }, (_, i) => {
    const u = pick(users)
    const pl = pick(PAYPLANS)
    return {
      id: 'TX-' + (50210 + i),
      user: u.name,
      uid: u.id,
      plan: pl,
      method: pick(PAYMETHODS),
      amount: PAYPRICE[pl],
      date: daysAgo(rnd(0, 20)),
      status: pick(PAYSTAT),
    }
  }).sort((a, b) => b.date - a.date)
}

// Агрегированная статистика по платформам устройств: какая используется чаще.
export function makeDevices(users) {
  const map = {}
  for (const u of users) {
    for (const d of u.devices) {
      const os = d.name.split(' · ')[0]
      if (!map[os]) map[os] = { os, type: d.type, devices: 0, users: new Set(), sessions: 0 }
      map[os].devices++
      map[os].users.add(u.id)
      map[os].sessions += rnd(18, 240)
    }
  }
  return Object.values(map)
    .map((x) => ({
      os: x.os,
      type: x.type,
      devices: x.devices,
      users: x.users.size,
      sessions: x.sessions,
      traffic: +((x.sessions * rnd(40, 160)) / 1000).toFixed(1),
      last: tStr(daysAgo(rnd(0, 2))),
    }))
    .sort((a, b) => b.devices - a.devices)
}
