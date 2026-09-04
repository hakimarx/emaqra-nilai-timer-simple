const username = 'gayungan';
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwYXNzd29yZCI6IjQyNDg4NjcxOGI5NDQ2MDBmZjU2MTY0OTRjM2NhZWVhIiwiaWF0IjoxNzc5MzU1OTQ4fQ.vqOSf0TdAvYf-ZnLWQknQ7QvKRUJ0tyoW_WAEzxhee0';

async function testCombination(name, headers) {
    try {
        const response = await fetch('https://quran-api.lpmqkemenag.id/api-alquran/ayat/local/1', { headers });
        const data = await response.json();
        console.log(`--- Combination ${name} ---`);
        console.log("Status:", response.status);
        console.log("Data snippet:", JSON.stringify(data, null, 2).slice(0, 500));
    } catch (e) {
        console.log(`--- Combination ${name} failed ---`, e.message);
    }
}

async function run() {
    await testCombination('A: user & Authorization', {
        'user': username,
        'Authorization': token
    });
    await testCombination('B: user & Authorization Bearer', {
        'user': username,
        'Authorization': 'Bearer ' + token
    });
    await testCombination('C: username & Authorization', {
        'username': username,
        'Authorization': token
    });
    await testCombination('D: username & Authorization Bearer', {
        'username': username,
        'Authorization': 'Bearer ' + token
    });
    await testCombination('E: user & token', {
        'user': username,
        'token': token
    });
}

run();
