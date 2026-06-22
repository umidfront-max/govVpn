/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0C1220',
        bg2: '#0F1726',
        panel: '#141D30',
        panel2: '#19233A',
        line: '#243047',
        lineSoft: '#1C2741',
        txt: '#E7ECF6',
        txt2: '#94A0B8',
        txt3: '#5F6B85',
        users: '#5AA9E6',
        sessions: '#4FC3D9',
        servers: '#46CBA2',
        pay: '#6F86E0',
        sites: '#54C0E6',
        accent: '#54C0E6',
        ok: '#46CBA2',
        warn: '#F5984B',
        err: '#F2706B',
      },
      fontFamily: {
        disp: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      screens: {
        nav: '860px',
      },
    },
  },
  plugins: [],
}
