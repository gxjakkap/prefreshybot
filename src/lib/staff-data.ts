import { db } from "../db";
import { staffs } from "../db/schema";
import { fetchPublicSheetFromAPI } from "./sheet";

/** Returns true only if the row has all required fields with valid, non-empty values. */
const isCompleteStaffRow = (row: Record<string, unknown>): boolean => {
    const { studentId, name, nickname, year, team } = row;

    if (
        !studentId || typeof studentId !== "string" || studentId.trim() === "" ||
        !name      || typeof name      !== "string" || name.trim()      === "" ||
        !nickname  || typeof nickname  !== "string" || nickname.trim()  === "" ||
        !team      || typeof team      !== "string" || team.trim()      === ""
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
    const existingStaffIds = existingStaff.map((staff) => staff.studentId);
    const newStaff = completeRows.filter((staff) => !existingStaffIds.includes(staff.studentId));

    if (newStaff.length === 0) {
        console.log("[insertNewStaffs] No new staff members found");
        return;
    }
    console.log(`[insertNewStaffs] Inserting ${newStaff.length} new staff members`);
    await db.insert(staffs).values(newStaff);
    console.log(`[insertNewStaffs] Inserted ${newStaff.length} new staff members`);
}   