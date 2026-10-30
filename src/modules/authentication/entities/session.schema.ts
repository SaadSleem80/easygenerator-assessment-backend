import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { MfaState } from '@nestjs/authentication';
import { HydratedDocument } from 'mongoose';
import type { Json } from '@src/common/types/types.js';

export type SessionDocument = HydratedDocument<Session>;

@Schema({ collection: 'sessions', id: false })
export class Session {
  @Prop({ type: String, required: true, unique: true })
  id: string;

  @Prop({ type: String, required: true, index: true })
  userId: string;

  @Prop({ type: Date, required: true })
  createdAt: Date;

  @Prop({ type: Date, required: true })
  expiresAt: Date;

  @Prop({ type: Date, required: true })
  lastActiveAt: Date;

  @Prop({ type: String, default: null })
  mfa: MfaState | null;

  @Prop({ type: Object, default: null })
  metadata: Record<string, Json> | null;
}

export const SessionSchema = SchemaFactory.createForClass(Session);

// MongoDB removes the session automatically once expiresAt passes
SessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
