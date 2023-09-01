const azureUtils  = require('./AzureUtils.js')
const miscUtils  = require('./MiscUtils.js')
const propertiesReader = require('properties-reader');

const params = process.argv.slice(2);

var branch_file_name= '';
var branch_prefix_exclude= [];
var repo_prefix_exclude= [];

function init(){
	let properties = propertiesReader('config.properties');
	branch_prefix_exclude = (properties.get('branch_prefix_exclude') != null ? properties.get('branch_prefix_exclude').split(",") : []);
	repo_prefix_exclude = (properties.get('repo_prefix_exclude') != null ? properties.get('repo_prefix_exclude').split(",") : []);
	branch_file_name = properties.get('branch_file_name');
}

const capitalizeRepos = async () => {
	var repoList = [];

	try {
		 repoList = await azureUtils.getRepos();
	} catch (err) {
		console.log('catch repo list: ', err);
	}
	Promise.allSettled(
		repoList.map(async (repo) => {
			try {
				miscUtils.sleep(500).then(() => {});
				//simple delay
				var repoRef = await azureUtils.getRefs(repo.url);
				var repoStats = await azureUtils.getBranchStats(repo.url);

				return [repo, repoRef, repoStats];
			} catch (err) {
				console.log('catch: ', err);
			}
		})
	).then((all) => {
		promisseProcess(all);	
	})
	.catch((error) => {
		console.log('catch block: ', error);
	});
}

function promisseProcess(promiseAll){
	let processed = [];
	console.log("processing repositories...");
	params.forEach(arg => {
		if(arg.includes('branch')){
			processed = processed.concat(branchHeader());
		}else{
			processed = processed.concat(branchHeader());
		}
	});
	
	promiseAll.forEach(promise => {
		if(promise.status == 'fulfilled'){
			let res = processResults(promise.value[0], promise.value[1], promise.value[2]);
			if(res?.length > 0){
				processed = processed.concat(res);
			}
		}
	});
	
	const processedSorted = Object.keys(processed).map(function (key) {
		return processed[key];
		})
		.sort(function (itemA, itemB) {
		return itemA.repositorie < itemB.repositorie;
		});

	params.forEach(arg => {
		try {
			if(arg === 'xlsx'){
				miscUtils.toWorkBook(processedSorted);
			}else if(arg === 'csv'){
				miscUtils.toCSV(processedSorted);
			}else{		
				miscUtils.toWorkBook(processedSorted);			
			}
		} catch (error) {
			console.log(error);
		}
	});
}

function processResults(repositorie, branchs, stats){
	let processed = [];

	params.forEach(arg => {
		if(arg.includes('branch')){
			processed = branchAnalitcs(repositorie, branchs, stats);
		}else{
			processed = branchAnalitcs(repositorie, branchs, stats);
		}
	});
	
	return processed;
}

function branchHeader(){
	let processed = [];
	let headers = {};

	var data = require('fs').readFileSync('./headers.json', 'utf8');
	if(data){
		headers = JSON.parse(data.toString());
		processed.push(headers);
	}

	return processed;
}


function branchAnalitcs(repositorie, branchs, stats){
	let processed = [];
	let repoParam = undefined;

	params.forEach(arg => {
		if(arg.includes('repositorie')){
			repoParam= arg.replace('repositorie=','');
		}
	});

	stats.forEach(stat => {	
		if( (repoParam && !repositorie.name.toUpperCase().includes(repoParam.toUpperCase()))){
			//exclude repo not in param
			return;
		}
		
		var repoExcludes = repo_prefix_exclude.filter( repo => 
			!repositorie.name.toUpperCase().indexOf(repo.toUpperCase())
		);

		if(repoExcludes && repoExcludes.length > 0){
			//repo exclude
			return;
		}
		
		var branchExcludes = branch_prefix_exclude.filter( br => 
			!stat.name.toUpperCase().indexOf(br.toUpperCase())
		);

		if(branchExcludes && branchExcludes.length > 0){
			//branch exclude
			return;
		}
		
		let branch = branchs.find(branch => branch.name.toUpperCase().indexOf(stat.name.toUpperCase()));
		if(!branch || branch.length < 1){
			//unknown refs
			return;
		}

		let row = {
			"repositorie" : repositorie.name,
			"url" : repositorie.remoteUrl,
			"size" : miscUtils.formatBytes(repositorie.size, 2),
			"branch" : ( stat !== null ? stat.name : "N/A"),
			"isBaseVersion": ( stat !== null ? String(stat.isBaseVersion) : "N/A"),
			//"ref" : ( branch != null ? branch.name : ""),			
			"repoLastUpdate" : miscUtils.formatDate(repositorie.project.lastUpdateTime),
			"lastCommit" : ( stat !== null ? miscUtils.formatDate(stat.commit.committer.date) : "N/A"),
			"lastBuild" : 	( branch !== null && branch.statuses[0] ? miscUtils.formatDate(branch.statuses[0].creationDate) : "N/A"),
			"commitsAhead":  ( stat !== null && stat.aheadCount !== '' ? stat.aheadCount : "N/A"),
			"commitsBehind": ( stat !== null && stat.behindCount !== '' ? stat.behindCount : "N/A")
		};
		
		processed.push(row);
	});
	
	return processed;
}

try{
	init();
	capitalizeRepos();
} catch(error){
	throw error;
}
