import { jsxRenderer } from 'hono/jsx-renderer'

export const renderer = jsxRenderer(({ children, title }: any) => {
  return (
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{title || 'CS Ali for Software — Cyberpunk Software Store'}</title>
        <meta name="description" content="CS Ali for Software — futuristic software marketplace by Ali. Download free and premium tools." />
        {/* Inline SVG favicon — neon chip icon */}
        <link rel="icon" type="image/svg+xml" href={'data:image/svg+xml;utf8,' +
          encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="10" fill="#0a0a12"/><rect x="14" y="14" width="36" height="36" rx="4" fill="none" stroke="#00f0ff" stroke-width="3"/><text x="32" y="42" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="22" fill="#b026ff">A</text></svg>')
        } />

        {/* Tailwind */}
        <script src="https://cdn.tailwindcss.com"></script>
        {/* Font Awesome icons */}
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.5.1/css/all.min.css" rel="stylesheet" />
        {/* Google Fonts — Orbitron + Rajdhani for cyberpunk vibe */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@500;700;900&family=Rajdhani:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet" />
        {/* Custom stylesheet */}
        <link href="/static/style.css" rel="stylesheet" />
        {/* Axios */}
        <script src="https://cdn.jsdelivr.net/npm/axios@1.7.2/dist/axios.min.js"></script>
      </head>
      <body class="bg-cyber-bg text-cyber-text font-rajdhani min-h-screen">
        {children}
      </body>
    </html>
  )
})
