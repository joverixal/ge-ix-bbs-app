$(document).ready(function() {
    // Example GUID and user info
    const guidId = '123e4567-e89b-12d3-a456-426614174000';
    const userName = 'Joverixal Entuna';
    const batchYear = '2011';
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

        logo.onload = function() {
            const qrSize = 250;
            const padding = 20;
            const logoMaxWidth = 60; // small logo
            const logoMaxHeight = 60;
            const textHeight = 25;

            // Scale logo proportionally
            let logoWidth = logo.width;
            let logoHeight = logo.height;
            const scale = Math.min(logoMaxWidth / logoWidth, logoMaxHeight / logoHeight, 1);
            logoWidth *= scale;
            logoHeight *= scale;

            // Final canvas height: QR + padding + logo + name + batchYear + extra padding
            finalCanvas.width = qrSize + padding * 2;
            finalCanvas.height = qrSize + padding * 2 + logoHeight + textHeight * 2 + 20;

            // Fill white background
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);

            // Draw QR code
            ctx.drawImage(qrCanvas, padding, padding);

            // Draw logo below QR code
            const logoX = (finalCanvas.width - logoWidth) / 2;
            const logoY = padding + qrSize + 10;
            ctx.drawImage(logo, logoX, logoY, logoWidth, logoHeight);

            // Draw user name
            ctx.fillStyle = "#E41200";
            ctx.font = "bold 18px Arial";
            ctx.textAlign = "center";
            ctx.fillText(userName, finalCanvas.width / 2, logoY + logoHeight + 20);

            // Draw Batch Year below name
            ctx.fillStyle = "#333333";
            ctx.font = "16px Arial";
            ctx.fillText(`Batch ${batchYear}`, finalCanvas.width / 2, logoY + logoHeight + 20 + textHeight);

            // Download final image
            const link = document.createElement('a');
            link.href = finalCanvas.toDataURL("image/png");
            link.download = `${userName}_ANHS${batchYear}_QR.png`;
            link.click();

            toastr.success("QR Code downloaded with logo, name, and batch year!");
        };
    });
});
