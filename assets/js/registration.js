$(document).ready(function () {

  toastr.options = {
      "positionClass": "toast-bottom-center", // Bottom left corner
      "timeOut": "3000",             // Auto hide after 3s
      "extendedTimeOut": "1000",
      "preventDuplicates": true
  };

  limitBirthdate();
  maskContactNumber();
  loadBatchYear();

  // Show tab and update step indicator
  function showTab(tabId, stepNumber) {
      $('.tab-pane').removeClass('active');
      $(tabId).addClass('active');

      $('.step-indicator').each(function(i){
          if(i+1 < stepNumber){
              $(this).addClass('completed').removeClass('active');
          } else if(i+1 === stepNumber){
              $(this).addClass('active').removeClass('completed');
          } else {
              $(this).removeClass('active completed');
          }
      });
  }

  function validateTab(tabId) {
      let valid = true;
      // Ride Category validation
      if(tabId=='#tab-ride' && $('input[name="rideCategory"]:checked').length===0){
          toastr.error("Please select a category.");
          valid=false;
      }
      // Payment file validation
      if(tabId=='#tab-payment' && $('#inp-payment-file').get(0).files.length===0){
          toastr.error("Please upload Payment Proof.");
          valid=false;
      }
      // Birthdate ≥10 years
      if(tabId=='#tab-basic'){
        $(tabId).find('input[required]').each(function() {
          if(!this.checkValidity()) { this.reportValidity(); valid=false; return false; }
        });

        if(valid){
          const contact = $('#inp-contact').cleanVal();
          const gender = $('input[name="gender"]:checked').val();
          const tshirt = $('input[name="tshirt"]:checked').val();
          if(contact.length!==11){
              toastr.error("Contact number must be 11 digits.");
              valid=false;
          }else if(!gender){
              toastr.error("Please select a gender.");
              valid=false;
          }
          else if(!tshirt){
                toastr.error("Please select a T-Shirt size.");
                valid=false;
            }  
        }
      }
      return valid;
  }

  // Next buttons
  $('#btn-next-basic').click(()=>{ if(validateTab('#tab-basic')) showTab('#tab-ride',2); });
  $('#btn-next-ride').click(()=>{ if(validateTab('#tab-ride')) showTab('#tab-payment',3); });
  $('#btn-next-payment').on('click', function() {

    if(validateTab('#tab-payment')){
      // Populate Review tab
      $('#review-fullname').text($('#inp-firstname').val().trim().toUpperCase() + ' ' + $('#inp-lastname').val().trim().toUpperCase());
      $('#review-gender').text($('input[name="gender"]:checked').val());
      $('#review-birthdate').text($('#inp-birthdate').val());
      $('#review-contact').text($('#inp-contact').val());
      $('#review-batch').text(emptyStateLabel($('#sel-batch-year').val().trim()));
      $('#review-address').text($('#inp-address').val().trim().toUpperCase());
      $('#review-tshirt').text($('input[name="tshirt"]:checked').val());
      $('#review-category').text($('input[name="rideCategory"]:checked').val());
      $('#review-payment').text($('#inp-payment-file').val() ? 'Uploaded' : 'Not uploaded');
  
      showTab('#tab-review', 4);
    }
  });

  // Back buttons
  $('#btn-back-ride').click(()=>showTab('#tab-basic',1));
  $('#btn-back-payment').click(()=>showTab('#tab-ride',2));
  $('#btn-back-review').on('click', function() {showTab('#tab-payment', 3);});
  
  $('#btn-next-review').on('click', function() {
      buildSuccessContent();
      showTab('#tab-success', 5);
  });

  function emptyStateLabel(value){
    if(value == '')
      return '--'
    return value;
  }

  function loadBatchYear(){
    const currentYear = 2026;
    const startYear = currentYear - 70;

    let options = '<option value="" selected>N/A</option>';

    for (let year = currentYear; year >= startYear; year--) {
        options += `<option value="${year}">${year}</option>`;
    }

    $('#sel-batch-year').html(options);
  }

  function limitBirthdate(){
    // Get today's date
    let today = new Date();
    // Calculate date 10 years ago
    let year = today.getFullYear() - 10;
    let month = (today.getMonth() + 1).toString().padStart(2, '0'); // month is 0-indexed
    let day = today.getDate().toString().padStart(2, '0');
    let maxDate = `${year}-${month}-${day}`;

    // Set max attribute of birthdate input
    $('#inp-birthdate').attr('max', maxDate);
  }

  function maskContactNumber(){
    // Apply Philippine phone mask: 0912-345-6789
    $('#inp-contact').mask('0000-000-0000', {
        placeholder: "0912-345-6789"
    });
  }

 function buildSuccessContent() {
    const guidId = '123e4567-e89b-12d3-a456-426614174000';
    const firstname = $('#inp-firstname').val().trim().toUpperCase();
    const lastname = $('#inp-lastname').val().trim().toUpperCase();
    const fullName = `${firstname} ${lastname}`;
    const eventTitle = "ANHS Alumni Run 2026";
    const currentDateTime = getCurrentDateTime();
    const fileName = `${firstname}_${currentDateTime}`;
    const baseUrl = "https://your-verification-link.com";
    const verificationUrl = `${baseUrl}?id=${guidId}`;

    // Update verification link
    $("#verification-link").attr("href", verificationUrl).text("Check Registration Status");

    // Clear previous QR
    $("#qrcode").empty();

    // Generate QR code temporarily
    const qrData = JSON.stringify({ Id: guidId });
    new QRCode($("#qrcode")[0], {
        text: qrData,
        width: 200,
        height: 200,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
    });

    setTimeout(function() {
        const qrImg = $("#qrcode img")[0];
        if (!qrImg) return;

        // Create canvas for QR + text
        const qrSize = 200;
        const textSpace = 50;
        const canvas = document.createElement('canvas');
        canvas.width = qrSize;
        canvas.height = qrSize + textSpace;
        const ctx = canvas.getContext('2d');

        // Fill white background
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw QR code
        ctx.drawImage(qrImg, 0, 0, qrSize, qrSize);

        // Add event title (plain text)
        ctx.textAlign = "center";
        ctx.fillStyle = "#000000"; // black text
        ctx.font = "bold 16px Arial";
        ctx.fillText(eventTitle, canvas.width / 2, qrSize + 18);

        // Add participant name (plain text)
        ctx.font = "14px Arial";
        ctx.fillText(fullName, canvas.width / 2, qrSize + 38);

        // Replace QR div with canvas
        $("#qrcode").empty().append(canvas);
        $("#qrcode canvas").css({ display: "block", margin: "0 auto" });

        // Download button without refresh
        $("#btn-download-qr").off("click").on("click", function(e) {
            e.preventDefault();
            const link = document.createElement('a');
            link.href = canvas.toDataURL("image/png");
            link.download = `ANHS_RUN_QR_${fileName}.png`;
            link.click();
        });
    }, 300);
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
