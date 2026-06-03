import { eq } from "drizzle-orm";
import { db } from "../db";
import { staffs } from "../db/schema";
import { fetchPublicSheetFromAPI } from "./sheet";

/** Returns true only if the row has all required fields with valid, non-empty values. */
const isCompleteStaffRow = (row: Record<string, unknown>): boolean => {
    const { studentId, name, nickname, year, team } = row;

    if (
        !studentId || typeof studentId !== "string" || studentId.trim() === "" ||
        !name || typeof name !== "string" || name.trim() === "" ||
        !nickname || typeof nickname !== "string" || nickname.trim() === "" ||
        !team || typeof team !== "string" || team.trim() === ""
    ) return false;

    // year must be a whole number (sheet values arrive as strings)
    const yearNum = Number(year);
    if (!year || isNaN(yearNum) || !Number.isInteger(yearNum)) return false;

    return true;
};

export const insertNewStaffs = async () => {
    console.log("[insertNewStaffs] Checking for new staff members");
    const sheetData = await fetchPublicSheetFromAPI(process.env.SHEET_ID!, process.env.SHEET_NAME!);

    const completeRows = sheetData.filter((row) => {
        if (isCompleteStaffRow(row)) return true;
        console.warn("[insertNewStaffs] Skipping incomplete row:", JSON.stringify(row));
        return false;
    });

    const existingStaff = await db.select().from(staffs);
    const existingByStudentId = new Map(existingStaff.map((s) => [s.studentId, s]));

    // insert
    const newStaff = completeRows.filter((row) => !existingByStudentId.has(row.studentId as string));

    if (newStaff.length > 0) {
        console.log(`[insertNewStaffs] Inserting ${newStaff.length} new staff members`);
        await db.insert(staffs).values(newStaff);
        console.log(`[insertNewStaffs] Inserted ${newStaff.length} new staff members`);
    } else {
        console.log("[insertNewStaffs] No new staff members found");
    }

    // update
    const mismatchedStaff = completeRows.filter((row) => {
        const existing = existingByStudentId.get(row.studentId as string);
        if (!existing) return false;

        return (
            existing.name !== row.name ||
            existing.nickname !== row.nickname ||
            existing.year !== Number(row.year) ||
            existing.team !== row.team
        );
    });

    if (mismatchedStaff.length > 0) {
        console.log(`[insertNewStaffs] Updating ${mismatchedStaff.length} staff member(s) with mismatched info`);
        await Promise.all(
            mismatchedStaff.map((row) => {
                const existing = existingByStudentId.get(row.studentId as string)!;
                console.log(
                    `[insertNewStaffs] Updating studentId=${row.studentId}:`,
                    `name: "${existing.name}" → "${row.name}",`,
                    `nickname: "${existing.nickname}" → "${row.nickname}",`,
                    `year: ${existing.year} → ${Number(row.year)},`,
                    `team: "${existing.team}" → "${row.team}"`,
                );
                return db
                    .update(staffs)
                    .set({
                        name: row.name as string,
                        nickname: row.nickname as string,
                        year: Number(row.year),
                        team: row.team as string,
                    })
                    .where(eq(staffs.studentId, row.studentId as string));
            }),
        );
        console.log(`[insertNewStaffs] Updated ${mismatchedStaff.length} staff member(s)`);
    } else {
        console.log("[insertNewStaffs] No mismatched staff info found");
    }
}