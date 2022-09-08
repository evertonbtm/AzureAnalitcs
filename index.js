var axios = require('axios').default;

const xl = require('excel4node');
const wb = new xl.Workbook();
const ws = wb.addWorksheet('Branchs SFA-CLIENTE');

var API_VERSION = "?api-version=7.0";
var URL_REPOSITORIES = "https://totvstfs.visualstudio.com/Wealth-Systems/_apis/git/repositories/";
var PATH_GET_BRANCHES = "/refs/heads";

var configDefault = {
  method: 'get',
  url: null, // Setar 
  headers: { 
    'Authorization': 'Basic ZmVsaXBlLmJvY2huaWE6NmJoYWdya3M2c2NnaW50b2pmNTJjZHp1aGJleWlxaHQ3cGl3bGxubXVldmh2ZDZneHlxcQ=='    
  }
};

var listSFAClient = [];
var listBranchsAllClients = [];

init();

function init() {
    getSFAClientList();    
}

function getSFAClientList() {
    var config = configDefault;
    config.url = URL_REPOSITORIES + API_VERSION;

    executeRequest(config)
        .then(function (value) {         
            value.forEach(element => {
                if (isSFACliente(element.name)) {            
                    listSFAClient.push(element);
                }
            }); 
        })
        .then(getBranchesByRepository);
}

function getBranchesByRepository() {
    var config = configDefault;

    listSFAClient.forEach(repository => {
        config.url = URL_REPOSITORIES + repository.id + PATH_GET_BRANCHES + API_VERSION;
        //console.log("REPOSITORY: "+ repository.name); 

        var listBranches = [];

        executeRequest(config)
            .then(function(value) {
                value.forEach(branch => {
                    listBranches.push(branch);            
                }); 

                var obj = {};  
                obj.repository = repository;
                obj.branches = listBranches;
        
                listBranchsAllClients.push(obj);
            })
            .then(gerarPlanilha);
    });    
}

function gerarPlanilha() {
    const headingColumnNames = [
        "REPOSITORY",
        "BRANCH"        
    ]
    let headingColumnIndex = 1; //diz que começará na primeira linha
    headingColumnNames.forEach(heading => { 
        // cria uma célula do tipo string para cada título
        ws.cell(1, headingColumnIndex++).string(heading);
    });

    let rowIndex = 2; //começa na linha 2

    var columnRepository = 1;
    var columnBranch = 2;

    listBranchsAllClients.forEach(obj => {
        obj.branches.forEach(branch => {
            ws.cell(rowIndex, columnRepository).string(obj.repository.name);
            ws.cell(rowIndex, columnBranch).string(getCleanBranchName(branch.name));    
            rowIndex++;
        });
    });

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

    wb.write('Branchs-SFA-CLIENTE.xlsx');
}

function getCleanBranchName(branchName) {
    return branchName.replace("refs/heads/", "");
}

function isSFACliente(name) {
    if (name.includes("SFA-CLIENTE-") || name == "SFA-LEGACY-Sim3g") {
        return true;
    }
    return false;
}

function executeRequest(config) {
    return new Promise(resolve =>{
        axios(config)
            .then(function (response) {            
                resolve(response.data.value);    
            })
            .catch(function (error) {
                console.log(error);
            });
    })
}