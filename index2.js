const azureUtils  = require('./AzureUtils.js')

/* FIX
const capitalizeRepos = async () => {
  const repoList = await azureUtils.getRepos();

   Promise.allSettled(
    repoList.map(async (repo) => {
      const repoRef = await azureUtils.getRefs(repo.url);
      //console.log('ref ',repoRef);

      const repoStats = await azureUtils.getBranchStats(repo.url)
      //console.log('stats ',repoStats);
	  
	  return [repo, repoRef, repoStats]

    })
  ).then((all) => {
	let promise = all[0]
	
	if(promise.status = 'fulfilled'){
		processResults(promise.value[0], promise.value[1], promise.value[2]);
	}
	
  })
  .catch((error) => {
    console.log('Error:');
    console.log(error);
  });

}*/

const capitalizeRepos = async () => {
  const repoList = await azureUtils.getRepos();

   Promise.allSettled(
    repoList.map(async (repo) => {
      const repoRef = await azureUtils.getRefs(repo.url);
      const repoStats = await azureUtils.getBranchStats(repo.url)
	  
	  processResults(repo, repoRef, repoStats);

    })
  );

}

/* FIX
function promisseProcces(promiseAll){

	for(let h in promiseAll) {
		for(let i in h) {
			console.log('promiseAll ', i.value[0]);
		}
	}
}
*/

capitalizeRepos();

function processResults(repositorie, branchs, stats){
	
	let processed = [];
	for(let i = 0; i < stats.length; i++) {		
		if(!repositorie.name.includes('SFA-CLIENTE') && 
			!repositorie.name.includes('SFA-LEGACY-Sim3g')){
			//console.log('repositorie not satisfy ',repositorie.name);
			continue;
		}
		
	   let branch = branchs.find(branch => branch.name.includes(stats[i].name));
		
		// to WorkBook
		let row = {
			"repositorie" : repositorie.name,
			"lastUpdate" : repositorie.project.lastUpdateTime,
			"lastCommit" : ( stats[i] != null ? stats[i].commit.committer.date : ""),
			"url" : repositorie.remoteUrl,
			"size" : repositorie.size,
			"branch" : stats[i].name,
			"ref" : ( branch != null ? branch.name : ""),
			"statUses" : ( branch != null ? branch.statuses : ""),
			"commitsAhead":  ( stats[i] != null ? stats[i].aheadCount : ""),
			"commitsBehind": ( stats[i] != null ? stats[i].behindCount : "")
		}
		
		processed.push(row);
		console.log('row ',row);
	}
	
}