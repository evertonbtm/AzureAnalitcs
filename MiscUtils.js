

const formatBytes = (bytes, decimals = 2) =>  {
    if (!+bytes) return '0 Bytes'

    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
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

module.exports = { formatBytes , firstCommit}