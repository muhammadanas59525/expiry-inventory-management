import React from 'react';
import Barcode from 'react-barcode';
import './Barcodegen.css';

const Barcodegen = ({ productDetails, onClose }) => {
    const barcodeValue = JSON.stringify({
        pname: productDetails.pname,
        price: productDetails.sellingprice,
        manufactureDate: productDetails.manufacturingdate,
        expiryDate: productDetails.expirydate
    });

    const handlePrint = () => {
        const printContent = document.getElementById('barcode-print');
        const WinPrint = window.open('', '', 'width=900,height=650');
        WinPrint.document.write(printContent.innerHTML);
        WinPrint.document.close();
        WinPrint.focus();
        WinPrint.print();
        WinPrint.close();
    };

    return (
        <div className="barcode-modal-content">
            <h2>Barcode Generator</h2>
            <div id="barcode-print">
                <Barcode value={barcodeValue} format="CODE128" width={2} height={100} displayValue={true} />
                <p>Product Name: {productDetails.pname}</p>
                <p>Price: {productDetails.sellingprice}</p>
                <p>Manufacture Date: {productDetails.manufacturingdate}</p>
                <p>Expiry Date: {productDetails.expirydate}</p>
            </div>
            <button onClick={handlePrint}>Print Barcode</button>
            <button onClick={onClose}>Close</button>
        </div>
    );
};

export default Barcodegen;