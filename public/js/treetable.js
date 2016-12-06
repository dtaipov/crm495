var device_name = null;
var device_serial_number = null;
var device_part_number = null;

function getSelectedIds() {
    var tree = $("#treetable").fancytree("getTree");
    return $.map(tree.getSelectedNodes(), function (node) {
        return (node.isFolder() ? null : node.key);
    });
}

/*function toggleExtraActionClass(node) {
    $("#treetable").fancytree("getTree").visit(function(node){
        if (node.extraClasses) {
            node.extraClasses = null;
            node.render();
        }
    });
    node.setActive(false); // если fancytree-active css-класс закомментирован, данная строка может быть не обязательная
    node.extraClasses = "extra-action";
    node.render();
}*/

function loadTreetableControls()  {
    var itemsOnPage = $('#itemsOnPage');
    itemsOnPage.SumoSelect();

    itemsOnPage.on("change", function () {
        updatePagination(1);
    });

    $('#device_name_input').on("change", function (e) {
        device_name = $("#device_name_input").val().replace('\t', '');
        //getDevices(device_name, device_serial_number, device_part_number);
        applyDocumentsFilter();
        updatePaginationCurrentPage();
    });
    $('#device_serial_number_input').on("change", function (e) {
        device_serial_number = $("#device_serial_number_input").val().replace('\t', '');
        //getDevices(device_name, device_serial_number, device_part_number);
        applyDocumentsFilter();
        updatePaginationCurrentPage();
    });
    $('#device_part_number_input').on("change", function (e) {
        device_part_number = $("#device_part_number_input").val().replace('\t', '');
        //getDevices(device_name, device_serial_number, device_part_number);
        applyDocumentsFilter();
        updatePaginationCurrentPage();
    });
}

function applyDocumentsFilter() {
    var tree = $("#treetable").fancytree("getTree");
    if (!device_name && !device_serial_number && !device_part_number) {
        tree.clearFilter();
        return;
    }
    tree.filterNodes(function(node) {
        if (node.isFolder()) {
            return false;
        }
        return ((device_name && node.title.indexOf(device_name) != -1) ||
        (device_serial_number && node.data.serial_number.indexOf(device_serial_number) != -1) ||
        (device_part_number && node.data.part_number.indexOf(device_part_number) != -1));
    });
}

function treetableExpand() {
    updatePaginationCurrentPage();
}

function treetableCollapse() {
    updatePaginationCurrentPage();
}

function updatePaginationCurrentPage() {
    var currentPage = $('#pagination_treetable').twbsPagination('getCurrentPage');
    updatePagination(currentPage);
}

function updatePagination(startPage) {
    var itemsPerPage = $('#itemsOnPage').val();
    var onlyExpandedCount = countOnlyExpandedNodes();
    var pagesQuantity = Math.ceil(onlyExpandedCount/itemsPerPage);
    if (pagesQuantity == 0){
        pagesQuantity = 1;
    }
    showViewPort(startPage, itemsPerPage);

    var paginationTreetable = $('#pagination_treetable');
    if(paginationTreetable.data("twbs-pagination")) {
        paginationTreetable.twbsPagination('destroy');
    }
    paginationTreetable.twbsPagination({
        totalPages: pagesQuantity,
        initiateStartPageClick: false,
        visiblePages: 7,
        first: '<<',
        prev: '<',
        next: '>',
        last: '>>',
        startPage: startPage,
        onPageClick: function (event, page) {
            showViewPort(page, itemsPerPage);
        }
    });
}

// нужно считать таким способом, т.к. при первом раскрытии фолдера tr добавляются в DOM,
// они не сразу там находятся и $('#treetable tbody tr').length выдает одно и то же число если фолдер потом закрывается
// (tr не удаляются из dom при закрытии папки)
function countOnlyExpandedNodes() {
    var counter = 0;
    $("#treetable").fancytree("getTree").visit(function(node) {
        if (node.parent && node.parent.isExpanded() && !$(node.tr).hasClass("fancytree-hide")) {
            counter++;
        }
    });
    return counter;
}

function showViewPort(page, itemsPerPage) {
    $('#treetable tbody tr').hide();
    var counter = 0;
    $("#treetable").fancytree("getTree").visit(function(node){
        if (node.parent && node.parent.isExpanded() && !hasCollapsedParent(node) && !$(node.tr).hasClass("fancytree-hide")) {
            if (counter >= (page-1) * itemsPerPage && counter < page * itemsPerPage) {
                $(node.tr).show(); // TODO может быть, эффективнее собрать массив tr и показать их все вместе
            }
            counter++;
        }
    });
}

function hasCollapsedParent(node) {
    if (!node.parent) {
        return false;
    }
    if (node.parent.isFolder() && !node.parent.isExpanded()) {
        return true;
    }
    return hasCollapsedParent(node.parent);
}

function updateDeviceTable(data) {
    //console.log(data);
    //$('#treetable').fancytree('option', 'source', data);
    $('#treetable').fancytree("getTree").reload(data);
}

function getDevices(deviceName, deviceSerialNumber, devicePartNumber) {
    if(webSocket) {
        var json = {
            command: DEVICE_REQUEST_COMMAND,
            device_name: deviceName,
            device_serial_number: deviceSerialNumber,
            device_part_number: devicePartNumber
        };
        webSocket.send(JSON.stringify(json));
    }
}