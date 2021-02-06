import sqlite3 from 'sqlite3';
sqlite3.verbose();

const db = new sqlite3.Database('berlin_police_reports');

const streetRegex = new RegExp(/[aA-zZ0-9öäüß/„“-]* ?((S|s)traße|(A|a)llee|(P|p)latz|(D|d)amm|(W|w)eg)/, 'g');
const publicTransportRegex = new RegExp(/(S-Bahnhof|(H|h)altestelle) ?(„?(A|a)m)? [aA-zZ0-9öäüß/„“-]*/, 'g')

const falseStreetMatches = [
    'Straße',
    'die Straße',
    'der Straße',
    'des Straße',
    'Richtung Straße',
    'der Allee',
    'die Allee',
    'Platz',
    'Richtung Platz',
    'Richtung Allee',
    'Arbeitsplatz',
    'Parkplatz',
    'unterweg'
];

const findAddresses = () => {
    const addressObj = {};
    db.serialize(() => {
        db.each('SELECT * from incidents LIMIT 50', (error, row) => {
            const streetNames = row.description.match(streetRegex) || [];
            const stationNames = row.description.match(publicTransportRegex) || [];
            const allMatches = [...streetNames, ...stationNames];
            const cleanedMatches = allMatches.filter(match => !falseStreetMatches.includes(match));
            addressObj[row.case_id] = new Set(cleanedMatches);
        });
    })
    db.close();
};

findAddresses();