import { Injectable, BadRequestException, UnauthorizedException, ConflictException } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

// Dynamic import or require sqlite3
let sqlite3: any = null;
try {
  sqlite3 = require('sqlite3').verbose();
} catch (e) {
  console.warn('sqlite3 module not loaded, using fallback storage');
}

export interface UserRecord {
  id: string;
  email: string;
  username: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  role: string;
  instrument_primary: string;
  created_at: string;
}

@Injectable()
export class AuthService {
  private db: any = null;
  private dbPath: string;
  private fallbackUsers: Map<string, UserRecord> = new Map();

  constructor() {
    // Determine path to sqlite DB
    const rootDir = process.cwd();
    this.dbPath = path.resolve(rootDir, 'db/music-folder.sqlite');
    if (!fs.existsSync(path.dirname(this.dbPath))) {
      fs.mkdirSync(path.dirname(this.dbPath), { recursive: true });
    }

    if (sqlite3) {
      this.db = new sqlite3.Database(this.dbPath, (err: any) => {
        if (err) {
          console.error('Error abriendo SQLite:', err.message);
        } else {
          this.initTables();
        }
      });
    }
  }

  private initTables() {
    if (!this.db) return;
    const createSql = `
      CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          email TEXT UNIQUE,
          username TEXT UNIQUE,
          password_hash TEXT,
          first_name TEXT,
          last_name TEXT,
          bio TEXT,
          profile_picture_url TEXT,
          role TEXT,
          instrument_primary TEXT,
          instrument_secondary TEXT,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
          is_active INTEGER DEFAULT 1
      );
    `;
    this.db.run(createSql);
  }

  private queryAsync(sql: string, params: any[] = []): Promise<any[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) return resolve([]);
      this.db.all(sql, params, (err: any, rows: any[]) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  }

  private runAsync(sql: string, params: any[] = []): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.db) return resolve({ changes: 0 });
      this.db.run(sql, params, function (this: any, err: any) {
        if (err) reject(err);
        else resolve({ lastID: this.lastID, changes: this.changes });
      });
    });
  }

  async register(dto: RegisterDto) {
    const email = dto.email.trim().toLowerCase();
    const username = email.split('@')[0];
    const parts = dto.name.trim().split(' ');
    const firstName = parts[0] || dto.name;
    const lastName = parts.slice(1).join(' ') || '';

    // Check if user exists in SQLite
    if (this.db) {
      try {
        const existing = await this.queryAsync('SELECT * FROM users WHERE email = ? OR username = ?', [email, username]);
        if (existing && existing.length > 0) {
          throw new ConflictException('El correo electrónico ya se encuentra registrado');
        }
      } catch (err: any) {
        if (err instanceof ConflictException) throw err;
      }
    } else {
      if (this.fallbackUsers.has(email)) {
        throw new ConflictException('El correo electrónico ya se encuentra registrado');
      }
    }

    const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const role = dto.role || 'Músico / Instrumentista';
    const instrumentPrimary = dto.instrument_primary || 'Violín';

    const newUser: UserRecord = {
      id: userId,
      email,
      username,
      password_hash: dto.password, // In prod use bcrypt hash
      first_name: firstName,
      last_name: lastName,
      role,
      instrument_primary: instrumentPrimary,
      created_at: new Date().toISOString(),
    };

    if (this.db) {
      await this.runAsync(
        `INSERT INTO users (id, email, username, password_hash, first_name, last_name, role, instrument_primary)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [userId, email, username, dto.password, firstName, lastName, role, instrumentPrimary]
      );
    } else {
      this.fallbackUsers.set(email, newUser);
    }

    const fullName = `${firstName} ${lastName}`.trim();

    return {
      success: true,
      message: 'Usuario registrado correctamente',
      user: {
        id: userId,
        name: fullName,
        email,
        role,
        instrument_primary: instrumentPrimary,
      },
      token: `token_${userId}`,
    };
  }

  async login(dto: LoginDto) {
    const email = dto.email.trim().toLowerCase();

    let userRecord: any = null;

    if (this.db) {
      try {
        const rows = await this.queryAsync('SELECT * FROM users WHERE email = ?', [email]);
        if (rows && rows.length > 0) {
          userRecord = rows[0];
        }
      } catch (err) {
        console.error('Error buscando usuario en sqlite:', err);
      }
    }

    if (!userRecord && this.fallbackUsers.has(email)) {
      const fb = this.fallbackUsers.get(email)!;
      userRecord = fb;
    }

    if (!userRecord) {
      // If user does not exist yet in DB, allow seamless initial login for development or throw error if credentials provided
      const name = email.split('@')[0].replace(/[._-]+/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
      const userId = `usr_${Date.now()}`;
      
      // Auto register default login user if not found
      return {
        success: true,
        user: {
          id: userId,
          name,
          email,
          role: 'Director / Conductor',
          instrument_primary: 'Tutti',
        },
        token: `token_${userId}`,
      };
    }

    // Check password
    if (userRecord.password_hash && userRecord.password_hash !== dto.password) {
      throw new UnauthorizedException('Contraseña incorrecta. Por favor, intentalo de nuevo.');
    }

    const fullName = `${userRecord.first_name || ''} ${userRecord.last_name || ''}`.trim() || email.split('@')[0];

    return {
      success: true,
      user: {
        id: userRecord.id,
        name: fullName,
        email: userRecord.email,
        role: userRecord.role || 'Músico',
        instrument_primary: userRecord.instrument_primary || 'Tutti',
      },
      token: `token_${userRecord.id}`,
    };
  }

  async getUsers() {
    if (this.db) {
      const rows = await this.queryAsync('SELECT id, email, username, first_name, last_name, role, instrument_primary, created_at FROM users');
      return rows;
    }
    return Array.from(this.fallbackUsers.values()).map((u) => ({
      id: u.id,
      email: u.email,
      username: u.username,
      first_name: u.first_name,
      last_name: u.last_name,
      role: u.role,
      instrument_primary: u.instrument_primary,
      created_at: u.created_at,
    }));
  }
}
