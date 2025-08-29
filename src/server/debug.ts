/**
 * Debug logging utility for server components
 * Controlled by the DEBUG environment variable
 */

interface DebugOptions {
  prefix?: string
  timestamp?: boolean
}

class DebugLogger {
  private readonly enabled: boolean
  private readonly prefix: string
  private readonly timestamp: boolean

  constructor(options: DebugOptions = {}) {
    this.enabled = process.env.DEBUG === 'true' || process.env.DEBUG === '1'
    this.prefix = options.prefix || '[DEBUG]'
    this.timestamp = options.timestamp ?? true
  }

  private formatMessage(level: string, message: string, data?: any): string {
    const parts = [this.prefix, level]

    if (this.timestamp) {
      parts.unshift(new Date().toISOString())
    }

    parts.push(message)

    const formattedMessage = parts.join(' ')

    if (data !== undefined) {
      return `${formattedMessage} ${JSON.stringify(data, null, 2)}`
    }

    return formattedMessage
  }

  log(message: string, data?: any): void {
    if (!this.enabled) return
    console.log(this.formatMessage('LOG', message, data))
  }

  info(message: string, data?: any): void {
    if (!this.enabled) return
    console.info(this.formatMessage('INFO', message, data))
  }

  warn(message: string, data?: any): void {
    if (!this.enabled) return
    console.warn(this.formatMessage('WARN', message, data))
  }

  error(message: string, data?: any): void {
    if (!this.enabled) return
    console.error(this.formatMessage('ERROR', message, data))
  }

  debug(message: string, data?: any): void {
    if (!this.enabled) return
    console.debug(this.formatMessage('DEBUG', message, data))
  }

  // Method to check if debug logging is enabled
  isEnabled(): boolean {
    return this.enabled
  }

  // Method to create a child logger with a specific prefix
  child(prefix: string): DebugLogger {
    return new DebugLogger({
      prefix: `${this.prefix} [${prefix}]`,
      timestamp: this.timestamp,
    })
  }
}

// Create default debug logger instance
export const debug = new DebugLogger()

// Export the class for custom instances
export { DebugLogger }

// Export a function to create debug loggers for specific modules
export function createDebugLogger(moduleName: string, options?: DebugOptions): DebugLogger {
  return new DebugLogger({
    prefix: `[DEBUG] [${moduleName}]`,
    timestamp: options?.timestamp ?? true,
  })
}
