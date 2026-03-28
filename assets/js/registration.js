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

  // Optional: validate on form submit
  $('#frm-registration').on('submit', function(e) {
    e.preventDefault();
    
    let contactNumber = $('#inp-contact').cleanVal(); // get digits only
    if (contactNumber.length > 0 && contactNumber.length !== 11) {
        toastr.error("Contact number must be exactly 11 digits.");
        return;
    }
  
    const runner = {
          firstName: $('#inp-firstname').val(),
          lastName: $('#inp-lastname').val(),
          gender: $('#inp-gender').val(),
          birthdate: $('#inp-birthdate').val(),
          batchYear: $('#inp-batchyear').val(),
          contact: $('#inp-contact').val(),
          address: $('#inp-address').val(),
          tshirtSize: $('#inp-tshirt').val()
      };

      // const btnRegister = $('#btn-register');
      // btnRegister.prop('disabled', true).text('Registered: Directing to QR Code...');
      toastr.success("Successfully registered. For payment and activation, please contact your batch officer.");

    
      // // Wait 4 seconds (4000ms) before executing
      // setTimeout(function() {
      //     btnRegister.prop('disabled', false).text('Register');
      //     window.location.href = "qrcode.html";
      // }, 10000);
  });

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
