// ============================================================
// CS Ali for Software — Main Application Entry
// ============================================================

import { Hono } from 'hono'
import { renderer } from './renderer'
import { NavBar, Footer } from './components'
import api from './api'
import type { Bindings } from './types'

const app = new Hono<{ Bindings: Bindings }>()

app.use(renderer)

// Mount API at /api
app.route('/api', api)

// ============================================================
// PUBLIC ROUTES — Home / Catalog
// ============================================================
app.get('/', (c) => {
  return c.render(
    <>
      <NavBar />

      {/* HERO */}
      <section class="hero-glow cyber-grid scanlines relative">
        <div class="relative z-10 max-w-7xl mx-auto px-4 md:px-6 py-20 md:py-28">
          <div class="flex items-center gap-2 mb-6">
            <span class="cyber-badge"><i class="fa-solid fa-bolt"></i> Edge Deployed</span>
            <span class="cyber-badge cyber-badge-purple"><i class="fa-solid fa-shield-halved"></i> Secure Delivery</span>
            <span class="cyber-badge cyber-badge-green hidden sm:inline-flex"><i class="fa-solid fa-infinity"></i> Lifetime Updates</span>
          </div>

          <h1 class="font-orbitron font-black text-4xl md:text-6xl lg:text-7xl leading-tight mb-6">
            <span class="text-gradient">CS ALI</span><br />
            <span class="text-white">FOR <span class="neon-cyan">SOFTWARE</span></span>
          </h1>
          <p class="text-cyber-muted text-lg md:text-xl max-w-2xl mb-10 leading-relaxed">
            A futuristic marketplace of premium and free software — crafted in code,
            forged in the cyber underground. Download the tools that power tomorrow's makers.
          </p>

          <div class="flex flex-wrap gap-4">
            <a href="#catalog" class="btn-neon"><i class="fa-solid fa-rocket"></i> Browse Catalog</a>
            <a href="#categories" class="btn-neon btn-neon-purple"><i class="fa-solid fa-layer-group"></i> Categories</a>
            <a href="#contact" class="btn-neon btn-neon-ghost"><i class="fa-solid fa-comments"></i> Contact</a>
          </div>

          {/* Stats */}
          <div id="hero-stats" class="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl">
            <div class="cyber-card corner-accents p-4">
              <div class="text-cyan-400 font-orbitron text-2xl" id="stat-software">—</div>
              <div class="text-cyber-muted text-xs uppercase tracking-widest">Software</div>
            </div>
            <div class="cyber-card corner-accents p-4">
              <div class="text-purple-400 font-orbitron text-2xl" id="stat-categories">—</div>
              <div class="text-cyber-muted text-xs uppercase tracking-widest">Categories</div>
            </div>
            <div class="cyber-card corner-accents p-4">
              <div class="text-pink-400 font-orbitron text-2xl" id="stat-downloads">—</div>
              <div class="text-cyber-muted text-xs uppercase tracking-widest">Downloads</div>
            </div>
            <div class="cyber-card corner-accents p-4">
              <div class="text-green-400 font-orbitron text-2xl">24/7</div>
              <div class="text-cyber-muted text-xs uppercase tracking-widest">Uptime</div>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section id="categories" class="max-w-7xl mx-auto px-4 md:px-6 py-16">
        <h2 class="section-title text-2xl md:text-3xl mb-12 text-cyan-300">Categories</h2>
        <div id="categories-container" class="flex flex-wrap gap-3">
          <div class="cyber-loader"></div>
        </div>
      </section>

      {/* CATALOG */}
      <section id="catalog" class="max-w-7xl mx-auto px-4 md:px-6 py-12">
        <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <h2 class="section-title text-2xl md:text-3xl text-purple-300">Software Catalog</h2>
          <div class="relative w-full md:w-96">
            <input
              id="search-input"
              type="text"
              placeholder="Search software..."
              class="cyber-input pl-10"
            />
            <i class="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400"></i>
          </div>
        </div>

        <div id="active-filter" class="mb-6 hidden">
          <span class="text-cyber-muted text-sm">Filtering by: </span>
          <span id="active-filter-name" class="cyber-badge"></span>
          <button id="clear-filter" class="ml-2 text-pink-400 text-sm hover:underline">Clear ✕</button>
        </div>

        <div id="catalog-container" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div class="cyber-loader col-span-full mx-auto"></div>
        </div>
      </section>

      <Footer />

      <script src="/static/app.js"></script>
    </>
  )
})

// ============================================================
// PRODUCT DETAIL PAGE
// ============================================================
app.get('/software/:slug', async (c) => {
  const slug = c.req.param('slug')
  return c.render(
    <>
      <NavBar />
      <section class="max-w-7xl mx-auto px-4 md:px-6 py-10">
        <a href="/" class="text-cyan-400 hover:text-cyan-300 text-sm font-orbitron tracking-widest">
          <i class="fa-solid fa-arrow-left"></i> BACK TO CATALOG
        </a>
        <div id="product-container" class="mt-8">
          <div class="cyber-loader mx-auto"></div>
        </div>
      </section>
      <Footer />
      <script
        dangerouslySetInnerHTML={{
          __html: `window.PRODUCT_SLUG = ${JSON.stringify(slug)};`
        }}
      />
      <script src="/static/product.js"></script>
    </>
  )
})

// ============================================================
// ADMIN ROUTES
// ============================================================
app.get('/admin', (c) => {
  return c.render(
    <>
      <NavBar />
      <section class="max-w-7xl mx-auto px-4 md:px-6 py-10">
        <div id="admin-root">
          <div class="cyber-loader mx-auto"></div>
        </div>
      </section>
      <Footer />
      <script src="/static/admin.js"></script>
    </>
  )
})

export default app
