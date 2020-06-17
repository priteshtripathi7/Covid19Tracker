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
