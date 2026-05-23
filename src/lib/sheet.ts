export const fetchPublicSheetFromAPI = async (sheetId: string, sheetName: string) => {
    const baseUrl = 'https://sheet.spacet.me'
    const endpoint = `${baseUrl}/${sheetId}/${sheetName}.json`
    const { values } = await fetch(endpoint)
        .then(response => {
            if (!response.ok) {
                throw new Error('Unable to load data from ' + endpoint)
            }
            return response.json() as Promise<{ values: string[][] }>
        })
    const [header, ...rows] = values
    if (!header) throw new Error('Sheet is empty or missing a header row')
    return rows.map(row => {
        const entries = header.map((key: string, i: number) => [key, row[i]])
        return Object.fromEntries(entries)
    })
}