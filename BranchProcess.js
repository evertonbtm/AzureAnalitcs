const azureUtils  = require('./AzureUtils.js')
const miscUtils  = require('./MiscUtils.js')

const params = process.argv.slice(2);


const capitalizeRepos = async () => {
  const repoList = await azureUtils.getRepos();

	Promise.allSettled(
		repoList.map(async (repo) => {
			const repoRef = await azureUtils.getRefs(repo.url);
			const repoStats = await azureUtils.getBranchStats(repo.url);
			const repoVersion = await azureUtils.getVersionNotLegacy(repo.name, repo.url);
			
			return [repo, repoRef, repoStats, repoVersion];
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
		"coreVersion": "Versão core",
		"clienteVersion": "Versão cliente",
		"isBaseVersion": "Branch base",
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
			let res = processResults(promise.value[0], promise.value[1], promise.value[2], promise.value[3]);
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

function processResults(repositorie, branchs, stats, xmlVersion){
	
	let version = miscUtils.getXmlVersion(xmlVersion);
	
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
		
		let stat = stats.find(stat => branch.name.replace('refs/heads/','') == stat.name);
		
		if(!stat){
			//unknown refs
			return;
		}

		let row = {
			"repositorie" : repositorie.name,
			"url" : repositorie.remoteUrl,
			"size" : miscUtils.formatBytes(repositorie.size, 2),
			"branch" : ( stat != null ? stat.name : ""),
			"coreVersion": (version != null && stat.name == 'master' ? version['core.version']._text : "" ),
			"clienteVersion": (version != null && stat.name == 'master' ? version['cliente.version']._text : "" ),
			"isBaseVersion": ( stat != null ? String(stat.isBaseVersion) : "sem dados"),
			//"ref" : ( branch != null ? branch.name : ""),			
			"repoLastUpdate" : miscUtils.formatDate(repositorie.project.lastUpdateTime),
			"lastCommit" : ( stat != null ? miscUtils.formatDate(stat.commit.committer.date) : ""),
			"lastBuild" : 	( branch != null && branch.statuses[0] ? miscUtils.formatDate(branch.statuses[0].creationDate) : "Não executado"),
			"commitsAhead":  ( stat != null && stat.aheadCount != '' ? stat.aheadCount : "sem dados"),
			"commitsBehind": ( stat != null && stat.behindCount != '' ? stat.behindCount : "sem dados")
		};
		
		processed.push(row);
	});
	
	return processed;
}