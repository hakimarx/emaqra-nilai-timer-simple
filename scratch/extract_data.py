
import re
import json

def parse_sql(file_path):
    mutasyabihat = []
    surahs = []
    
    with open(file_path, 'r', encoding='latin1') as f:
        content = f.read()
        
    # Parse cekayatmutasyabihat
    mut_match = re.search(r"INSERT INTO `cekayatmutasyabihat` .*? VALUES\s*(.*?);", content, re.DOTALL)
    if mut_match:
        values = mut_match.group(1)
        # (id, juz, nosurat, ayat)
        rows = re.findall(r"\((\d+),\s*(\d+),\s*(\d+),\s*(\d+)\)", values)
        for r in rows:
            mutasyabihat.append({
                'id': int(r[0]),
                'juz': int(r[1]),
                'surah': int(r[2]),
                'ayat': int(r[3])
            })
            
    # Parse daftarsurah
    surah_match = re.search(r"INSERT INTO `daftarsurah` .*? VALUES\s*(.*?);", content, re.DOTALL)
    if surah_match:
        values = surah_match.group(1)
        # (id, kategori, nosurat, nama, awal, akhir)
        rows = re.findall(r"\((\d+),\s*(\d+),\s*(\d+),\s*'([^']*)',\s*(\d+),\s*(\d+)\)", values)
        for r in rows:
            surahs.append({
                'id': int(r[0]),
                'juz': int(r[1]), # kategori seems to be juz
                'surah': int(r[2]),
                'nama': r[3],
                'awal': int(r[4]),
                'akhir': int(r[5])
            })
            
    return mutasyabihat, surahs

mutasyabihat, surahs = parse_sql('d:/emaqra+timer + rekap nilai/emaqra.sql')

data = {
    'mutasyabihat': mutasyabihat,
    'surahs': surahs
}

with open('d:/emaqra+timer + rekap nilai/parsed_data.json', 'w') as f:
    json.dump(data, f)

print(f"Extracted {len(mutasyabihat)} mutasyabihat and {len(surahs)} surah ranges.")
