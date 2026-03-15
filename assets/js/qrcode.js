$(document).ready(function() {
    // Example GUID and user info
    const guidId = '123e4567-e89b-12d3-a456-426614174000';
    const userName = 'Joverixal Entuna';
    const logoSrc = 'assets/images/anhs-2011-logo.png';

    // Generate QR code in hidden canvas
    $('#qrcode').qrcode({
        text: guidId,
        width: 250,
        height: 250,
        colorDark: "#000000",
        colorLight: "#ffffff"
    });

    $('#btn-download').click(function() {
        const qrCanvas = $('#qrcode canvas')[0];
        if (!qrCanvas) {
            toastr.error("QR Code not available!");
            return;
        }

        // Create a new canvas for final image
        const finalCanvas = document.createElement('canvas');
        const ctx = finalCanvas.getContext('2d');
        const logo = new Image();
        logo.src = logoSrc;

        // Wait for logo to load
        logo.onload = function() {
            const qrSize = 250;
            const padding = 20;
            const textHeight = 30;

            // Canvas size: QR + padding + logo + text
            finalCanvas.width = qrSize + padding * 2;
            finalCanvas.height = qrSize + padding * 2 + logo.height + textHeight;

            // Fill white background
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);

            // Draw QR code
            ctx.drawImage(qrCanvas, padding, padding);

            // Draw logo below QR code
            const logoX = (finalCanvas.width - logo.width) / 2;
            const logoY = padding + qrSize + 10;
            ctx.drawImage(logo, logoX, logoY);

            // Draw user name text below logo
            ctx.fillStyle = "#E41200";
            ctx.font = "bold 18px Arial";
            ctx.textAlign = "center";
            ctx.fillText(userName, finalCanvas.width / 2, logoY + logo.height + 20);

            // Download final image
            const link = document.createElement('a');
            link.href = finalCanvas.toDataURL("image/png");
            link.download = `${userName}_ANHS2011_QR.png`;
            link.click();

            toastr.success("QR Code downloaded with logo and name!");
        };
    });
});
