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
      if(tabId=='#tab-ride'){
        const rideCategory = $('input[name="rideCategory"]:checked').val();
        const tshirt = $('input[name="tshirt"]:checked').val();

        if(!rideCategory){
          toastr.error("Please select a category.");
          valid=false;
        }else{
          if(rideCategory.includes('Package A')){
          }else{
            if(!tshirt){
                toastr.error("Please select a T-Shirt size.");
                valid=false;
            }
          }
        }
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
          
          if(contact.length!==11){
              toastr.error("Contact number must be 11 digits.");
              valid=false;
          }else if(!gender){
              toastr.error("Please select a gender.");
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
      const tshirtSize = $('input[name="tshirt"]:checked').val() || '--';
      
      $('#review-fullname').text($('#inp-firstname').val().trim().toUpperCase() + ' ' + $('#inp-lastname').val().trim().toUpperCase());
      $('#review-gender').text($('input[name="gender"]:checked').val());
      $('#review-birthdate').text($('#inp-birthdate').val());
      $('#review-contact').text($('#inp-contact').val());
      $('#review-batch').text(emptyStateLabel($('#sel-batch-year').val().trim()));
      $('#review-address').text($('#inp-address').val().trim().toUpperCase());
      $('#review-tshirt').text(tshirtSize);
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
     registration();
  });

  function registration(){
    const firstName = $('#inp-firstname').val().trim().toUpperCase();
    const lastName = $('#inp-lastname').val().trim().toUpperCase();
    const gender = $('input[name="gender"]:checked').val();
    const birthdate = $('#inp-birthdate').val();
    const contactNumber = $('#inp-contact').cleanVal();
    const batchYear = $('#sel-batch-year').val();
    const address = $('#inp-address').val().trim().toUpperCase();

    const package = $('input[name="rideCategory"]:checked').val();
    const amount = $('input[name="rideCategory"]:checked').attr('amount');
    const tshirtSize = $('input[name="tshirt"]:checked').val() || '';
    
    const fileInput = $('#inp-payment-file')[0];
    const file = fileInput.files[0];

    const data = {
          action: "registration",
          firstName,
          lastName,
          gender,
          birthdate,
          contactNumber,
          batchYear,
          address,
          package,
          amount,
          tshirtSize,
        };
    
    const btnNextReview= $('#btn-next-review');
    btnNextReview.prop('disabled', true);
    btnNextReview.html('<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Confirm & Submit');
    
      $.ajax({
          url: API_URL,
          method: "POST",
          data: data,
          success: function (res) {

            btnNextReview.prop('disabled', false);
            btnNextReview.html('Confirm & Submit'); // restore original text
            
            const id = res.id
            
            buildSuccessContent(id, firstName, lastName);

            // Hide entire form UI (tabs + steps)
            $('#frm-registration .tab-pane').hide();
            $('.step-indicator').hide();
          
            // Show success content
            $('#success-container').fadeIn();
          
            // Countdown auto-download
            let countdown = 3;
            const originalText = "Download QR Code";
            $('#btn-download-qr').prop('disabled', true);              
          
            const countdownInterval = setInterval(() => {
                if(countdown <= 0){
                    clearInterval(countdownInterval);
                    $('#btn-download-qr')
                        .prop('disabled', false)
                        .text(originalText)
                        .click();
                } else {
                    $('#btn-download-qr').text(`${originalText} (${countdown})`);
                    countdown--;
                }
            }, 1000);
          },
          error: function (err) {
              btnNextReview.prop('disabled', false);
              btnNextReview.html('Confirm & Submit'); // restore original text
            
              console.error(err);
              alert("Upload failed!");
          }
      });
  }

  $('input[name="rideCategory"]').on('change', function () {
    const selected = $(this).val();

    if(selected.includes('Package A')){
      $('input[name="tshirt"]').prop('checked', false).prop('disabled', true);
    }else{
      $('input[name="tshirt"]').prop('disabled', false);
    }
  });

  $('#inp-payment-file').on('change', function() {
    const file = this.files[0];

    if (file) {
        const fileType = file.type;
        const validImageTypes = ['image/jpeg', 'image/png', 'image/jpg'];

        if (!validImageTypes.includes(fileType)) {
            alert('Only JPG, JPEG, or PNG images are allowed.');
            toastr.error("Only JPG, JPEG, or PNG images are allowed.");
            $(this).val(''); // Clear the input
        }
    }
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

 function buildSuccessContent(id, firstName, lastName) {
    const fullName = `${firstName} ${lastName}`;
    const eventTitle = "2026 ANHS Fun Run";
    const currentDateTime = getCurrentDateTime();
    const fileName = `${firstName}_${currentDateTime}`;
    const baseUrl = "https://joverixal.github.io/ge-ix-fr-anhs/registration-status/";
    const verificationUrl = `${baseUrl}`;

    // Update verification link
    $("#verification-link").attr("href", verificationUrl).text("Check Registration Status");
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
