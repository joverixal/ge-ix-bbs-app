$(document).ready(function () {

  toastr.options = {
      "positionClass": "toast-bottom-center", // Bottom left corner
      "timeOut": "3000",             // Auto hide after 3s
      "extendedTimeOut": "1000",
      "preventDuplicates": true
  };

  let html5QrScanner = null;
  let qrModal = new bootstrap.Modal($('#qrModal')[0]);
  
  // Open modal and start scanner
  $('#btn-scan-qr').click(function() {
      // Show modal
      qrModal.show();
  
      // If scanner already exists, clear it first
      if (html5QrScanner) {
          html5QrScanner.clear().catch(err => console.log(err));
          html5QrScanner = null;
      }
  
      // Initialize QR scanner
      html5QrScanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 250 }, /* verbose */ false);
  
      function onScanSuccess(decodedText, decodedResult) {
          try {
              // Assume QR code contains JSON string with registration ID
              const data = JSON.parse(decodedText);
  
              // Stop scanner immediately to avoid multiple scans
              html5QrScanner.clear().then(() => {
                  html5QrScanner = null;
                  qrModal.hide();
                  searchQRCode(data.id);
              }).catch(err => {
                  console.error("Failed to stop QR scanner:", err);
                  searchQRCode(data.id); // still proceed
              });
  
          } catch (err) {
              toastr.error("Invalid QR Code!");
          }
      }
  
      html5QrScanner.render(onScanSuccess);
  });
  
  // Stop scanner when modal closes manually
  $('#qrModal').on('hidden.bs.modal', function() {
      if (html5QrScanner) {
          html5QrScanner.clear().then(() => {
              html5QrScanner = null;
          }).catch(err => console.log("Failed to clear QR scanner:", err));
      }
  });
  
  // AJAX search function
  function searchQRCode(id) {
 
      const firstName = $('#inp-firstname').val();
      const lastName = $('#inp-lastname').val();
      const params = { action: "registrationStatus", id, firstName, lastName };
  
      $.ajax({
          url: API_URL,
          method: "GET",
          data: params,
          success: function(response) {
              if (typeof response === "string") response = JSON.parse(response);
  
              if (response.success) {
                  showRegistrationResult(response.runerData);
              } else {
                  toastr.error(response.message || "Record not found");
              }
  
          },
          error: function() {
              toastr.error("Network error, please try again later");
          }
      });
  }

  $('#btn-search-name').click(function(){
    const id = '';
    const firstName = $('#inp-firstname').val().trim().toUpperCase();
    const lastName = $('#inp-lastname').val().trim().toUpperCase();
    if(!firstName || !lastName){
        toastr.error("Enter both first and last name");
        return;
    }
    search(id, firstName, lastName);
    
  });  

  function search(id, firstName, lastName){
    const btnScanQR = $('#btn-scan-qr');
    const btnSearchName = $('#btn-search-name');
    btnScanQR.prop('disabled', true);
    btnScanQR.html('<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Scan QR');

    btnSearchName.prop('disabled', true);
    btnSearchName.html('<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Search');
    
    const params = { action: "registrationStatus", id, firstName, lastName};
    
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
                    btnScanQR.html('Scan QR'); // restore original text
                    btnSearchName.prop('disabled', false);
                    btnSearchName.html('Search'); // restore original text

                } else {
                    toastr.error(response.message || "Record not found");
                    
                    btnScanQR.prop('disabled', false);
                    btnScanQR.html('Scan QR'); // restore original text
                    btnSearchName.prop('disabled', false);
                    btnSearchName.html('Search'); // restore original text
                }

            },
            error: function (err) {
                btnScanQR.prop('disabled', false);
                btnScanQR.html('Scan QR'); // restore original text
                btnSearchName.prop('disabled', false);
                btnSearchName.html('Search'); // restore original text
              
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
    $('#result-payment').text(data.status);
    
    // Clear previous QR
    $("#result-qr").empty();

    const fullName = `${data.firstName} ${data.lastName}`;
    const eventTitle = "2026 ANHS Fun Run";
    const currentDateTime = getCurrentDateTime();
    const fileName = `${data.firstName}_${currentDateTime}`;
    
    const qrSize = 200;
    const margin = 5;
    const textSpace = 50;
    const canvasWidth = qrSize + margin * 2;
    const canvasHeight = qrSize + textSpace + margin * 2;

    // Create main canvas
    const canvas = document.createElement('canvas');
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    const ctx = canvas.getContext('2d');

    // White background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Generate QR using kjua directly on a canvas
    const qr = kjua({
        render: 'canvas',
        crisp: true,
        size: qrSize,
        fill: '#000000',
        back: '#ffffff',
        quiet: 0,
        text: JSON.stringify({ id: data.id, firstName: data.firstName, lastName: data.lastName})
    });

    // Draw QR on our main canvas
    ctx.drawImage(qr, margin, margin, qrSize, qrSize);

    // Draw text
    ctx.textAlign = "center";
    ctx.fillStyle = "#000000";
    ctx.font = "bold 16px Arial";
    ctx.fillText(eventTitle, canvasWidth / 2, qrSize + margin + 20);
    ctx.font = "14px Arial";
    ctx.fillText(fullName, canvasWidth / 2, qrSize + margin + 40);

    // Add canvas to DOM
    $("#result-qr").append(canvas);
    $("#result-qr canvas").css({ display: "block", margin: "0 auto" });

    // Download button
    $("#btn-download-qr").off("click").on("click", function(e) {
        e.preventDefault();
        const link = document.createElement('a');
        link.href = canvas.toDataURL("image/png");
        link.download = `ANHS_RUN_QR_${fileName}.png`;
        link.click();
    });
  }

  function getCurrentDateTime() {
      const now = new Date();
      return now.getFullYear() +
             String(now.getMonth() + 1).padStart(2, '0') +
             String(now.getDate()).padStart(2, '0') + "_" +
             String(now.getHours()).padStart(2, '0') +
             String(now.getMinutes()).padStart(2, '0') +
             String(now.getSeconds()).padStart(2, '0');
  }

});
