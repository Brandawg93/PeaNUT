import fs from 'node:fs'
import path from 'node:path'
import { load, dump } from 'js-yaml'
import bcrypt from 'bcryptjs'
import { createDebugLogger } from '@/server/debug'

const debug = createDebugLogger('AUTH_STORAGE')

export interface AuthUserInfo {
  username: string
  passwordHash: string
}

const AUTH_FILE_PATH = process.env.AUTH_FILE_PATH || 'config/auth.yaml'

export class AuthStorage {
  private static instance: AuthStorage
  private readonly filePath: string
  private user: AuthUserInfo | null = null

  private constructor() {
    this.filePath = path.resolve(AUTH_FILE_PATH)
    this.load()
  }

  public static getInstance(): AuthStorage {
    if (!AuthStorage.instance) {
      AuthStorage.instance = new AuthStorage()
    }
    return AuthStorage.instance
  }

  private load(): void {
    try {
      if (fs.existsSync(this.filePath)) {
        const fileContents = fs.readFileSync(this.filePath, 'utf8')
        this.user = load(fileContents) as AuthUserInfo
        debug.info('Auth settings loaded successfully')
      }
    } catch (error) {
      debug.error('Error loading auth file', { error: error instanceof Error ? error.message : String(error) })
    }
  }

  private save(): boolean {
    try {
      const dirPath = path.dirname(this.filePath)
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true })
      }
      const yamlStr = dump(this.user)
      fs.writeFileSync(this.filePath, yamlStr, { encoding: 'utf8', mode: 0o600, flag: 'w' })
      debug.info('Auth settings saved successfully')
      return true
    } catch (error) {
      debug.error('Error saving auth file', { error: error instanceof Error ? error.message : String(error) })
      return false
    }
  }

  public hasUser(): boolean {
    return this.user !== null
  }

  public getAuthUser(): AuthUserInfo | null {
    return this.user ? { ...this.user } : null
  }

  public async setAuthUser(username: string, passwordPlain: string): Promise<boolean> {
    if (!username?.trim() || !passwordPlain || passwordPlain.length < 5) {
      debug.error('Validation failed for setAuthUser', {
        username: !!username?.trim(),
        passwordLength: passwordPlain?.length ?? 0,
      })
      return false
    }

    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(passwordPlain, salt)
    this.user = { username, passwordHash }
    return this.save()
  }

  public async verifyPassword(passwordPlain: string): Promise<boolean> {
    if (!this.user) return false
    return bcrypt.compare(passwordPlain, this.user.passwordHash)
  }
}

export const authStorage = AuthStorage.getInstance()
