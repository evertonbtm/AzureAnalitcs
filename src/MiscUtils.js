const xl = require('excel4node');
const csvUtil = require('json-2-csv');

const formatBytes = (bytes, decimals = 2) =>  {
    if (!+bytes) return '0 Bytes'

    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

function sleep (time) {
	return new Promise((resolve) => setTimeout(resolve, time));
}

const formatDate = (date, opts) =>  {
	var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
	var today  = new Date(date);

	if(opts){
		return today.toLocaleString(options);
	}

	return today.toLocaleDateString();	
}

function firstCommit(commits) {
	var min_dt = commits[0].commit.committer.date ,
	min_dtObj = new Date(commits[0].commit.committer.date);

	commits.forEach(function(item, index){
		if ( new Date( item.commit.committer.date ) < min_dtObj) {
			min_dt =  item.commit.committer.date;
			min_dtObj = new Date( item.commit.committer.date);
		}
	});
	  
	return min_dt;
}

const toWorkBook = (results) =>  {	
	console.log("generating xlsx file...");
	const wb = new xl.Workbook();
	const ws = wb.addWorksheet('Branchs');

    var headingColumnNames =  results[0];
	let rowIndex = 1;

	var title = wb.createStyle({
			font: {
				name: 'Cambria',
				size: 14,
				color: '#000000',
				fgColor: '#F8F5EE'
			},
			alignment: {
				vertical: 'center'
			}
	});
	
	results.forEach(branch => {
		let columnIndex = 1;
		for(var columnName in headingColumnNames){
			if(branch[columnName]){
				if(rowIndex == 1){					
					ws.cell(rowIndex, columnIndex).style(title).string(String(branch[columnName]));
				}else{
					ws.cell(rowIndex, columnIndex).string(String(branch[columnName]));
				}
			}
			columnIndex++;
		}
		rowIndex++;
	});

    wb.write('output/Branchs.xlsx');
}

const toCSV = (results) =>  {	
	console.log("generating csv file...");
    
	var headingColumnNames =  results[0];
	let rowIndex = 1;
	var fs = require('fs');
	var stream = fs.createWriteStream("output/Branchs.csv");
	var appender = ';';
	var linebreak = '\n';

	stream.once('open', function(fd) {
		results.forEach(branch => {
			let columnIndex = 1;
			for(var columnName in headingColumnNames){
				if(branch[columnName]){
					stream.write(String(branch[columnName]));
					stream.write(appender);
				}
				columnIndex++;
			}
			stream.write(linebreak);
			rowIndex++;
		});
		stream.end();
	});
}

module.exports = { sleep, formatBytes, formatDate, firstCommit, toWorkBook, toCSV }