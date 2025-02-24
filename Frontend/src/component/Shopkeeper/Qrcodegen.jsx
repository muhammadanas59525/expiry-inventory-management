import React from 'react';
import QRCode from 'react-qr-code';
import './Qrcodegen.css';

const Qrcodegen = ({ productDetails, onClose }) => {
    const qrValue = JSON.stringify({
        pname: productDetails.pname,
        price: productDetails.sellingprice,
        manufactureDate: productDetails.manufacturingdate,
        expiryDate: productDetails.expirydate
    });

    const handlePrint = () => {
        const printContent = document.getElementById('qrcode-print');
        const WinPrint = window.open('', '', 'width=900,height=650');
        WinPrint.document.write(printContent.innerHTML);
        WinPrint.document.close();
        WinPrint.focus();
        WinPrint.print();
        WinPrint.close();
    };

    return (
        <div className="qrcode-modal-content">
            <h2>QR Code Generator</h2>
            <div id="qrcode-print">
                <QRCode value={qrValue} size={256} />
                <p>Product Name: {productDetails.pname}</p>
                <p>Price: {productDetails.sellingprice}</p>
                <p>Manufacture Date: {productDetails.manufacturingdate}</p>
                <p>Expiry Date: {productDetails.expirydate}</p>
            </div>
            <button className="print-button" onClick={handlePrint}>Print QR Code</button>
            <button className="close-button" onClick={onClose}>Close</button>
        </div>
    );
};

export default Qrcodegen;