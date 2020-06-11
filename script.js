var map;
var service;
var rectangle;
let radius = 0;
let search_mode = null;
let search_val = '';
let dataArr = new Array();
let menuFlag = false;

function initMap() {

    initialize();
}

function onSelectChangeHandler(e) {

    search_mode = e.options[e.selectedIndex].value;
}

function onSearchChangeHandler(e) {

    if (radius === 0 || search_mode === null || radius === undefined || radius === '' || search_mode === '') {
        $('#modal').css('display', 'block');
        $('#searchBox').val('');
    } else {

        search_val = $('#searchBox').val();
        if (search_mode === "zipCode" && search_val.length > 10) {
            $('#modal').css('display', 'block');
            $('#searchBox').val('');
        } else if (search_mode === 'MailAddr' && search_val.length < 10) {
            $('#modal').css('display', 'block');
            $('#searchBox').val('');
        }
    }

}

$('.runBtn').click(function () {

    console.log("here serach value", search_val)
    if (!search_val || search_val === null || search_val === '') {
        $('#modal_search').css('display', 'block')
    } else {

        document.getElementById("dataList").innerHTML = '';

        var geocoder = new google.maps.Geocoder();
        var address = search_val;

        geocoder.geocode({ 'address': 'zipcode ' + address }, function (results, status) {

            if (status == google.maps.GeocoderStatus.OK) {
                let latitude = results[0].geometry.location.lat();
                let longitude = results[0].geometry.location.lng();
                console.log("here", latitude, longitude)
                let myLocation = new google.maps.LatLng(latitude, longitude);
                let req_radius = 1000 * radius;

                let request = {
                    location: myLocation,
                    radius: req_radius,
                    types: ['restaurant']
                };
                service = new google.maps.places.PlacesService(map);
                service.nearbySearch(request, callback);

                // var cityCircle = new google.maps.Circle({
                //     strokeColor: '#FF0000',
                //     strokeOpacity: 0.8,
                //     strokeWeight: 2,
                //     fillColor: '#FF0000',
                //     fillOpacity: 0.35,
                //     map: map,
                //     center: myLocation,
                //     radius: radius * 1000
                // });

            } else {
                alert("Request failed.")
            }
        });

        $('#searchBox').val('');
        search_val = ''
    }

})



function callback(results, status) {

    var savedResults = results;
    var nameArr = [];

    if (status == google.maps.places.PlacesServiceStatus.OK) {

        for (var i = 0; i < results.length; i++) {

            createMarker(results[i]);

            var request = {
                placeId: results[i].place_id,
            };

            service.getDetails(request, function (place, status) {

                if (place !== null && place.photos) {
                    console.log("done", place);
                    var photos = place.photos;
                    let addr = place.formatted_address;
                    let phone_number = place.formatted_phone_number;
                    var dataItem = [{ 'addr': addr }, { 'phone': phone_number }, { 'src_url': photos[0].getUrl({ 'maxWidth': 120, 'maxHeight': 120 }) }];
                    dataArr.push(dataItem);
                }

            });

            console.log(dataArr);
        }

        setTimeout(() => {

            for (let nth = 0; nth < dataArr.length; nth++) {

                var node = document.createElement("div");
                var nthDataId = "dataItem" + nth;
                node.setAttribute("id", nthDataId);
                node.setAttribute("class", 'dataItem');
                document.getElementById("dataList").appendChild(node);

                var checkBoxDiv = document.createElement("div");
                var checkBoxDivId = "divCheck" + nthDataId;
                checkBoxDiv.setAttribute("id", checkBoxDivId);
                checkBoxDiv.setAttribute("class", "checkbox rows");
                document.getElementById(nthDataId).appendChild(checkBoxDiv);
                var checkBoxInput = document.createElement('input');
                var checkBoxId = nth + "box";
                checkBoxInput.setAttribute("id", checkBoxId);
                checkBoxInput.setAttribute("type", "checkbox");
                document.getElementById(checkBoxDivId).appendChild(checkBoxInput);

                var dataItemThumb = document.createElement("div");
                var dataItemThumbId = "div" + nthDataId;
                dataItemThumb.setAttribute("id", dataItemThumbId);
                dataItemThumb.setAttribute("class", "thumbData");
                document.getElementById(nthDataId).appendChild(dataItemThumb);

                var nodeImage = document.createElement("img")
                nodeImage.setAttribute("src", dataArr[nth][2].src_url);
                nodeImage.setAttribute("width", "80px");
                nodeImage.setAttribute("height", "100px");
                document.getElementById(dataItemThumbId).appendChild(nodeImage);

                var nodeDetailDiv = document.createElement("div");
                var nodeDetailDivId = "divDetail" + nthDataId;
                nodeDetailDiv.setAttribute("id", nodeDetailDivId);
                nodeDetailDiv.setAttribute("class", "detailData");
                document.getElementById(nthDataId).appendChild(nodeDetailDiv);

                var nodeDetail = document.createElement("LI");
                nodeDetail.setAttribute("class", "address");
                var nodeTextName = document.createTextNode(dataArr[nth][0].addr);
                nodeDetail.appendChild(nodeTextName);
                document.getElementById(nodeDetailDivId).appendChild(nodeDetail);

                var nodeDetail = document.createElement("LI");
                var nodeTextEmailAddr = document.createTextNode(dataArr[nth][1].phone);
                nodeDetail.appendChild(nodeTextEmailAddr);
                document.getElementById(nodeDetailDivId).appendChild(nodeDetail);

            }
        }, 2000);

    }

}

$('#html').change(function (e) {

    if (e.currentTarget.checked) {
        $('.rows').find('input[type="checkbox"]').prop('checked', true);
    } else {
        $('.rows').find('input[type="checkbox"]').prop('checked', false);
    }
});

$('#download').click(function () {

    let rows = [];
    let idArr = new Array();
    for (let i = 0; i < dataArr.length; i++) {

        if ($('#' + i + 'box').is(":checked")) {

            idArr.push(i);
        }
    }


    for (let n = 0; n < idArr.length; n++) {
        let rowItem = [n];
        for (let k = 0; k < 2; k++) {
            rowItem.push(Object.values(dataArr[idArr[n]][k])[0])
        }
        rows.push(rowItem);
    }


    function convertToCsv(fName, rows) {
        var csv = '';
        for (var i = 0; i < rows.length; i++) {
            var row = rows[i];
            for (var j = 0; j < row.length; j++) {
                var val = row[j] === null ? '' : row[j].toString();
                val = val.replace(/\t/gi, " ");
                if (j > 0)
                    csv += '\t';
                csv += val;
            }
            csv += '\n';
        }

        // for UTF-16
        var cCode, bArr = [];
        bArr.push(255, 254);
        for (var i = 0; i < csv.length; ++i) {
            cCode = csv.charCodeAt(i);
            bArr.push(cCode & 0xff);
            bArr.push(cCode / 256 >>> 0);
        }

        var blob = new Blob([new Uint8Array(bArr)], { type: 'text/csv;charset=UTF-16LE;' });
        if (navigator.msSaveBlob) {
            navigator.msSaveBlob(blob, fName);
        } else {
            var link = document.createElement("a");
            if (link.download !== undefined) {
                var url = window.URL.createObjectURL(blob);
                link.setAttribute("href", url);
                link.setAttribute("download", fName);
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
            }
        }
    }

    convertToCsv('download.csv', rows)

})

function onRadiusChangeHandler(e) {

    radius = $('#radiusChange').val();
}

function initialize() {

    var myLocation = new google.maps.LatLng(38.500000, -98.000000);
    map = new google.maps.Map(document.getElementById('map'), {

        center: myLocation,
        zoom: 5,
        draggable: true,
        zoomable: true,

    });

}

function createMarker(place) {

    var marker = new google.maps.Marker({
        map: map,
        position: place.geometry.location
    });

}

$('.menu').click(function () {

    menuFlag = !menuFlag;
    if (menuFlag) {

        $('#map').css('width', '100%');
        $('.sidebar').css('display', 'none');
    } else {
        $('#map').css('width', '70%');
        $('.sidebar').css('display', 'block');
    }

});


// 94103
// 80229
