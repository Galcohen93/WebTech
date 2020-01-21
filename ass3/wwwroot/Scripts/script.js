var apihost = "http://localhost:3000/api/"

// Wait for all elements to load
$(document).ready(function () {
    // Initialize tablesort library on every table
    $('table').tablesort();

    // Make the reset button clickable
    $('#reset').click(resetTable);

    // Put DB data into table when the page first loads.
    refreshTable();
});

function putTable() {
    // Reference to inputs
    var brand = $("input[name=brand]");
    var model = $("input[name=model]");
    var os = $("input[name=os]");
    var image = $("input[name=image]");
    var screensize = $("input[name=screensize]");

    // Post request with input values included, callback to refreshtable
    $.post(apihost + "phones",
    {
        brand: brand.val(),
        model: model.val(),
        os: os.val(),
        image: image.val(),
        screensize: screensize.val()
    }, refreshTable);

    // Empty the inputs
    brand.val("");
    model.val("");
    os.val("");
    image.val("");
    screensize.val("");

    // Return false so that the form won't submit itself (because we want only ajax)
    return false;
}

function resetTable() {
    // Get request to reset DB, callback to refreshtable
    $.ajax({
        url: apihost + "reset",
        type: "DELETE",
        success: refreshTable
    });
    return;
}

function refreshTable() {
    // Get request to get values in DB, callback to check response and then call filltable
    $.get(apihost + "phones", function (data, status) {
        // Select the db table
        var topSellingItemsTable = $("#top_selling_items_table > tbody");
        if (status === "success") {
            fillTable(data, topSellingItemsTable);
        } else {
            alert(status);
        }
    });
    return;
}

function fillTable(data, tbody) {
    // Foreach member of the response, add a row with data
    tbody.html("");
    for (var i = 0; i < data.length; i++) {
        var responsea = "<td>" + data[i].brand + "</td>" +
            "<td>" + data[i].model + "</td>" +
            "<td>" + data[i].os + "</td>" +
            "<td>" + "<img src='" + data[i].image + "'></td>" +
            "<td data-sort-value='" + data[i].screensize + "'>" + data[i].screensize + "</td>" +
            "<td><a onclick='updateItem(" + data[i].id + ")'>Update</a><a onclick='removeItem(" + data[i].id + ")'>Remove</a></td>";

        tbody.html("<tr>" + tbody.html() + responsea + "</tr>")
    }
    return;
}


function updateItem(id) {
    var brand = $("input[name=brand]");
    var model = $("input[name=model]");
    var os = $("input[name=os]");
    var image = $("input[name=image]");
    var screensize = $("input[name=screensize]");

    var data = {
        brand: brand.val(),
        model: model.val(),
        os: os.val(),
        image: image.val(),
        screensize: screensize.val()
    }
    $.ajax({
        url: apihost + "phones/" + id,
        type: 'PATCH',
        data: data,
        success: refreshTable
    });

    // Empty the inputs
    brand.val("");
    model.val("");
    os.val("");
    image.val("");
    screensize.val("");

    return;
}

function removeItem(id) {
    $.ajax({
        url: apihost + "phones/"+id,
        type: 'DELETE',
        success: refreshTable
    });
    return false;
}