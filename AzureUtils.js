var axios = require('axios').default;
var propertiesReader = require('properties-reader');

let user = '';
let token = '';
let base_url = '';
let base_path = '';
let API_VERSION = "api-version=6.0";

init();

function init(){
	let properties = propertiesReader('config.properties');
	user = properties.get('user');
	token = properties.get('token');
	base_url = properties.get('base_url');
	base_path =   properties.get('base_path');
}

var configDefault = {
  method: 'get',
  url: null, // Setar 
  headers: { 
    'Authorization': 'Basic ' + new Buffer(user + ':' + token).toString('base64')
  }
};

function getCleanName(branch){
	let refs = 'refs/';
	if(branch && branch.includes(refs)){
		return branch.substr(branch.lastIndexOf('/', 0), branch.length);
	}
	return branch
}

function executeRequest(config) {
    return new Promise((resolve, reject) =>{
        axios(config)
            .then(function (response) {            
                resolve(response.data.value);    
            })
            .catch(function (error) {
                //console.log('error ', error.message);
				reject(error.message);
            });
    })
}

const getRepos = async () => {
	let path = '/repositories?recursionLevel=Full&includeDeleted=false&includeLinks=true&';
		
	var config = configDefault;
    config.url = base_url + path + API_VERSION;

    return executeRequest(config);
}

const getRefs = async (repositorie) => {
	let path = '/refs?latestProcessedChange=true&includeStatuses=true&latestStatusesOnly=true&includeLinks=true&';
	var config = configDefault;
    config.url = repositorie + path + API_VERSION;

    return executeRequest(config);
}

const getBranchStats = async (repositorie) => {
	let path = '/stats/branches?';
	var config = configDefault;
    config.url = repositorie + path + API_VERSION;

    return executeRequest(config);
}

module.exports = { getRepos , getRefs ,getBranchStats }