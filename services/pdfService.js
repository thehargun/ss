const PDFDocument = require('pdfkit');
const fs = require('fs');

function generateInvoicePdf(orderDetails, callback) {
    const doc = new PDFDocument({ margin: 50 });
    const filePath = `./invoices/invoice-${orderDetails.invoiceNumber}.pdf`;

    fs.mkdirSync('./invoices', { recursive: true });
    doc.pipe(fs.createWriteStream(filePath));

    // Draw the image - top left
    doc.image('./public/logo.jpg', 50, 50, { width: 150 });

    // Company details - bold and regular text
    const companyInfoStartY = 130; 
    doc.fontSize(10).font('Helvetica-Bold')
       .text('Supply Stacker LLC', 50, companyInfoStartY);
    doc.fontSize(10).font('Helvetica')
       .text('90 Dayton Ave, Ste #12', 50, companyInfoStartY + 15)
       .text('Passaic, NJ 07055', 50, companyInfoStartY + 30)
       .text('Phone: 5512241891', 50, companyInfoStartY + 45)
       .text('Email: contact@supplystacker.com', 50, companyInfoStartY + 60)
       .text('Website: www.supplystacker.com', 50, companyInfoStartY + 75);

    // Invoice title - top right
    doc.fontSize(10).font('Helvetica-Bold').text(`INVOICE ${orderDetails.invoiceNumber}`, 400, 50, { align: 'right', width: 190 });

    // Invoice Date and Number
    doc.fontSize(10).font('Helvetica-Bold').text(`${new Date(orderDetails.dateCreated).toLocaleDateString()}`, 400, 80, { align: 'right' });

    // Bill To Section
    const billToStartY = 130;
    doc.fontSize(10).font('Helvetica-Bold')
       .text('Bill To:', 400, billToStartY, { align: 'right' })
       .font('Helvetica')
       .text(orderDetails.companyName, { align: 'right' })
       .text(orderDetails.addressLine1, { align: 'right' });
    if (orderDetails.addressLine2) {
        doc.text(orderDetails.addressLine2, { align: 'right' });
    }
    doc.text(`${orderDetails.city}, ${orderDetails.state} - ${orderDetails.zipCode}`, { align: 'right' });

    // Table Header
    doc.moveDown().fontSize(12).font('Helvetica-Bold');
    doc.text('Item', 50, 250);
    doc.text('Qty', 200, 250);
    doc.text('Rate', 280, 250);
    doc.text('Amount', 360, 250);

    // Table Body
    let tableTop = 265;
    orderDetails.products.forEach(product => {
        // Wrap item name if too long
        const productNameWidth = 140;
        doc.fontSize(10).font('Helvetica');
        const productNameHeight = doc.heightOfString(product.productName, { width: productNameWidth });
        doc.text(product.productName, 50, tableTop, { width: productNameWidth });

        const nextColumnY = tableTop + (productNameHeight > 15 ? productNameHeight - 15 : 0);

        doc.text(product.quantity, 200, nextColumnY, { width: 50, align: 'right' });
        doc.text(`$${product.rate.toFixed(2)}`, 280, nextColumnY, { width: 50, align: 'right' });
        doc.text(`$${(product.quantity * product.rate).toFixed(2)}`, 360, nextColumnY, { width: 50, align: 'right' });

        tableTop += productNameHeight + 5;
    });

    // Balance Due
    doc.fontSize(12).font('Helvetica-Bold').text(`Balance Due: $${orderDetails.totalBalance.toFixed(2)}`, 50, tableTop + 20);

    // Draw lines for the table
    doc.strokeColor('#000')
        .lineWidth(1)
        .moveTo(50, 245)
        .lineTo(550, 245)
        .stroke()
        .moveTo(50, tableTop + 5)
        .lineTo(550, tableTop + 5)
        .stroke();

    doc.end();
    callback(filePath);
}

module.exports = { generateInvoicePdf };