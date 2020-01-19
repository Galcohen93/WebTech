


$(document).ready(function () {
    $('table').tablesort();

    $('#reset').click(resetTable);

    $('#refresh').click(refreshTable);

    refreshTable();
});

function putTable() {
    var xhr = new XMLHttpRequest();
    xhr.addEventListener("load", refreshTable);
    xhr.responseType = "json";
    var brand = document.getElementsByName("brand")[0];
    var model = document.getElementsByName("model")[0];
    var os = document.getElementsByName("os")[0];
    var image = document.getElementsByName("image")[0];
    var screensize = document.getElementsByName("screensize")[0];

    var queryString = "brand=" + brand.value +
        "&model=" + model.value +
        "&os=" + os.value +
        "&image=" + image.value +
        "&screensize=" + screensize.value;
    xhr.open("POST", "http://localhost:3000/api/phone");
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded')
    xhr.send(queryString);

    brand.value = "";
    model.value = "";
    os.value = "";
    image.value = "";
    screensize.value = "";

    return false;
}



function updateItem(id) {
    var xhr = new XMLHttpRequest();
    xhr.addEventListener("load", refreshTable);
    xhr.responseType = "json";
    var brand = document.getElementsByName("brand")[0];
    var model = document.getElementsByName("model")[0];
    var os = document.getElementsByName("os")[0];
    var image = document.getElementsByName("image")[0];
    var screensize = document.getElementsByName("screensize")[0];

    var queryString = "brand=" + brand.value +
        "&model=" + model.value +
        "&os=" + os.value +
        "&image=" + image.value +
        "&screensize=" + screensize.value;
    xhr.open("PATCH", "http://localhost:3000/api/phone/" + id);
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded')
    xhr.send(queryString);

    brand.value = "";
    model.value = "";
    os.value = "";
    image.value = "";
    screensize.value = "";

    return false;
}

function resetTable() {
    var xhr = new XMLHttpRequest();
    xhr.addEventListener("load", refreshTable);
    xhr.open("DELETE", "http://localhost:3000/api/reset");
    xhr.send();
    return;
}

function removeItem(id) {
    var xhr = new XMLHttpRequest();
    xhr.addEventListener("load", refreshTable);
    xhr.open("DELETE", "http://localhost:3000/api/phone/" + id);
    xhr.send();
    return;
}

function refreshTable() {
    var xhr = new XMLHttpRequest();
    xhr.addEventListener("load", updateTable);
    xhr.responseType = "json";        
    xhr.open("GET", "http://localhost:3000/api/Phones");
    xhr.send();
    return;
}

function updateTable() {
    var topSellingItemTable = document.getElementById("top_selling_items_table").getElementsByTagName("tbody")[0];
    if (this.status === 200) {
        var items = this.response;
        fillTable(items, topSellingItemTable);
    } else {
      movieInfo.innerHTML = "Error";
    }
    return;
}

function fillTable(items, tbody) {
    tbody.innerHTML = "<tr>";
    for (var i = 0; i < items.length; i++) {
        var responsea = "<td>" + items[i].brand + "</td>" +
            "<td>" + items[i].model + "</td>" +
            "<td>" + items[i].os + "</td>" +
            "<td>" + "<img src='" + items[i].image + "'></td>" +
            "<td data-sort-value='" + items[i].screensize + "'>" + items[i].screensize +
            "</td>" + "<td>" + "<button onclick=removeItem(" + items[i].id +
             ") required='false'>Remove Item</button></td>"
             + "<td>" + "<button onclick=updateItem(" + items[i].id +
             ") required>Update Item</button></td>";

        tbody.innerHTML = tbody.innerHTML + responsea;
    }
    tbody.innerHTML = tbody.innerHTML + "</tr>";
    return;
}
