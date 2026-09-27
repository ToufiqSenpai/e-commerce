import { createStrapi, type Core } from '@strapi/strapi'
import { PGlite } from '@electric-sql/pglite'
import { PGLiteSocketServer } from '@electric-sql/pglite-socket'
import { createServer } from 'net'
import path from 'path'
import request from 'supertest'

const POSTGRES_HOST = '127.0.0.1'

let instance: Core.Strapi
let postgres: PGlite
let postgresSocket: PGLiteSocketServer

export async function setupStrapi() {
  const postgresPort = await getFreePort()
  postgres = new PGlite()
  postgresSocket = new PGLiteSocketServer({ db: postgres, host: POSTGRES_HOST, port: postgresPort })
  await postgresSocket.start()

  process.env.DATABASE_CLIENT = 'postgres'
  process.env.DATABASE_HOST = POSTGRES_HOST
  process.env.DATABASE_PORT = String(postgresPort)
  process.env.DATABASE_NAME = 'postgres'
  process.env.DATABASE_USERNAME = 'postgres'
  process.env.DATABASE_PASSWORD = 'postgres'
  process.env.DATABASE_SSL = 'false'
  process.env.DATABASE_POOL_MIN = '1'
  process.env.DATABASE_POOL_MAX = '1'

  instance = await createStrapi({ distDir: path.resolve(__dirname, path.join('..', '..', 'dist')) }).load()
  instance.server.mount()

  const adminToken = await getAdminToken()
  await enableAllPermissions(adminToken, 'public')
  await enableAllPermissions(adminToken, 'authenticated')

  return { instance, token: await getToken(), adminToken: getAdminToken() }
}

export async function cleanupStrapi(): Promise<void> {
  if (instance) await instance.destroy()
  if (postgresSocket) await postgresSocket.stop()
  if (postgres) await postgres.close()
}

async function getToken(): Promise<string> {
  const email = 'user@test.com'
  const username = 'testuser'
  const password = 'Test1234!'

  const existing = await instance.query('plugin::users-permissions.user').findOne({
    where: { email },
  })

  if (!existing) {
    const register = await request(instance.server.app.callback()).post('/api/auth/local/register').send({
      username,
      email,
      password,
    })

    if (register.status !== 200) {
      throw new Error(`Register failed (${register.status}): ${JSON.stringify(register.body)}`)
    }
  }

  const login = await request(instance.server.app.callback()).post('/api/auth/local').send({
    identifier: email,
    password,
  })

  if (login.status !== 200) {
    throw new Error(`Login failed (${login.status}): ${JSON.stringify(login.body)}`)
  }

  return login.body.jwt
}

async function getAdminToken(): Promise<string> {
  const email = 'admin@test.com'
  const password = 'Test1234!'

  const superAdminRole = await instance.query('admin::role').findOne({ where: { code: 'strapi-super-admin' } })

  if (!superAdminRole) {
    throw new Error('Super admin role not found — make sure bootstrap has run')
  }

  const existingAdmin = await instance.query('admin::user').findOne({ where: { email } })

  if (!existingAdmin) {
    await instance.service('admin::user').create({
      email,
      password,
      firstname: 'Test',
      lastname: 'Admin',
      isActive: true,
      roles: [superAdminRole.id],
    })
  }

  const login = await request(instance.server.app.callback()).post('/admin/login').send({ email, password })

  if (login.status !== 200) {
    throw new Error(`Admin login failed (${login.status}): ${JSON.stringify(login.body)}`)
  }

  return login.body.data.token
}

async function enableAllPermissions(adminToken: string, roleType: 'public' | 'authenticated'): Promise<void> {
  const rolesRes = await request(instance.server.app.callback())
    .get('/users-permissions/roles')
    .set('Authorization', `Bearer ${adminToken}`)

  if (rolesRes.status !== 200) {
    throw new Error(`Fetch roles failed (${rolesRes.status}): ${JSON.stringify(rolesRes.body)}`)
  }

  const role = rolesRes.body.roles.find((r: { type: string }) => r.type === roleType)
  if (!role) {
    throw new Error(`Role "${roleType}" not found`)
  }

  const roleDetailRes = await request(instance.server.app.callback())
    .get(`/users-permissions/roles/${role.id}`)
    .set('Authorization', `Bearer ${adminToken}`)

  if (roleDetailRes.status !== 200) {
    throw new Error(`Fetch role detail failed (${roleDetailRes.status}): ${JSON.stringify(roleDetailRes.body)}`)
  }

  const roleData = roleDetailRes.body.role

  enableAllRecursive(roleData.permissions)

  const updateRes = await request(instance.server.app.callback())
    .put(`/users-permissions/roles/${role.id}`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      name: roleData.name,
      description: roleData.description,
      permissions: roleData.permissions,
    })

  if (updateRes.status !== 200) {
    throw new Error(`Update role failed (${updateRes.status}): ${JSON.stringify(updateRes.body)}`)
  }
}

function enableAllRecursive(node: unknown): void {
  if (node === null || typeof node !== 'object') return

  const obj = node as Record<string, unknown>

  if ('enabled' in obj) {
    obj.enabled = true
  }

  for (const value of Object.values(obj)) {
    if (value !== null && typeof value === 'object') {
      enableAllRecursive(value)
    }
  }
}

function getFreePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const srv = createServer()
    srv.unref()
    srv.on('error', reject)
    srv.listen(0, () => {
      const address = srv.address()
      if (address && typeof address === 'object') {
        const port = address.port
        srv.close(() => resolve(port))
      } else {
        reject(new Error('Failed to get free port'))
      }
    })
  })
}
