import request from 'supertest'
import type { Core } from '@strapi/strapi'
import { setupStrapi, cleanupStrapi } from './helpers/strapi'

let strapi: Core.Strapi
let token: string

beforeAll(async () => {
  const ctx = await setupStrapi()
  strapi = ctx.instance
  token = ctx.token
})

afterAll(async () => {
  await cleanupStrapi()
})

describe('GET /addresses/provinces', () => {
  it('returns a 200 response with a list of provinces', async () => {
    const res = await request(strapi.server.app.callback())
      .get('/api/addresses/provinces')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('data')
    expect(Array.isArray(res.body.data)).toBe(true)
  })

  it('returns provinces with code and name fields', async () => {
    const res = await request(strapi.server.app.callback())
      .get('/api/addresses/provinces')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.data.length).toBeGreaterThan(0)

    for (const province of res.body.data) {
      expect(province).toHaveProperty('code')
      expect(province).toHaveProperty('name')
      expect(typeof province.code).toBe('string')
      expect(typeof province.name).toBe('string')
    }
  })
})

describe('GET /addresses/regencies/:provincesId', () => {
  it('returns a 200 response with a list of regencies for a valid province', async () => {
    const res = await request(strapi.server.app.callback())
      .get('/api/addresses/regencies/11')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('data')
    expect(Array.isArray(res.body.data)).toBe(true)
  })

  it('returns regencies with code and name fields', async () => {
    const res = await request(strapi.server.app.callback())
      .get('/api/addresses/regencies/11')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.data.length).toBeGreaterThan(0)

    for (const regency of res.body.data) {
      expect(regency).toHaveProperty('code')
      expect(regency).toHaveProperty('name')
      expect(typeof regency.code).toBe('string')
      expect(typeof regency.name).toBe('string')
      expect(regency.code.startsWith('11.')).toBe(true)
    }
  })

  it('returns a 400 response for an invalid provincesId format', async () => {
    const res = await request(strapi.server.app.callback())
      .get('/api/addresses/regencies/abc')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(400)
  })
})

describe('GET /addresses/districts/:regenciesId', () => {
  it('returns a 200 response with a list of districts for a valid regency', async () => {
    const res = await request(strapi.server.app.callback())
      .get('/api/addresses/districts/11.01')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('data')
    expect(Array.isArray(res.body.data)).toBe(true)
  })

  it('returns districts with code and name fields', async () => {
    const res = await request(strapi.server.app.callback())
      .get('/api/addresses/districts/11.01')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.data.length).toBeGreaterThan(0)

    for (const district of res.body.data) {
      expect(district).toHaveProperty('code')
      expect(district).toHaveProperty('name')
      expect(typeof district.code).toBe('string')
      expect(typeof district.name).toBe('string')
      expect(district.code.startsWith('11.01.')).toBe(true)
    }
  })

  it('returns a 400 response for an invalid regenciesId format', async () => {
    const res = await request(strapi.server.app.callback())
      .get('/api/addresses/districts/11')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(400)
  })
})
