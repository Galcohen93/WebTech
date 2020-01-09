function getColType(table, col) {
    let val1 = table.rows[1].getElementsByTagName("td")[col].textContent.toLowerCase();
    
    let date = Date.parse(val1);
    if (!isNaN(date)) {
        return "date";
    }

    let int = parseInt(val1);
    if (!isNaN(int)) {
        return "number";
    }
    
    return "string";
}

function getCell(row, col) {
    let content = row.getElementsByTagName("td")[col].textContent.toLowerCase();

    let date = Date.parse(content);
    if (!isNaN(date)) {
        return date;
    }

    let int = parseInt(content);
    if (!isNaN(int)) {
        return parseInt(content);
    }
    
    return content;
}
// Insertion sort O(n^2)
function sortTable(table, col = 0) {
    let rows, tbody, len, type, oneval, iminval, ival, jminval, jval;
    rows = table.rows;
    tbody = table.getElementsByTagName("tbody")[0];
    len = tbody.children.length;
    type = getColType(table, col);
    for (let i = 2; i <= len; i++) {
        oneval = getCell(rows[1], col);
        iminval = getCell(rows[i-1], col);
        ival = getCell(rows[i], col);
        if (ival < oneval) {
            tbody.insertBefore(rows[i], rows[1]);
        } else if (ival < iminval) {
            for (let j = 2; j < i; j++) {
                jminval = getCell(rows[j-1], col);
                jval = getCell(rows[j], col);
                if (ival > jminval && ival < jval) {
                    tbody.insertBefore(rows[i], rows[j]);
                }
            }
        }
        
    }
}

document.addEventListener("DOMContentLoaded", function(event) {
    let headers, nodes, table, col;
    headers = document.getElementsByTagName("th");
    for (let i = 0; i < headers.length; i++) {
        headers[i].onclick = function () {
            table = headers[i].parentElement.parentElement.parentElement;
            col = Array.prototype.indexOf.call(headers[i].parentNode.children, headers[i])
            sortTable(table, col);
        };
    }
});
