const xl = require('excel4node');

const formatBytes = (bytes, decimals = 2) =>  {
    if (!+bytes) return '0 Bytes'

    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

const formatDate = (date, opts) =>  {
	var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
	var today  = new Date(date);
	//console.log(today.toLocaleDateString("pt-BR"));
	if(opts){
		return today.toLocaleDateString("pt-BR",options);
	}else{
		return today.toLocaleDateString("pt-BR");
	}
}

function firstCommit(commits) {
	var min_dt = commits[0].commit.committer.date ,
	min_dtObj = new Date(commits[0].commit.committer.date);
	console.log('here');
	commits.forEach(function(item, index){
		if ( new Date( item.commit.committer.date ) < min_dtObj) {
			min_dt =  item.commit.committer.date;
			min_dtObj = new Date( item.commit.committer.date);
		}
	});
	  
	return min_dt;
}

const toWorkbook = (results) =>  {
	const wb = new xl.Workbook();
	const ws = wb.addWorksheet('Branchs SFA-CLIENTE');

    const headingColumnNames = results[0];
	let result = [];
	let columns=0;
	let headingColumnIndex = 1;
	let rowIndex = 1
		
	/*for(var i in headingColumnNames){
		columns++;
		result.push([i, headingColumnNames [i]]);
        //ws.cell(1, headingColumnIndex++).string(headingColumnNames [i]);
	}*/

	results.forEach(branch => {
		let columnIndex = 1;
		for(var i in headingColumnNames){
			if(branch[i]){
				ws.cell(rowIndex, columnIndex).string(String(branch[i]));
			}
			columnIndex++;
		}
		rowIndex++;
	});
	
	/*
    // insere Quantidade total de repositorys
    ws.cell(1, 4).string("Quantidade total repositorys: ");
    ws.cell(1, 5).number(listBranchsAllClients.length);

    var qtdBranches = 0;
    listBranchsAllClients.forEach(obj => {
        obj.branches.forEach(branch => {
            qtdBranches++;
        });
    });

    // insere Quantidade total de branches de todos os repositories SFA-CLIENTE
    ws.cell(2, 4).string("Quantidade total de branches: ");
    ws.cell(2, 5).number(qtdBranches);
 */
    wb.write('Branchs-SFA-CLIENTE.xlsx');
}


module.exports = { formatBytes, formatDate, firstCommit, toWorkbook }