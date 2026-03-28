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
      $('.step-indicator').removeClass('active');
      $('.step-indicator').each(function(i){ if(i+1 <= stepNumber) $(this).addClass('active'); });
  }

  function validateTab(tabId) {
      let valid = true;
      $(tabId).find('input[required], select[required]').each(function() {
          if(!this.checkValidity()) { this.reportValidity(); valid=false; return false; }
      });
      // Ride Category validation
      if(tabId=='#tab-ride' && $('input[name="rideCategory"]:checked').length===0){
          toastr.error("Please select a Ride Category.");
          valid=false;
      }
      // Payment file validation
      if(tabId=='#tab-payment' && $('#inp-payment-file').get(0).files.length===0){
          toastr.error("Please upload Payment Proof.");
          valid=false;
      }
      // Birthdate ≥10 years
      if(tabId=='#tab-basic'){
          let birth = new Date($('#inp-birthdate').val());
          let minDate = new Date(); minDate.setFullYear(minDate.getFullYear()-10);
          if(birth > minDate){
              toastr.error("Registrant must be at least 10 years old.");
              valid=false;
          }
          // Contact 11 digits
          let contact = $('#inp-contact').cleanVal();
          if(contact.length!==11){
              toastr.error("Contact number must be 11 digits.");
              valid=false;
          }
      }
      return valid;
  }

  // Next buttons
  $('#btn-next-basic').click(()=>{ if(validateTab('#tab-basic')) showTab('#tab-ride',2); });
  $('#btn-next-ride').click(()=>{ if(validateTab('#tab-ride')) showTab('#tab-payment',3); });
  $('#btn-next-payment').click(()=>{ if(validateTab('#tab-payment')) showTab('#tab-success',4); });

  // Back buttons
  $('#btn-back-ride').click(()=>showTab('#tab-basic',1));
  $('#btn-back-payment').click(()=>showTab('#tab-ride',2));

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

});
