/**
 * Takes a number and returns the formatted number of the form 3,55,454
 * @param {number/string} : number to be formatted
 * @returns {string} : formatted number
 */
export function formatNumber(number){

    let numberStr =  number.toString();
    let ans = '';
    let hundredsPassed =  false;
    let count = 0;
    for(let iterator = numberStr.length - 1; iterator >= 0;  iterator--){
        if(hundredsPassed){
            count++;
            ans = ans + numberStr[iterator];
            if(count === 2){
                ans = ans + ',';
                count = 0;
            }
        }else{
            count++;
            ans = ans + numberStr[iterator];
            if(count === 3){
                ans = ans + ',';
                hundredsPassed = true;
                count = 0;
            }
        }
    }

    ans = ans[ans.length - 1] === ',' ? ans.slice(0, ans.length - 1) : ans;
    return ans.split("").reverse().join("");
}

/**
 * Takes a number with ',' and returns without ','
 * @param data : number to be parsed
 * @returns {string} : returned cleaned number
 */
export function parseData(data){
    return data.split(',').join('');
}

/**
 * Generates a download event
 * @param filename : required file name to be saved as
 * @param data : text to be written in the file
 */
export function generateDownload(filename = 'report.pdf', data){

    let elem = document.createElement('a');
    elem.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(data));
    elem.setAttribute('download', filename);

    elem.style.display = 'none';
    document.body.appendChild(elem);

    elem.click();

    document.body.removeChild(elem);
}

/**
 * Scrolls into view of the last division of the char box
 */
export function scrollIntoNewElementView(){
    const chatBox = document.querySelector('#chatBox');
    const nodes = chatBox.querySelectorAll(':scope > div');
    nodes[nodes.length-1].scrollIntoView();
}

/**
 * Adds qestion to the chat box
 * @param question : result data of the API fetch
 * @param idNum : required to keep track of total number of questions
 */
export function addQuestionToDOM(question, idNum){

    let html;
    const chatBox = document.querySelector('#chatBox');
    if(question.type === 'single'){

        html = `
            <div class="col-sm-6">
                <div>
                    <p class="chatMssg">${question.text}</p>
                </div>
                <div id="question_${idNum}">
                    <input question-id="${question.items[0].id}" onclick="angular.element(this).scope().singleAnswer(event)" type="button" name="${question.items[0].choices[0].id}" class="btn option " value="${question.items[0].choices[0].label}">
                    <input question-id="${question.items[0].id}" onclick="angular.element(this).scope().singleAnswer(event)" type="button" name="${question.items[0].choices[1].id}" class="btn option" value="${question.items[0].choices[1].label}">
                </div>
            </div>
        `;

    }else if(question.type === 'group_single'){
        html = `
            <div class="col-sm-6">
                <div>
                    <p class="chatMssg">${question.text}</p>
                </div>
                <div id="question_${idNum}">`;

        for(let itemNum in question.items){
            const item = question.items[itemNum];
            let inputElem = `<input question-id="${item.id}" onclick="angular.element(this).scope().groupSingleAnswer(event)" type="button" class="btn option" value="${item.name}">`
            html = html + inputElem;
        }

        html = html + `
                </div>
            </div>`;

    }else if(question.type === 'group_multiple'){
        html = `
            <div class="col-sm-6">
                <div>
                    <p class="chatMssg">${question.text}</p>
                </div>
                <div id="question_${idNum}">
        `;

        for(let itemNum in question.items){
            const item = question.items[itemNum];
            let checkBoxElem = `
                                    <input id="${item.id}" type="checkbox" name="${question.text}" value="${item.name}">
                                    <label for="${item.id}"> ${item.name} </label><br>
                                `;

            html = html + checkBoxElem;
        }
        html = html + `
                    <input type="button" onclick="angular.element(this).scope().groupMultipleAnswer(event)" class="btn option" value="Next">
                </div>
            </div>
        `;

    }

    chatBox.insertAdjacentHTML('beforeend', html);

}

/**
 * Required to generate the final data report based on the users responses
 * @param data : response data of the API fetch
 */
export function printFinalReport(data){
    let html;
    const chatBox = document.querySelector('#chatBox');

    let caseType;

    if(data.triage_level === 'no_risk' || data.triage_level === 'self_monitoring')
        caseType = 'Safe';
    else if(data.triage_level === 'quarantine')
        caseType = 'Mild';
    else
        caseType = 'Danger';

    html = `
        <div class="finalReport${caseType}">
            <div class="reportHeading${caseType}">
                <div style="font-size: 32px; text-align: center"> ${data.label} </div>
                <div style="font-size: 24px"> ${data.description} </div>
            </div>
            <div class="reportSummary">
                ${ data.serious.length === 0 ? "" : "Below are some of your important responses:"}
                <ul>
    `;

    for(let iterator = 0; iterator < data.serious.length; iterator++){
        let symptom = data.serious[iterator];
        html = html + `<li> ${symptom.name} </li>`;
    }

    html = html + `
                </ul>
            </div>
        </div>`;

    chatBox.insertAdjacentHTML('beforeend', html);
}

/**
 * Prints no result found in the city data
 * @param searchText
 */
export function noResultFound(searchText){
    const dataDiv = document.querySelector('#cityData');
    const html = `
        <div class="noResult">
            <div class="noResultHeading">
                <div style="font-size: 32px; text-align: center"> No Result Found for ${searchText}!</div>
            </div>
        </div>
    `;

    dataDiv.insertAdjacentHTML('beforeend', html);
}

/**
 * Prints the city data in required div
 * @param searchText
 * @param data
 * @param resources
 */
export function putCityData(searchText, data, resources){
    const dataDiv = document.querySelector('#cityData');
    let html = '';

    html = html + `
        <div id="pageTitle" style="font-size: 30px">
            ${searchText} Covid19 Data
        </div>
    `;
    html = html + `<div class="row">`;
    for(let item in data){
        html = html + `
          <div id="countryData" class="col ${data[item].CSS}">
        
            <h5>${data[item].CASE_TYPE}</h5>
            <h3 style="font-weight: bold">${data[item].CASE_COUNT}</h3>
        
          </div>
        `;
    }
    html = html + `</div>`;

    html = html + `
            <div class="row" id="resourcesDiv">
                <div  style="text-align: center">
                    <h1 style="text-align: center; font-size: 24px">Resources</h1>
                </div>
        `;
    const maxInd = resources.length > 5 ? 5 : resources.length;
    for(let iterator = 0; iterator < maxInd; iterator++){
        html = html + `
            <div class="resource col-12 resourceBar">
                <ul>
                <li><b>Category</b>:  ${resources[iterator].CATEGORY}</li>
                <li><b>Description</b>:  ${resources[iterator].DESCRIPTION}</li>
                <li><b>Organisation</b>:  ${resources[iterator].ORGANISATION}</li>
                <li><b>Contact</b>:  ${resources[iterator].CONTACT}</li>
                <li><b>Phone</b>:  ${resources[iterator].PHONE}</li>
                </ul>
            </div>
        `;
    }

    html = html + `</div>`;

    html = html + `
        <div class="resource col-12 resourceBar" style="text-align: center; font-size: 20px">
            <p>For list of complete resources, Please check your state wise report.</p>
        </div>
    `;
    dataDiv.insertAdjacentHTML('beforeend', html);
}