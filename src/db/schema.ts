import { relations } from "drizzle-orm";
import {
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

const timestamps = {
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true })
    .notNull()
    .defaultNow(),
  deletedAt: timestamp("deleted_at", { mode: "date", withTimezone: true }),
};

export const locations = pgTable(
  "locations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    description: text("description"),
    ...timestamps,
  },
  (table) => [
    index("locations_deleted_at_idx").on(table.deletedAt),
    index("locations_name_idx").on(table.name),
  ],
);

export const admins = pgTable(
  "admins",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull(),
    passwordHash: text("password_hash").notNull(),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("admins_email_idx").on(table.email),
    index("admins_deleted_at_idx").on(table.deletedAt),
  ],
);

export const infiniteImages = pgTable(
  "infinite_images",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    imageUrl: text("image_url").notNull(),
    description: text("description"),
    locationId: uuid("location_id").references(() => locations.id, {
      onDelete: "set null",
    }),
    ...timestamps,
  },
  (table) => [
    index("infinite_images_deleted_at_idx").on(table.deletedAt),
    index("infinite_images_location_id_idx").on(table.locationId),
    index("infinite_images_created_at_idx").on(table.createdAt),
  ],
);

export const locationsRelations = relations(locations, ({ many }) => ({
  images: many(infiniteImages),
}));

export const infiniteImagesRelations = relations(infiniteImages, ({ one }) => ({
  location: one(locations, {
    fields: [infiniteImages.locationId],
    references: [locations.id],
  }),
}));

export type Location = typeof locations.$inferSelect;
export type NewLocation = typeof locations.$inferInsert;
export type Admin = typeof admins.$inferSelect;
export type NewAdmin = typeof admins.$inferInsert;
export type InfiniteImage = typeof infiniteImages.$inferSelect;
export type NewInfiniteImage = typeof infiniteImages.$inferInsert;
