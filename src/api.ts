// ============================================================
// REST API routes for CS Ali Software Store
// ============================================================

import { Hono } from 'hono'
import { getCookie, setCookie, deleteCookie } from 'hono/cookie'
import type { Bindings } from './types'
//import { slugify, sha256, randomToken, signSession, verifySession } from './utils'

const api = new Hono<{ Bindings: Bindings; Variables: { admin?: any } }>()

// Session secret (in real production use wrangler secret put SESSION_SECRET)
const SESSION_SECRET = 'cs-ali-software-store-secret-2026-change-me'

// ============================================================
// Auth middleware
// ============================================================
async function requireAdmin(c: any, next: any) {
  const token = getCookie(c, 'admin_session')
  if (!token) return c.json({ error: 'Unauthorized' }, 401)
  const payload = await verifySession(token, SESSION_SECRET)
  if (!payload) return c.json({ error: 'Invalid session' }, 401)
  c.set('admin', payload)
  await next()
}

// ============================================================
// Public: Categories
// ============================================================
api.get('/categories', async (c) => {
  const { results } = await c.env.DB.prepare(
    'SELECT * FROM categories ORDER BY name'
  ).all()
  return c.json({ categories: results })
})

// ============================================================
// Public: Software listing (with filters)
// ============================================================
api.get('/software', async (c) => {
  const category = c.req.query('category')
  const featured = c.req.query('featured')
  const search = c.req.query('search')
  const limit = parseInt(c.req.query('limit') || '50')

  let sql = `
    SELECT s.*, c.name AS category_name, c.slug AS category_slug, c.icon AS category_icon
    FROM software s
    LEFT JOIN categories c ON s.category_id = c.id
    WHERE s.is_published = 1
  `
  const binds: any[] = []

  if (category) {
    sql += ' AND c.slug = ?'
    binds.push(category)
  }
  if (featured === '1') {
    sql += ' AND s.is_featured = 1'
  }
  if (search) {
    sql += ' AND (s.title LIKE ? OR s.short_description LIKE ?)'
    binds.push(`%${search}%`, `%${search}%`)
  }
  sql += ' ORDER BY s.is_featured DESC, s.created_at DESC LIMIT ?'
  binds.push(limit)

  const { results } = await c.env.DB.prepare(sql).bind(...binds).all()
  return c.json({ software: results })
})

// ============================================================
// Public: Single software (by slug)
// ============================================================
api.get('/software/:slug', async (c) => {
  const slug = c.req.param('slug')

  const sw = await c.env.DB.prepare(`
    SELECT s.*, c.name AS category_name, c.slug AS category_slug, c.icon AS category_icon
    FROM software s
    LEFT JOIN categories c ON s.category_id = c.id
    WHERE s.slug = ? AND s.is_published = 1
  `).bind(slug).first()

  if (!sw) return c.json({ error: 'Not found' }, 404)

  const { results: screenshots } = await c.env.DB.prepare(
    'SELECT * FROM screenshots WHERE software_id = ? ORDER BY display_order'
  ).bind(sw.id).all()

  const { results: versions } = await c.env.DB.prepare(
    'SELECT * FROM version_history WHERE software_id = ? ORDER BY released_at DESC'
  ).bind(sw.id).all()

  return c.json({ software: sw, screenshots, versions })
})

// ============================================================
// Public: Trigger download (free) or create purchase token (paid)
// ============================================================
api.post('/software/:slug/download', async (c) => {
  const slug = c.req.param('slug')
  const sw: any = await c.env.DB.prepare(
    'SELECT * FROM software WHERE slug = ? AND is_published = 1'
  ).bind(slug).first()

  if (!sw) return c.json({ error: 'Not found' }, 404)

  // Free download: increment counter and return direct URL
  if (sw.price === 0 || sw.price === null) {
    await c.env.DB.prepare(
      'UPDATE software SET downloads_count = downloads_count + 1 WHERE id = ?'
    ).bind(sw.id).run()
    return c.json({
      type: 'free',
      download_url: sw.download_url,
      message: 'Your download is ready.'
    })
  }

  // Paid: collect buyer info
  const body = await c.req.json().catch(() => ({}))
  const { email, name } = body
  if (!email) return c.json({ error: 'Email required for paid downloads.' }, 400)

  // Generate secure token (valid 24h, max 5 downloads)
  const token = randomToken(24)
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

  await c.env.DB.prepare(`
    INSERT INTO purchases (software_id, buyer_email, buyer_name, amount, download_token, token_expires_at, status)
    VALUES (?, ?, ?, ?, ?, ?, 'pending')
  `).bind(sw.id, email, name || null, sw.price, token, expires).run()

  return c.json({
    type: 'paid',
    amount: sw.price,
    currency: sw.currency,
    checkout_token: token,
    message: `Complete payment of ${sw.currency} ${sw.price} to receive the download link via email at ${email}.`
  })
})

// Secure download via token
api.get('/download/:token', async (c) => {
  const token = c.req.param('token')
  const purchase: any = await c.env.DB.prepare(
    'SELECT p.*, s.download_url, s.title FROM purchases p JOIN software s ON s.id = p.software_id WHERE p.download_token = ?'
  ).bind(token).first()

  if (!purchase) return c.json({ error: 'Invalid token' }, 404)
  if (new Date(purchase.token_expires_at).getTime() < Date.now()) {
    return c.json({ error: 'Token expired' }, 410)
  }
  if (purchase.download_count >= purchase.max_downloads) {
    return c.json({ error: 'Maximum downloads reached' }, 429)
  }
  if (purchase.status !== 'paid') {
    return c.json({ error: 'Payment not confirmed yet', status: purchase.status }, 402)
  }

  await c.env.DB.prepare(
    'UPDATE purchases SET download_count = download_count + 1 WHERE id = ?'
  ).bind(purchase.id).run()

  return c.json({ download_url: purchase.download_url, title: purchase.title })
})

// ============================================================
// Admin: Auth
// ============================================================
api.post('/admin/login', async (c) => {
  const { username, password } = await c.req.json().catch(() => ({}))
  if (!username || !password) return c.json({ error: 'Missing credentials' }, 400)

  const hash = await sha256(password)
  const admin: any = await c.env.DB.prepare(
    'SELECT * FROM admins WHERE username = ? AND password_hash = ?'
  ).bind(username, hash).first()

  if (!admin) return c.json({ error: 'Invalid credentials' }, 401)

  const exp = Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days
  const token = await signSession({ id: admin.id, username: admin.username, exp }, SESSION_SECRET)
  setCookie(c, 'admin_session', token, {
    httpOnly: true,
    secure: false,
    sameSite: 'Lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60
  })
  return c.json({ success: true, username: admin.username })
})

api.post('/admin/logout', async (c) => {
  deleteCookie(c, 'admin_session', { path: '/' })
  return c.json({ success: true })
})

api.get('/admin/me', async (c) => {
  const token = getCookie(c, 'admin_session')
  if (!token) return c.json({ authenticated: false })
  const payload = await verifySession(token, SESSION_SECRET)
  if (!payload) return c.json({ authenticated: false })
  return c.json({ authenticated: true, username: payload.username })
})

// ============================================================
// Admin: Software CRUD
// ============================================================
api.get('/admin/software', requireAdmin, async (c) => {
  const { results } = await c.env.DB.prepare(`
    SELECT s.*, c.name AS category_name
    FROM software s
    LEFT JOIN categories c ON s.category_id = c.id
    ORDER BY s.created_at DESC
  `).all()
  return c.json({ software: results })
})

api.post('/admin/software', requireAdmin, async (c) => {
  const body = await c.req.json()
  const {
    title, category_id, short_description, description,
    version, price, cover_image, download_url,
    system_requirements, file_size, platform,
    is_featured, is_published,
    screenshots // array of urls
  } = body

  if (!title || !description) {
    return c.json({ error: 'Title and description are required' }, 400)
  }

  let slug = slugify(title)
  // Ensure unique slug
  const existing: any = await c.env.DB.prepare('SELECT id FROM software WHERE slug = ?').bind(slug).first()
  if (existing) slug = `${slug}-${Date.now().toString(36)}`

  const result = await c.env.DB.prepare(`
    INSERT INTO software
      (title, slug, category_id, short_description, description, version, price,
       cover_image, download_url, system_requirements, file_size, platform,
       is_featured, is_published)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    title,
    slug,
    category_id || null,
    short_description || null,
    description,
    version || '1.0.0',
    parseFloat(price) || 0,
    cover_image || null,
    download_url || null,
    system_requirements || null,
    file_size || null,
    platform || 'Windows',
    is_featured ? 1 : 0,
    is_published === false ? 0 : 1
  ).run()

  const softwareId = result.meta.last_row_id

  // Insert screenshots
  if (Array.isArray(screenshots)) {
    for (let i = 0; i < screenshots.length; i++) {
      const url = (screenshots[i] || '').trim()
      if (!url) continue
      await c.env.DB.prepare(
        'INSERT INTO screenshots (software_id, image_url, display_order) VALUES (?, ?, ?)'
      ).bind(softwareId, url, i).run()
    }
  }

  return c.json({ success: true, id: softwareId, slug })
})

api.get('/admin/software/:id', requireAdmin, async (c) => {
  const id = c.req.param('id')
  const sw = await c.env.DB.prepare('SELECT * FROM software WHERE id = ?').bind(id).first()
  if (!sw) return c.json({ error: 'Not found' }, 404)
  const { results: screenshots } = await c.env.DB.prepare(
    'SELECT * FROM screenshots WHERE software_id = ? ORDER BY display_order'
  ).bind(id).all()
  return c.json({ software: sw, screenshots })
})

api.put('/admin/software/:id', requireAdmin, async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json()
  const {
    title, category_id, short_description, description,
    version, price, cover_image, download_url,
    system_requirements, file_size, platform,
    is_featured, is_published,
    screenshots
  } = body

  await c.env.DB.prepare(`
    UPDATE software SET
      title = ?, category_id = ?, short_description = ?, description = ?,
      version = ?, price = ?, cover_image = ?, download_url = ?,
      system_requirements = ?, file_size = ?, platform = ?,
      is_featured = ?, is_published = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).bind(
    title,
    category_id || null,
    short_description || null,
    description,
    version || '1.0.0',
    parseFloat(price) || 0,
    cover_image || null,
    download_url || null,
    system_requirements || null,
    file_size || null,
    platform || 'Windows',
    is_featured ? 1 : 0,
    is_published === false ? 0 : 1,
    id
  ).run()

  // Replace screenshots
  if (Array.isArray(screenshots)) {
    await c.env.DB.prepare('DELETE FROM screenshots WHERE software_id = ?').bind(id).run()
    for (let i = 0; i < screenshots.length; i++) {
      const url = (screenshots[i] || '').trim()
      if (!url) continue
      await c.env.DB.prepare(
        'INSERT INTO screenshots (software_id, image_url, display_order) VALUES (?, ?, ?)'
      ).bind(id, url, i).run()
    }
  }

  return c.json({ success: true })
})

api.delete('/admin/software/:id', requireAdmin, async (c) => {
  const id = c.req.param('id')
  await c.env.DB.prepare('DELETE FROM software WHERE id = ?').bind(id).run()
  return c.json({ success: true })
})

// Admin: Categories CRUD
api.post('/admin/categories', requireAdmin, async (c) => {
  const { name, icon } = await c.req.json()
  if (!name) return c.json({ error: 'Name required' }, 400)
  const slug = slugify(name)
  try {
    const res = await c.env.DB.prepare(
      'INSERT INTO categories (name, slug, icon) VALUES (?, ?, ?)'
    ).bind(name, slug, icon || 'fa-cube').run()
    return c.json({ success: true, id: res.meta.last_row_id })
  } catch (e: any) {
    return c.json({ error: 'Category already exists' }, 400)
  }
})

api.delete('/admin/categories/:id', requireAdmin, async (c) => {
  const id = c.req.param('id')
  await c.env.DB.prepare('DELETE FROM categories WHERE id = ?').bind(id).run()
  return c.json({ success: true })
})

// Admin: Stats
api.get('/admin/stats', requireAdmin, async (c) => {
  const totalSoftware: any = await c.env.DB.prepare(
    'SELECT COUNT(*) AS n FROM software'
  ).first()
  const totalCategories: any = await c.env.DB.prepare(
    'SELECT COUNT(*) AS n FROM categories'
  ).first()
  const totalDownloads: any = await c.env.DB.prepare(
    'SELECT COALESCE(SUM(downloads_count), 0) AS n FROM software'
  ).first()
  const totalPurchases: any = await c.env.DB.prepare(
    'SELECT COUNT(*) AS n FROM purchases'
  ).first()
  return c.json({
    software: totalSoftware.n,
    categories: totalCategories.n,
    downloads: totalDownloads.n,
    purchases: totalPurchases.n
  })
})

export default api
