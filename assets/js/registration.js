$(document).ready(function () {

  toastr.options = {
      "positionClass": "toast-bottom-center", // Bottom left corner
      "timeOut": "3000",             // Auto hide after 3s
      "extendedTimeOut": "1000",
      "preventDuplicates": true
  };

  loadBatchYear();

  const btnRegister = $('#btn-register');
  btnRegister.click(function(){
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
      
      btnRegister.prop('disabled', true).text('Registered: Directing to QR Code...');
      toastr.success("Successfully registered. For payment and activation, please contact your batch officer.");

    
    // Wait 4 seconds (4000ms) before executing
    setTimeout(function() {
        btnRegister.prop('disabled', false).text('Register');
        window.location.href = "qrcode.html";
    }, 10000);
      
  });

  function loadBatchYear(){
    const currentYear = 2026;
    const startYear = currentYear - 70;

    let options = '<option value="" selected disabled>Select batch year</option>';

    for (let year = currentYear; year >= startYear; year--) {
        options += `<option value="${year}">${year}</option>`;
    }

    $('#sel-batch-year').html(options);
  }

});
