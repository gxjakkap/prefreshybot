import { db } from "../db";
import { staffs } from "../db/schema";
import { fetchPublicSheetFromAPI } from "./sheet";

export const insertNewStaffs = async () => {
    console.log("[insertNewStaffs] Checking for new staff members");
    const sheetData = await fetchPublicSheetFromAPI(process.env.SHEET_ID!, process.env.SHEET_NAME!);
    console.log(sheetData)
    const existingStaff = await db.select().from(staffs);
    const existingStaffIds = existingStaff.map((staff) => staff.studentId);
    const newStaff = sheetData.filter((staff) => !existingStaffIds.includes(staff.studentId));
    if (newStaff.length === 0) {
        console.log("[insertNewStaffs] No new staff members found");
        return;
    }
    console.log(`[insertNewStaffs] Inserting ${newStaff.length} new staff members`);
    await db.insert(staffs).values(newStaff);
    console.log(`[insertNewStaffs] Inserted ${newStaff.length} new staff members`);
}   