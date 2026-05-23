import { integer, pgTable, serial, text } from "drizzle-orm/pg-core";

export const teams = pgTable("teams", {
    id: serial("id").primaryKey(),
    displayName: text("display_name").notNull(),
    slug: text("slug").unique().notNull(),
    roleId: text("role_id").unique().notNull(),
})

export const staffs = pgTable("staffs", {
    id: serial("id").primaryKey(),
    studentId: text("student_id").unique().notNull(),
    name: text("name").notNull(),
    nickname: text("nickname").notNull(),
    year: integer("year").notNull(),
    team: text("team").notNull(),
    userId: text("user_id").unique(),
})