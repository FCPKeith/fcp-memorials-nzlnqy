import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  jsonb,
  decimal,
  date,
} from 'drizzle-orm/pg-core';

/**
 * Memorials table - stores published memorial pages
 */
export const memorials = pgTable('memorials', {
  id: uuid('id').primaryKey().defaultRandom(),
  full_name: text('full_name').notNull(),
  birth_date: date('birth_date'),
  death_date: date('death_date'),
  story_text: text('story_text').notNull(),
  photos: jsonb('photos').default([]).notNull(),
  video_link: text('video_link'),
  audio_narration_link: text('audio_narration_link'),
  latitude: decimal('latitude', { precision: 10, scale: 8 }),
  longitude: decimal('longitude', { precision: 11, scale: 8 }),
  location_visibility: text('location_visibility').default('exact').notNull(), // 'exact', 'approximate', 'hidden'
  qr_code_url: text('qr_code_url').notNull(),
  public_url: text('public_url').notNull().unique(),
  published_status: boolean('published_status').default(false).notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

/**
 * Memorial requests table - stores pending and processed memorial requests
 */
export const memorial_requests = pgTable('memorial_requests', {
  id: uuid('id').primaryKey().defaultRandom(),
  requester_name: text('requester_name').notNull(),
  requester_email: text('requester_email').notNull(),
  loved_one_name: text('loved_one_name').notNull(),
  birth_date: date('birth_date'),
  death_date: date('death_date'),
  story_notes: text('story_notes').notNull(),
  media_uploads: jsonb('media_uploads').default([]).notNull(),
  location_info: text('location_info'),
  latitude: decimal('latitude', { precision: 10, scale: 8 }),
  longitude: decimal('longitude', { precision: 11, scale: 8 }),
  tier_selected: text('tier_selected').notNull(), // 'tier_1_marked', 'tier_2_remembered', 'tier_3_enduring'
  preservation_addon: boolean('preservation_addon').default(false).notNull(),
  preservation_billing_cycle: text('preservation_billing_cycle'), // 'monthly' or 'yearly'
  discount_requested: boolean('discount_requested').default(false).notNull(),
  discount_type: text('discount_type'), // 'military', 'first_responder'
  documentation_upload: text('documentation_upload'),
  payment_status: text('payment_status').default('pending').notNull(), // 'pending', 'completed', 'failed'
  payment_amount: decimal('payment_amount', { precision: 10, scale: 2 }).notNull(),
  stripe_payment_id: text('stripe_payment_id'),
  request_status: text('request_status').default('submitted').notNull(), // 'submitted', 'under_review', 'approved', 'published', 'rejected'
  country: text('country'), // Country name or code
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
