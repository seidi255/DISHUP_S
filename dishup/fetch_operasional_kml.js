import fs from 'fs';
import https from 'https';
import { DOMParser } from 'xmldom';
import { kml } from '@tmcw/togeojson';

const maps = [
    { id: '11TrHgtSpSPpESu1T7r3vpAZUw_HdfCc', name: 'area_1' },
    { id: '1qxkd2mVM7p1Z-ToyClJ9qLx-1moW-Rc', name: 'area_2' }
];

const downloadKml = (mid) => {
    return new Promise((resolve, reject) => {
        const url = `https://www.google.com/maps/d/kml?mid=${mid}&forcekml=1`;
        https.get(url, (res) => {
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                // Handle redirection
                https.get(res.headers.location, (redirectRes) => {
                    let data = '';
                    redirectRes.on('data', chunk => data += chunk);
                    redirectRes.on('end', () => resolve(data));
                }).on('error', reject);
            } else {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => resolve(data));
            }
        }).on('error', reject);
    });
};

const main = async () => {
    for (const m of maps) {
        console.log(`Downloading KML for ${m.name}...`);
        try {
            const kmlData = await downloadKml(m.id);
            const doc = new DOMParser().parseFromString(kmlData, 'text/xml');
            const geojson = kml(doc);

            // Add some default styling properties to the geojson features based on map
            const color = m.name === 'area_1' ? '#ef4444' : '#3b82f6'; // Red for map 1, Blue for map 2

            if (geojson && geojson.features) {
                geojson.features = geojson.features.map(f => ({
                    ...f,
                    properties: {
                        ...f.properties,
                        color: color,
                        mapName: m.name === 'area_1' ? 'Area Pengawasan 1' : 'Area Pengawasan 2'
                    }
                }));
            }

            fs.writeFileSync(`src/assets/${m.name}.json`, JSON.stringify(geojson, null, 2));
            console.log(`Successfully converted ${m.name}.json`);
        } catch (e) {
            console.error(`Error processing ${m.name}:`, e);
        }
    }
};

main();
