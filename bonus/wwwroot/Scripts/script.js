// Api url
var apihost = "http://localhost:8080/api/"

// Reference to inputs
var brand, model, os, image, screensize;

function clearInputs() {
    // Empty the inputs
    brand.val("");
    model.val("");
    os.val("");
    image.val("");
    screensize.val("");
}

// Wait for all elements to load
$(document).ready(function () {
    brand = $("input[name=brand]");
    model = $("input[name=model]");
    os = $("input[name=os]");
    image = $("input[name=image]");
    screensize = $("input[name=screensize]");
    
    // Initialize tablesort library on every table
    $('table').tablesort();

    // Only allow one details to be open at the same time
    $('details').click(function () {
        $('details').not(this).removeAttr("open");
    });

    // Make the reset button clickable
    $('#reset').click(resetTable);

    // Put DB data into table when the page first loads.
    refreshTable();
});

function putTable() {
    // Post request with input values included, callback to refreshtable
    $.ajax({
        url: apihost + "phones",
        type: "POST",
        data: {
            brand: brand.val(),
            model: model.val(),
            os: os.val(),
            image: image.val(),
            screensize: screensize.val()
        },
        success: refreshTable
    });

    clearInputs();

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
}

function refreshTable() {
    // Get request to get values in DB, callback to check response and then call filltable
    $.ajax({
        url: apihost + "phones",
        type: "GET",
        success: function (data, status) {
            // Select the db table
            var tbody = $("#top_selling_items_table > tbody");

            // Foreach member of the response, add a row with data
            tbody.html("");
            for (var i = 0; i < data.length; i++) {
                var responsea = "<td>" + data[i].brand + "</td>" +
                    "<td>" + data[i].model + "</td>" +
                    "<td>" + data[i].os + "</td>" +
                    "<td>" + "<img src='" + data[i].image + "'></td>" +
                    "<td data-sort-value='" + data[i].screensize + "'>" + data[i].screensize + "</td>" +
                    "<td><a onclick='updateItem(" + data[i].id + ")'>Update</a><a onclick='removeItem(" + data[i].id + ")'>    Remove</a></td>";

                tbody.html("<tr>" + tbody.html() + responsea + "</tr>")
            }
        },
        error: function(){
            // Select the db table
            var tbody = $("#top_selling_items_table > tbody");
            // Foreach member of the response, add a row with data
            tbody.html("");
        }
    });
}

function updateItem(id) {
    // Patch request with input values included, callback to refreshtable
    $.ajax({
        url: apihost + "phones?id=" + id,
        type: 'PATCH',
        data: {
            brand: brand.val(),
            model: model.val(),
            os: os.val(),
            image: image.val(),
            screensize: screensize.val()
        },
        success: refreshTable
    });

    clearInputs();
}

function removeItem(id) {
    // Delete request with input values included, callback to refreshtable
    $.ajax({
        url: apihost + "phones?id="+id,
        type: 'DELETE',
        success: refreshTable
    });
}