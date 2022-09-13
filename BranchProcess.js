const azureUtils  = require('./AzureUtils.js')
const miscUtils  = require('./MiscUtils.js')

const params = process.argv.slice(2);


const capitalizeRepos = async () => {
  const repoList = await azureUtils.getRepos();

   Promise.allSettled(
    repoList.map(async (repo) => {
      const repoRef = await azureUtils.getRefs(repo.url);
      const repoStats = await azureUtils.getBranchStats(repo.url);
	  
	  return [repo, repoRef, repoStats];

    })
  ).then((all) => {
	promisseProcess(all);	
  })
  .catch((error) => {
    console.log('Error: ', error);
  });

}


/*
const capitalizeRepos = async () => {
  const repoList = await azureUtils.getRepos();

   Promise.allSettled(
    repoList.map(async (repo) => {
      const repoRef = await azureUtils.getRefs(repo.url);
      const repoStats = await azureUtils.getBranchStats(repo.url)
	  //const branchCommits = await azureUtils.getBranchStats(repo.url)
	  
	  processResults(repo, repoRef, repoStats);

    })
  );

}
*/


function promisseProcess(promiseAll){
	let processed = [];
	
	let headers = {
		"repositorie" : "Repositorio",
		"url" : "Url",
		"size" : "Tamanho",
		"branch" : "Branch",
		//"ref" : "Referência",		
		"repoLastUpdate" : "Repositorio Atualizado",
		"lastCommit" : "Ultimo commit",
		"lastBuild" : "Ultima pipeline",
		"commitsAhead":  "Commits à frente",
		"commitsBehind": "Commits atras"
	}
	processed.push(headers);
	
	promiseAll.forEach(promise => {
		if(promise.status == 'fulfilled'){
			let res = processResults(promise.value[0], promise.value[1], promise.value[2]);
			if(res && res.length > 0){
				//console.log('res', res);
				processed = processed.concat(res);
			}
		}
	});
	
	params.forEach(arg => {
		miscUtils.toWorkbook(processed);
		
		if(arg === 'planilha'){
			miscUtils.toWorkbook(processed);
		}		
		if(arg === 'txt'){
			
		}
	});
}


capitalizeRepos();

function processResults(repositorie, branchs, stats, commits){
	
	let customer = undefined;
	
	params.forEach(arg => {
		if(arg.includes('cliente')){
			customer= arg.replace('cliente=','');
		}
	});
	
	let processed = [];
	branchs.forEach(branch => {	
		if( (customer && !repositorie.name.toUpperCase().includes(customer.toUpperCase())) || 
			!repositorie.name.includes('SFA-CLIENTE') && !repositorie.name.includes('SFA-LEGACY-Sim3g')){
			//exclude
			return;
		}
		
		if(branch.name.includes('refs/tags/')){
			//fechamento versao
			return;
		}
		
		let stat = stats.find(stat => branch.name.replace('refs/heads/','') === stat.name);

		let row = {
			"repositorie" : repositorie.name,
			"url" : repositorie.remoteUrl,
			"size" : miscUtils.formatBytes(repositorie.size, 2),
			"branch" : ( stat != null ? stat.name : ""),
			//"ref" : ( branch != null ? branch.name : ""),			
			"repoLastUpdate" : repositorie.project.lastUpdateTime,
			"lastCommit" : ( stat != null ? stat.commit.committer.date : ""),
			"lastBuild" : ( branch != null && branch.statuses[0] ? branch.statuses[0].creationDate : "Não executado"),
			"commitsAhead":  ( stat != null && stat != '' ? stat.aheadCount : "sem dados"),
			"commitsBehind": ( stat != null && stat != '' ? stat.behindCount : "sem dados")
		};
		
		processed.push(row);
	});
	
	return processed;
}