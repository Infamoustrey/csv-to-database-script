
/*
 
 Script Created to read data from a CSV file and Upload it to a database
 
*/

// Imports
let fs = require('fs');
let moment = require('moment');
let chokidar = require('chokidar');
let knex = require('knex')({
    client: 'mssql',
    connection: {
        host : 'server',
        user : 'username',
        password : 'password',
        database : 'database'
    }
});

chokidar.watch('\\\\network\\path').on('add', (event, path) => {
    readAndUpdateDB(event);
});

function readAndUpdateDB(filename){

    let lineReader = require('readline').createInterface({
        input: fs.createReadStream( filename )
    });
    
    let inserts = [];
    
    // Read CSV 
    
    lineReader.on('line', function (line) {
        line = line.replace(/['"]+/g, '')
        line = line.replace(/[-]+/g, '')
        line = line.replace(',,', ',')
        //console.log('Line from file:', line);
    
        line = line.split(',').filter(col => col!='');
    
        if(line.length == 6){ console.log(line.join(' | ')); }
        else { console.error(line.join(' | ')) }
    
        if(line[3].length != 7){
            console.error('Error: ', line[3])
        }
    
        if(isNaN(line[4])){
            console.error('Error: ', line[4])
        }
    
        let rpDate = filename.split('\\')[filename.split('\\').length-1].split('.')[0]

        inserts.push({
            date: moment(rpDate).format('MM-DD-YYYY'),
            id: parseInt(line[0]),
            first_name: line[1],
            last_name: line[2],
            secondary_id: line[3],
            number: parseFloat(line[4]),
            description: line[5],
            date:  moment(line[6], 'MM/DD/YYYY').format('MM-DD-YYYY')
        })
    
    });
    
    // Upload to Table 
    lineReader.on('close', () => {
    
        knex('tablename')
            .insert(inserts)
            .then(rows => {
				console.log('Success! Rows Affected: '+rows)
            })
            .catch(error => {console.error(error); process.exit(1);})
    
    })
    
}


