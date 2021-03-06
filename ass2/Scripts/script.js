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
    $.post("https://wt.ops.labs.vu.nl/api20/412d87b0",
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
    $.get("https://wt.ops.labs.vu.nl/api20/412d87b0/reset", refreshTable);
    return;
}

function refreshTable() {
    // Get request to get values in DB, callback to check response and then call filltable
    $.get("https://wt.ops.labs.vu.nl/api20/412d87b0", function (data, status) {
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
            "<td data-sort-value='" + data[i].screensize + "'>" + data[i].screensize + "</td>";

        tbody.html("<tr>" + tbody.html() + responsea + "</tr>")
    }
    return;
}
