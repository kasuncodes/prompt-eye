import {
  pgTable,
  pgEnum,
  uuid,
  varchar,
  text,
  timestamp,
  uniqueIndex,
  boolean,
  decimal,
} from 'drizzle-orm/pg-core';

// Role enum for admin users
export const adminRoleEnum = pgEnum('admin_role', ['super_admin']);

// Admin users table
export const adminUsers = pgTable(
  'admin_users',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    email: varchar('email', { length: 255 }).notNull(),
    image: text('image'),
    role: adminRoleEnum('role').notNull().default('super_admin'),
    googleId: varchar('google_id', { length: 255 }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('admin_users_email_idx').on(table.email),
    uniqueIndex('admin_users_google_id_idx').on(table.googleId),
  ]
);

// Type exports for use in application
export type AdminUser = typeof adminUsers.$inferSelect;
export type NewAdminUser = typeof adminUsers.$inferInsert;

// LLM Providers table
export const llmProviders = pgTable(
  'llm_providers',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 100 }).notNull(), // e.g., "openai", "google"
    displayName: varchar('display_name', { length: 255 }).notNull(), // e.g., "OpenAI", "Google AI"
    logoUrl: text('logo_url'),
    encryptedApiKey: text('encrypted_api_key'), // AES-256 encrypted
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('llm_providers_name_idx').on(table.name),
  ]
);

// LLM Models table
export const llmModels = pgTable(
  'llm_models',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    providerId: uuid('provider_id')
      .notNull()
      .references(() => llmProviders.id, { onDelete: 'cascade' }),
    modelId: varchar('model_id', { length: 255 }).notNull(), // e.g., "gpt-4o", "gemini-pro"
    displayName: varchar('display_name', { length: 255 }).notNull(), // e.g., "GPT-4o", "Gemini Pro"
    inputCostPer1k: decimal('input_cost_per_1k', { precision: 10, scale: 6 }), // Cost per 1000 input tokens
    outputCostPer1k: decimal('output_cost_per_1k', { precision: 10, scale: 6 }), // Cost per 1000 output tokens
    isActive: boolean('is_active').default(false).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('llm_models_provider_model_idx').on(table.providerId, table.modelId),
  ]
);

// Type exports for LLM entities
export type LlmProvider = typeof llmProviders.$inferSelect;
export type NewLlmProvider = typeof llmProviders.$inferInsert;
export type LlmModel = typeof llmModels.$inferSelect;
export type NewLlmModel = typeof llmModels.$inferInsert;
