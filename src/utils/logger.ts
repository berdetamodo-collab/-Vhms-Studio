type LogLevel = 'info' | 'warn' | 'error';

/**
 * Logger terpusat untuk aplikasi.
 * Menyediakan logging terstruktur dengan kategori untuk memudahkan debugging.
 */
class Logger {
  private log(level: LogLevel, category: string, message: string, meta?: any) {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [VHMS:${category.toUpperCase()}]`;
    
    const metaString = meta ? JSON.stringify(meta, null, 2) : '';

    switch (level) {
      case 'info':
        console.log(`${prefix} ${message}`, metaString);
        break;
      case 'warn':
        console.warn(`${prefix} ${message}`, metaString);
        break;
      case 'error':
        console.error(`${prefix} ${message}`, metaString);
        break;
    }
  }

  public sanitizer = {
    info: (msg: string, meta?: any) => this.log('info', 'SANITIZER', msg, meta),
    warn: (msg: string, meta?: any) => this.log('warn', 'SANITIZER', msg, meta),
    error: (msg: string, meta?: any) => this.log('error', 'SANITIZER', msg, meta),
  };

  public security = {
    block: (msg: string, meta?: any) => this.log('warn', 'SECURITY_BLOCK', msg, meta),
  };

  public system = {
    info: (msg: string, meta?: any) => this.log('info', 'SYSTEM', msg, meta),
    error: (msg: string, meta?: any) => this.log('error', 'SYSTEM', msg, meta),
  };
  
  public engine = {
    info: (msg: string, meta?: any) => this.log('info', 'ENGINE', msg, meta),
    warn: (msg: string, meta?: any) => this.log('warn', 'ENGINE', msg, meta),
  };
}

export const logger = new Logger();
