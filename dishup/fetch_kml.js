import fs from 'fs';
import https from 'https';
import crypto from 'crypto';

const maps = [
    { id: '1FqdpIcmDEdYLmDROYOF0lbihqUFzv50', name: 'Map 1' },
    { id: '1NGoK-z9rs2UhT_5e59fsth8VpRk3F0s', name: 'Map 2' },
    { id: '1arVEW-_jrJfSTGEwORMXISCTHJUYkCI', name: 'Map 3' },
    { id: '1UCKxgT8L_mSa_MnoNI4tgvDl4CmgkNg', name: 'Map 4' }
];

const downloadKml = (mid) => {
    return new Promise((resolve, reject) => {
        const url = `https://www.google.com/maps/d/kml?mid=${mid}&forcekml=1`;
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
        }).on('error', reject);
    });
};

const parseKml = (xmlString, fallbackName) => {
    const placemarks = [];

    // Extract map name from Document>name
    let mapTitle = fallbackName;
    const nameMatch = xmlString.match(/<Document>\s*<name><!\[CDATA\[(.*?)\]\]><\/name>/);
    if (nameMatch) mapTitle = nameMatch[1];

    // Quick and dirty regex extraction for Plackemarks
    const pmRegex = /<Placemark>([\s\S]*?)<\/Placemark>/g;
    let pmMatch;
    while ((pmMatch = pmRegex.exec(xmlString)) !== null) {
        const pmContent = pmMatch[1];

        // Extract name
        let name = 'Unknown';
        const nm = pmContent.match(/<name>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/name>/);
        if (nm) name = nm[1];

        // Extract description
        let desc = '';
        const dm = pmContent.match(/<description>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/);
        if (dm) desc = dm[1];

        // Extract style
        let style = '';
        const sm = pmContent.match(/<styleUrl>#(.*?)<\/styleUrl>/);
        if (sm) style = sm[1];

        // Extract coordinates
        let coords = '';
        const cm = pmContent.match(/<coordinates>\s*(.*?)\s*<\/coordinates>/);
        if (cm) coords = cm[1];

        if (coords) {
            const parts = coords.trim().split(',');
            if (parts.length >= 2) {
                const lng = parseFloat(parts[0]);
                const lat = parseFloat(parts[1]);

                // Determine status based on style id common patterns in Google My Maps
                let status = 'aktif'; // default
                const sLower = style.toLowerCase();
                if (sLower.includes('db4436') || sLower.includes('red')) {
                    status = 'rusak';
                } else if (sLower.includes('f4eb37') || sLower.includes('ffea00') || sLower.includes('yellow')) {
                    status = 'perbaikan';
                } else if (sLower.includes('61') || sLower.includes('green') || sLower.includes('0f9d58')) {
                    status = 'aktif';
                }

                placemarks.push({
                    id: name,
                    alamat: desc.replace(/<[^>]+>/g, ' ').trim() || 'Lokasi PJU', // Strip html if any
                    kecamatan: mapTitle,
                    status: status,
                    tahun: new Date().getFullYear(), // Fallback
                    lat: lat,
                    lng: lng
                });
            }
        }
    }
    return placemarks;
};

const main = async () => {
    let allData = [];
    for (const m of maps) {
        console.log(`Downloading KML for ${m.name}...`);
        try {
            const kmlData = await downloadKml(m.id);
            const parsed = parseKml(kmlData, m.name);
            console.log(`Parsed ${parsed.length} items from ${m.name}`);
            allData = allData.concat(parsed);
        } catch (e) {
            console.error(`Error downloading ${m.name}:`, e);
        }
    }

    // Generate unique IDs if duplicates exist
    allData = allData.map((item, index) => {
        return {
            ...item,
            id: item.id === 'Unknown' ? `PJU-${index + 1}` : item.id + '-' + index
        };
    });

    fs.writeFileSync('src/assets/pju_data.json', JSON.stringify(allData, null, 2));
    console.log(`Successfully written ${allData.length} records to src/assets/pju_data.json`);
};

main();
