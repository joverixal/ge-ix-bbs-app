$(document).ready(function () {

  toastr.options = {
      "positionClass": "toast-bottom-center", // Bottom left corner
      "timeOut": "3000",             // Auto hide after 3s
      "extendedTimeOut": "1000",
      "preventDuplicates": true
  };

  $('#btn-search-name').click(function(){
    const first = $('#inp-firstname').val().trim();
    const last = $('#inp-lastname').val().trim();
    if(!first || !last){
        toastr.error("Enter both first and last name");
        return;
    }
    // Call backend Apps Script to fetch registration
  });

  function search(id, firstName, lastName){

    const btnScanQR = $('#btn-scan-qr');
    const btnSearchName = $('#btn-search-name');
    btnScanQR.prop('disabled', true);
    btnSearchName.prop('disabled', true);
    
    const params ={
      action: "registrationStatus", id, firstName, lastName }
    };
    
    $.ajax({
            url: API_URL,
            method: "GET",
            data: params,
            success: function (response) {

              // Parse if string
                if (typeof response === "string") {
                    response = JSON.parse(response);
                }

                if (response.success) {

                    showRegistrationResult(response.runerData);
                  
                    btnScanQR.prop('disabled', false);
                    btnSearchName.prop('disabled', false);

                } else {
                    toastr.error(response.message || "Record not found");
                    
                    btnScanQR.prop('disabled', false);
                    btnSearchName.prop('disabled', false);
                }

            },
            error: function (err) {
                btnScanQR.prop('disabled', false);
                btnSearchName.prop('disabled', false);
              
                alert("Network error, please try again later");
            }
        });
  }

  function showRegistrationResult(data) {
    $('#status-result').show();
    $('#result-fullname').text(data.firstName + ' ' + data.lastName);
    $('#result-gender').text(data.gender);
    $('#result-batch').text(data.batchYear);
    $('#result-category').text(data.package);
    $('#result-tshirt').text(data.tshirtSize);
    $('#result-payment').text(data.Status);
    // QR Code
    $('#result-qr').empty();
    kjua({ text: data.id, size: 150, fill: '#7A2BE2' }).appendTo('#result-qr');
  }

});
