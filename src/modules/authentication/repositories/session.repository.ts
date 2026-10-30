import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  AuthenticationStorage,
  type SessionRecord,
  type SessionStore,
} from '@nestjs/authentication';
import { Model } from 'mongoose';
import {
  Session,
  type SessionDocument,
} from '@src/modules/authentication/entities/session.schema.js';
import type { Json } from '@src/common/types/types.js';

@Injectable()
export class SessionRepository implements SessionStore {
  constructor(
    @InjectModel(Session.name)
    private readonly sessionModel: Model<SessionDocument>,
    storage: AuthenticationStorage,
  ) {
    storage.registerSource({
      sessions: this,
    });
  }

  async getSession(id: string): Promise<SessionRecord | undefined> {
    const row = await this.sessionModel.findOne({ id }).lean();
    return row ? toRecord(row) : undefined;
  }

  async createSession(record: SessionRecord): Promise<void> {
    const metadata = (record.metadata ?? null) as Record<string, Json> | null;
    await this.sessionModel.create({
      ...record,
      mfa: record.mfa ?? null,
      metadata,
    });
  }

  async touchSession(id: string, lastActiveAt: Date): Promise<void> {
    // Only moves lastActiveAt forward, never backward
    await this.sessionModel.updateOne(
      { id, lastActiveAt: { $lt: lastActiveAt } },
      { $set: { lastActiveAt } },
    );
  }

  async deleteSession(id: string): Promise<boolean> {
    const { deletedCount } = await this.sessionModel.deleteOne({ id });
    return deletedCount > 0;
  }

  async listUserSessions(userId: string): Promise<SessionRecord[]> {
    const rows = await this.sessionModel.find({ userId }).lean();
    return rows.map(toRecord);
  }

  async deleteUserSessions(userId: string): Promise<void> {
    await this.sessionModel.deleteMany({ userId });
  }
}

type WithoutNulls<T> = {
  [K in keyof T as null extends T[K] ? never : K]: T[K];
} & {
  [K in keyof T as null extends T[K] ? K : never]?: Exclude<T[K], null>;
};

function withoutNulls<T extends object>(row: T): WithoutNulls<T> {
  return Object.fromEntries(
    Object.entries(row).filter(([, value]) => value !== null),
  ) as WithoutNulls<T>;
}

// Removes Mongo's internal fields (_id, __v) and null values
function toRecord(row: object): SessionRecord {
  const { _id, __v, ...session } = row as Record<string, unknown>;
  return withoutNulls(session) as unknown as SessionRecord;
}
