// ============================================================
// Shared layout components (server-rendered JSX via Hono)
// ============================================================

export const NavBar = () => (
  <nav class="sticky top-0 z-50 bg-cyber-bg/80 backdrop-blur-md border-b border-cyan-500/20">
    <div class="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
      <a href="/" class="flex items-center gap-3 group">
        <div class="w-10 h-10 rounded-md border border-cyan-400 flex items-center justify-center bg-cyan-500/10 pulse-glow">
          <i class="fa-solid fa-microchip text-cyan-400 text-lg"></i>
        </div>
        <div class="leading-tight">
          <div class="font-orbitron font-bold text-base text-gradient">CS ALI</div>
          <div class="font-orbitron text-[10px] tracking-[0.3em] text-cyan-300/80">FOR SOFTWARE</div>
        </div>
      </a>

      <div class="hidden md:flex items-center gap-8">
        <a href="/" class="nav-link">Home</a>
        <a href="/#catalog" class="nav-link">Catalog</a>
        <a href="/#categories" class="nav-link">Categories</a>
        <a href="/#contact" class="nav-link">Contact</a>
        <a href="/admin" class="nav-link"><i class="fa-solid fa-user-shield mr-1"></i>Admin</a>
      </div>

      <div class="md:hidden">
        <button id="mobile-menu-btn" class="btn-neon-ghost px-3 py-1.5 text-xs" type="button">
          <i class="fa-solid fa-bars"></i>
        </button>
      </div>
    </div>
    <div id="mobile-menu" class="hidden md:hidden border-t border-cyan-500/20 bg-cyber-bg/95">
      <div class="px-4 py-3 flex flex-col gap-3">
        <a href="/" class="nav-link">Home</a>
        <a href="/#catalog" class="nav-link">Catalog</a>
        <a href="/#categories" class="nav-link">Categories</a>
        <a href="/#contact" class="nav-link">Contact</a>
        <a href="/admin" class="nav-link"><i class="fa-solid fa-user-shield mr-1"></i>Admin</a>
      </div>
    </div>
  </nav>
)

export const Footer = () => (
  <footer id="contact" class="relative mt-24 border-t border-cyan-500/20 cyber-grid">
    <div class="max-w-7xl mx-auto px-4 md:px-6 py-16">
      <div class="grid md:grid-cols-3 gap-12">
        {/* Brand */}
        <div>
          <div class="flex items-center gap-3 mb-4">
            <div class="w-10 h-10 rounded-md border border-cyan-400 flex items-center justify-center bg-cyan-500/10">
              <i class="fa-solid fa-microchip text-cyan-400"></i>
            </div>
            <div>
              <div class="font-orbitron font-bold text-lg text-gradient">CS ALI</div>
              <div class="font-orbitron text-[10px] tracking-[0.3em] text-cyan-300/80">FOR SOFTWARE</div>
            </div>
          </div>
          <p class="text-cyber-muted leading-relaxed">
            A futuristic software marketplace by <span class="text-cyan-400 font-semibold">Ali</span>. Discover, download, and elevate your workflow with premium tools.
          </p>
        </div>

        {/* Contact */}
        <div>
          <h3 class="section-title text-cyan-300 text-sm mb-8">Contact</h3>
          <ul class="space-y-3 text-cyber-muted">
            <li class="flex items-center gap-3">
              <i class="fa-solid fa-envelope text-cyan-400 w-5"></i>
              <a href="mailto:alhasanatscali@mail.com" class="hover:text-cyan-300 transition">alhasanatscali@mail.com</a>
            </li>
            <li class="flex items-center gap-3">
              <i class="fa-solid fa-phone text-cyan-400 w-5"></i>
              <a href="tel:+962779519316" class="hover:text-cyan-300 transition">0779519316</a>
            </li>
            <li class="flex items-center gap-3">
              <i class="fa-brands fa-whatsapp text-green-400 w-5"></i>
              <a href="https://wa.me/962779519316" target="_blank" class="hover:text-green-300 transition">WhatsApp Chat</a>
            </li>
          </ul>
        </div>

        {/* Social */}
        <div>
          <h3 class="section-title text-purple-300 text-sm mb-8">Follow</h3>
          <ul class="space-y-3 text-cyber-muted">
            <li class="flex items-center gap-3">
              <i class="fa-brands fa-tiktok text-pink-400 w-5"></i>
              <a href="https://www.tiktok.com/@ali.cs88" target="_blank" class="hover:text-pink-300 transition">@ali.cs88</a>
            </li>
            <li class="flex items-center gap-3">
              <i class="fa-brands fa-instagram text-purple-400 w-5"></i>
              <a href="https://www.instagram.com/alhasanatscali" target="_blank" class="hover:text-purple-300 transition">@alhasanatscali</a>
            </li>
            <li class="flex items-center gap-3">
              <i class="fa-solid fa-shield-halved text-cyan-400 w-5"></i>
              <a href="/admin" class="hover:text-cyan-300 transition">Developer Console</a>
            </li>
          </ul>

          <div class="mt-6 flex gap-3">
            <a href="https://wa.me/962779519316" target="_blank" class="w-10 h-10 rounded-md border border-green-400 flex items-center justify-center text-green-400 hover:bg-green-400 hover:text-cyber-bg transition" title="WhatsApp">
              <i class="fa-brands fa-whatsapp"></i>
            </a>
            <a href="https://www.tiktok.com/@ali.cs88" target="_blank" class="w-10 h-10 rounded-md border border-pink-400 flex items-center justify-center text-pink-400 hover:bg-pink-400 hover:text-cyber-bg transition" title="TikTok">
              <i class="fa-brands fa-tiktok"></i>
            </a>
            <a href="https://www.instagram.com/alhasanatscali" target="_blank" class="w-10 h-10 rounded-md border border-purple-400 flex items-center justify-center text-purple-400 hover:bg-purple-400 hover:text-cyber-bg transition" title="Instagram">
              <i class="fa-brands fa-instagram"></i>
            </a>
            <a href="mailto:alhasanatscali@mail.com" class="w-10 h-10 rounded-md border border-cyan-400 flex items-center justify-center text-cyan-400 hover:bg-cyan-400 hover:text-cyber-bg transition" title="Email">
              <i class="fa-solid fa-envelope"></i>
            </a>
          </div>
        </div>
      </div>

      <div class="mt-12 pt-6 border-t border-cyan-500/10 flex flex-col md:flex-row items-center justify-between gap-4 text-cyber-muted text-sm">
        <div>© <span class="font-orbitron">2026</span> CS Ali for Software · All rights reserved.</div>
        <div class="font-mono-jb text-xs text-cyan-400/70">[ powered by edge :: cloudflare workers ]</div>
      </div>
    </div>
  </footer>
)

export const ScriptTags = ({ extra }: { extra?: string }) => (
  <>
    <script src="/static/app.js"></script>
    {extra && <script src={extra}></script>}
  </>
)
