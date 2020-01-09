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
    
    var reset = document.getElementById("reset");
    reset.addEventListener("click", resetTable);  
    
    var submit = document.getElementById("submit");
    submit.addEventListener("click", putTable);
    
    var refresh = document.getElementById("refresh");
    refresh.addEventListener("click", refreshTable);
    
    document.getElementById("top_selling_items_form").onsubmit = function() {
        return false;
    };
    
});

function resetTable() {
    var xhr = new XMLHttpRequest();
    xhr.addEventListener("load", refreshTable);
    xhr.open("GET", "https://wt.ops.labs.vu.nl/api20/412d87b0/reset");
    xhr.send();
}

function refreshTable() {
    var xhr = new XMLHttpRequest();
    xhr.addEventListener("load", updateTable);
    xhr.responseType = "json";        
    xhr.open("GET", "https://wt.ops.labs.vu.nl/api20/412d87b0");
    xhr.send();
}

function putTable() {
    var xhr = new XMLHttpRequest();
    xhr.addEventListener("load", refreshTable);
    xhr.responseType = "json";        
    var brand = document.getElementsByName("brand")[0];
    var model = document.getElementsByName("model")[0];
    var os = document.getElementsByName("os")[0];
    var image = document.getElementsByName("image")[0];
    var screensize = document.getElementsByName("screensize")[0];

    var queryString = "brand=" + encodeURIComponent(brand.value) + 
        "&model=" + encodeURIComponent(model.value) + 
        "&os=" + encodeURIComponent(os.value) + 
        "&image=" + encodeURIComponent(image.value) + 
        "&screensize=" + encodeURIComponent(screensize.value);
    xhr.open("POST", "https://wt.ops.labs.vu.nl/api20/412d87b0?" + queryString);
    console.log("https://wt.ops.labs.vu.nl/api20/412d87b0?" + queryString);
    xhr.send();
}

function updateTable() {
    var topSellingItemTable = document.getElementById("top_selling_items_table").getElementsByTagName("tbody")[0];
    if (this.status === 200) {
        var items = this.response;
        topSellingItemTable.innerHTML = "<tr>";
        for (var i = 0; i < items.length; i++) {
            console.log(items[i]);
            var responsea = "<td>" + items[i].brand + "</td>" +
                "<td>" + items[i].model + "</td>" +
                "<td>" + items[i].os + "</td>" +
                "<td>" + "<img src='" + items[i].image + "'></td>" +
                "<td>" + items[i].screensize + "</td>";
            
            topSellingItemTable.innerHTML = topSellingItemTable.innerHTML + responsea;
        }
            topSellingItemTable.innerHTML = topSellingItemTable.innerHTML + "</tr>";

    } else {
      movieInfo.innerHTML = "Error";
    }
}


