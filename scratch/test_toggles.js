const qiraatData = [
    { name: "Nafi'", narrators: ["Qolun", "Warsy"], files: ["01qolun.pdf", "02warsy.pdf"] },
    { name: "Ibnu Katsir", narrators: ["Al-Bazzi", "Qunbul"], files: ["03albazzi.pdf", "04qunbul.pdf"] },
    { name: "Abu 'Amr", narrators: ["Ad-Duri", "As-Susi"], files: ["05adduri.pdf", "06assusi.pdf"] },
    { name: "Ibnu 'Amir", narrators: ["Hisyam", "Ibnu Dzakwan"], files: ["07hisyam.pdf", "08ibnudzakwan.pdf"] },
    { name: "'Ashim", narrators: ["Syubah", "Hafsh"], files: ["09syubah.pdf", "10hafsh.pdf"] },
    { name: "Hamzah", narrators: ["Kholaf", "Khollad"], files: ["11kholaf.pdf", "12khollad.pdf"] },
    { name: "Al-Kisa'i", narrators: ["Abul Harits", "HafshadDuri"], files: ["13abulharits.pdf", "14hafshadduri.pdf"] },
    { name: "Abu Ja'far", narrators: ["Ibnu Wardan", "Ibnu Jammaz"], files: ["15ibnuwardan.pdf", "16ibnujammaz.pdf"] },
    { name: "Ya'qub", narrators: ["Ruwais", "Rawh"], files: ["17ruwais.pdf", "18rawh.pdf"] },
    { name: "Kholaf", narrators: ["Idris", "Ishaq"], files: ["19idris.pdf", "20ishaq.pdf"] }
];

const narratorTextConfigs = {
    "qolun": { jsonPath: "qaloon/data/QaloonData_v10.json", fontClass: "qaloon" },
    "warsy": { jsonPath: "warsh/data/warshData_v10.json", fontClass: "warsh" },
    "al-bazzi": { jsonPath: "bazzi/data/BazziData_v07.json", fontClass: "bazzi" },
    "qunbul": { jsonPath: "qumbul/data/QumbulData_v07.json", fontClass: "qumbul" },
    "ad-duri": { jsonPath: "doori/data/DooriData_v09.json", fontClass: "doori" },
    "as-susi": { jsonPath: "soosi/data/SoosiData09.json", fontClass: "soosi" },
    "syubah": { jsonPath: "shouba/data/ShoubaData08.json", fontClass: "shouba" },
    "hafsh": { jsonPath: "hafs/data/hafsData_v18.json", fontClass: "hafs" }
};

qiraatData.forEach((imam, index) => {
    const n1 = imam.narrators[0].toLowerCase();
    const n2 = imam.narrators[1].toLowerCase();
    const hasText1 = !!narratorTextConfigs[n1];
    const hasText2 = !!narratorTextConfigs[n2];
    const textAvailable = hasText1 && hasText2;
    console.log(`${index + 1}. Imam ${imam.name} (${imam.narrators[0]} | ${imam.narrators[1]}): Text Available = ${textAvailable}`);
    if (!textAvailable) {
       console.log(`   Missing text for: ${!hasText1 ? n1 : ''} ${!hasText2 ? n2 : ''}`);
    }
});
