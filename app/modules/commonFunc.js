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

export function parseData(data){
    return data.split(',').join('');
}
