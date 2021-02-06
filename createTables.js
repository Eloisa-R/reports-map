import fs from 'fs';
import moment from 'moment';
import neatCsv from 'neat-csv';
import { v4 as uuidv4 } from 'uuid';
import sqlite3 from 'sqlite3';
sqlite3.verbose();
moment.locale('de');

const db = new sqlite3.Database('berlin_police_reports');

const getEmptyNeighbourhoodId = () => {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            const getStmt = `SELECT id
                             from neighbourhoods
                             where name = ?`;
            db.get(getStmt, 'N/A', (err, row) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(row.id)
                }
            });
        });
    });
};

const emptyNeighbourhoodId = await getEmptyNeighbourhoodId();


const createNeighbourhoodTable = () => {
    db.serialize(() => {
        db.run('CREATE TABLE IF NOT EXISTS neighbourhoods (id TEXT PRIMARY KEY, name TEXT)');
    });
}

const insertNeighbourhoods = () => {
    const neighbourhoods = [
        'berlinweit',
        'bezirksübergreifend',
        'Charlottenburg-Wilmersdorf',
        'Friedrichshain-Kreuzberg',
        'Marzahn-Hellersdorf',
        'Mitte',
        'Neukölln',
        'Pankow',
        'Reinickendorf',
        'Spandau',
        'Steglitz-Zehlendorf',
        'Tempelhof-Schöneberg',
        'Treptow-Köpenick'
    ]
    db.serialize(() => {
        const insertStmt = db.prepare('INSERT INTO neighbourhoods (id, name) VALUES (?,?)');
        neighbourhoods.forEach(name => {
            const id = uuidv4();
            insertStmt.run(id, name);
        })
        insertStmt.finalize();
    });
}

const selectNeighbourhoods = () => {
    db.serialize(() => {
        db.each('SELECT * from neighbourhoods', (error, row) => {
            console.log('id:', row.id, 'name: ', row.name);
        });
    });
    db.close();
};

const createIncidentsTable = () => {
    db.serialize(() => {
        db.run('CREATE TABLE IF NOT EXISTS incidents (case_id INTEGER PRIMARY KEY, publication_datetime TEXT, neighbourhood_id TEXT, title TEXT, description TEXT, FOREIGN KEY (neighbourhood_id) REFERENCES neighbourhoods(id))');
    });
}



const getNeighbourhoodMapping = name => {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            const getStmt = `SELECT id
                             from neighbourhoods
                             where name = ?`;
          db.get(getStmt, name, (err, row) => {
              if (err) {
                  reject(err)
              } else {
                  resolve(row? row.id: emptyNeighbourhoodId)
              }
          });
        });
    });
}

const insertIncidentData = async() => {
    const incidentsFile = fs.readFileSync('updated_data.csv', { encoding: 'UTF-8' });
    const incidentsData = await neatCsv(incidentsFile);
    db.serialize(async() => {
        const insertStmt = db.prepare('INSERT INTO incidents (case_id, publication_datetime, neighbourhood_id, title, description) VALUES (?,?,?,?,?)');
        for (const incident of incidentsData) {
           const { Datetime: date, Incident: title, Place: neighbourhood, 'Case Id': caseId,  'Full Description': description} =  incident;
            const formattedDate = moment(date, 'DD.MM.YYYY hh:mm').format();
            const neighbourhood_id = await getNeighbourhoodMapping(neighbourhood);
            insertStmt.run(caseId, formattedDate, neighbourhood_id, title.trim(), description.trim());
        }

    });

};

//createNeighbourhoodTable();
//insertNeighbourhoods();
//selectNeighbourhoods();
//createIncidentsTable();
//insertIncidentData();