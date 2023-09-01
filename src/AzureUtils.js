const axios = require('axios').default;
const propertiesReader = require('properties-reader');

let user = '';
let token = '';
let base_url = '';
let base_path = '';
let API_VERSION = '';

init();

function init(){
	let properties = propertiesReader('config.properties');
	user = properties.get('user');
	token = properties.get('token');
	base_url = properties.get('base_url');
	base_path =   properties.get('base_path');
	API_VERSION =  properties.get('api_version');
}

var configDefault = {
  method: 'get',
  url: null, 
  headers: { 
    Accept: 'application/json, text/plain, */*',
    'Authorization': 'Basic ' + Buffer.from(user + ':' + token).toString('base64')
  }
};

function getCleanName(branch){
	let refs = 'refs/';
	if(branch && branch.includes(refs)){
		return branch.substr(branch.lastIndexOf('/', 0), branch.length);
	}
	return branch;
}

function executeRequest(config) {
    return new Promise((resolve, reject) =>{
        axios(config)
            .then(function (response) { 
				if(response?.data?.value){
					//console.log('success ',config);
					resolve(response.data.value);    
				}else if(response?.data){
					//console.log('success', config);
					resolve(response.data);  
				}
            })
            .catch(function (error) {
				//skip permissions errors, requests, not_found, etc...
				//console.log('error ', config, error);
				resolve([]);
            });
    })
}

const getRepos = async () => {
	let path = '/repositories?recursionLevel=Full&includeDeleted=false&includeLinks=true';
		
	var config = configDefault;
    config.url = base_url + path + (API_VERSION && API_VERSION !== "" ? "&"+API_VERSION : API_VERSION);
	console.log("retrieving repositories...");
    return executeRequest(config);
}

const getRefs = async (repositorie) => {
	let path = '/refs?latestProcessedChange=true&includeStatuses=true&latestStatusesOnly=true&includeLinks=true';
	var config = configDefault;
    config.url = repositorie + path + (API_VERSION && API_VERSION !== "" ? "&"+API_VERSION : API_VERSION);
	//console.log("retrieving repo references for", repositorie);
	return executeRequest(config);
}

const getBranchStats = async (repositorie) => {
	let path = '/stats/branches?';
	var config = configDefault;
    config.url = repositorie + path + (API_VERSION && API_VERSION !== "" ? "&"+API_VERSION : API_VERSION);
	//console.log("retrieving branchs for ", repositorie);
    return executeRequest(config);
}

const getCommits = async (repositorie) => {
	let path = '/commits?changeCount=true';
	var config = configDefault;
    config.url = repositorie + path + (API_VERSION && API_VERSION !== "" ? "&"+API_VERSION : API_VERSION);
	//console.log("retrieving commits for repo: ", repositorie);
    return executeRequest(config);
}


module.exports = { getRepos , getRefs ,getBranchStats , getCommits }