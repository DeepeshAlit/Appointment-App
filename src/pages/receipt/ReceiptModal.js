import React, { useEffect, useCallback } from "react";
import { Validator, RequiredRule } from "devextreme-react/validator";
import { Button } from "devextreme-react/button";
import { Popup } from "devextreme-react/popup";
import TextBox from "devextreme-react/text-box";
import DateBox from "devextreme-react/date-box";
import DataGrid, {
  Column,
  Editing,
  RequiredRule as Required,
  Lookup,
} from "devextreme-react/data-grid";

const ReceiptModal = ({
  show,
  handleClose,
  handleSave,
  selectedReceipt,
  receiptData,
  handleDateChange,
  handleChange,
  setReceiptData,
  itemList,
}) => {
  const formattedItemOptions = itemList.map((item) => ({
    Name: item.ItemName,
    ID: item.ItemID,
  }));

  const dataDetail = selectedReceipt?.ReceiptDetail.map((item) => {
    return {
      receiptDetailID: item.ReceiptDetailID,
      receiptID: item.ReceiptID,
      itemID: item.ItemID,
      quantity: item.Quantity,
      rate: item.Rate,
      discount: item.Discount,
      discountPercent: item.Discount,
      amount: item.Amount,
      itemName: "",
      unit: "",
      grossAmount: 0,
    };
  });

  useEffect(() => {
    if (selectedReceipt) {
      setReceiptData({
        ...receiptData,
        receiptNo: selectedReceipt.ReceiptNo,
        personName: "",
        receiptDate: selectedReceipt.ReceiptDate,
        doctorID: selectedReceipt.DoctorID,
        netAmount: selectedReceipt.NetAmount,
        remarks: selectedReceipt.Remarks,
        receiptDetail: dataDetail,
      });
    }
  }, [selectedReceipt]);

  // Calculate gross amount
  const calculateGrossAmount = (item) => {
    // return item.quantity * item.rate;
    return item?.data?.quantity * item?.data?.rate;
  };

  // Calculate discount amount
  const calculateDiscountAmount = useCallback((item) => {
    const disAmt =
      (item?.data?.quantity * item?.data?.rate * item?.data?.discountPercent) /
      100;
    return disAmt;
  }, []);

  // Calculate total amount
  const calculateAmount = (item) => {
    const grossAmount = calculateGrossAmount(item);
    const discountAmount = calculateDiscountAmount(item);
    const amnt = grossAmount - discountAmount;
    item["amount"] = amnt;
    return grossAmount - discountAmount;
  };
  const totalAmount = receiptData.receiptDetail.reduce(
    (total, detail) =>
      total +
      detail.rate * detail.quantity -
      (detail.quantity * detail.rate * detail.discountPercent) / 100,
    0
  );
  const totalQuantity = receiptData.receiptDetail.reduce(
    (total, detail) => total + parseInt(detail.quantity),
    0
  );

  useEffect(() => {
    setReceiptData({
      ...receiptData,
      netAmount: totalAmount,
    });
  }, [totalAmount]);

  const now = new Date();

  const savethis = () => {
    setReceiptData({
      ...receiptData,
      netAmount: totalAmount,
    });
  };

  const onUpdate = (e) => {
    setReceiptData({
      ...receiptData,
      netAmount: totalAmount,
    });
  };

  return (
    <Popup
      visible={show}
      onHiding={handleClose}
      dragEnabled={false}
      hideOnOutsideClick={true}
      showCloseButton={true}
      showTitle={true}
      title={selectedReceipt ? "Edit Receipt" : "Add Receipt"}
      maxWidth={850}
      maxHeight={"95vh"}
      height={560}
    >
      <form onSubmit={handleSave}>
        <div className="d-flex justify-content-between my-2">
          <TextBox
            name="receiptNo"
            label="Receipt No"
            labelMode="floating"
            value={receiptData.receiptNo}
            readOnly={true}
          ></TextBox>

          <DateBox
            type="date"
            value={receiptData?.receiptDate ? receiptData?.receiptDate : now}
            maxLength={50}
            label="Receipt Date"
            labelMode="floating"
            onValueChanged={handleDateChange}
            validationMessagePosition="down"
            pickerType={"calendar"}
            useMaskBehavior={true}
          />
        </div>
        <TextBox
          name="personName"
          label="Person Name"
          labelMode="floating"
          placeholder="Enter Person Name"
          value={receiptData.personName}
          onValueChange={(e) => handleChange("personName", e)}
          valueChangeEvent="input"
          showClearButton={true}
          maxLength={20}
          validationMessagePosition="down"
        ></TextBox>
        <DataGrid
          dataSource={receiptData.receiptDetail}
          showBorders={true}
          onSaving={savethis}
          onRowUpdated={onUpdate}
        >
          <Editing mode="cell" allowUpdating={true} allowAdding={true} />

          <Column dataField="itemID" caption="Item Name">
            <Lookup
              dataSource={formattedItemOptions}
              displayExpr="Name"
              valueExpr="ID"
            />
            <Required />
          </Column>
          <Column dataField="rate" caption="Rate" dataType="number">
            <Required />
          </Column>
          <Column dataField="quantity" caption="Quantity" dataType="number">
            <Required />
          </Column>
          <Column
            dataField="grossAmount"
            caption="Gross Amount"
            cellRender={calculateGrossAmount}
            allowEditing={false}
          />
          <Column
            dataField="discountPercent"
            caption="Discount Percent"
            dataType="number"
          >
            <Required />
          </Column>
          <Column
            dataField="discount"
            caption="Discount Amount"
            cellRender={calculateDiscountAmount}
            allowEditing={false}
          />
          <Column
            dataField="amount"
            caption="Amount"
            cellRender={calculateAmount}
            allowEditing={false}
          />
        </DataGrid>
        <div className="d-flex flex-column gap-2 my-2">
          <TextBox
            name="totalQuantity"
            label="Total Quantity"
            labelMode="floating"
            placeholder="Total Quantity"
            value={totalQuantity ? totalQuantity : 0}
            maxLength={20}
            readOnly={true}
          ></TextBox>
          <TextBox
            name="netAmount"
            label="Net Amount"
            labelMode="floating"
            placeholder="Net Amount"
            value={receiptData.netAmount}
            readOnly={true}
            maxLength={20}
          ></TextBox>
          <TextBox
            name="remarks"
            label="Remarks"
            labelMode="floating"
            placeholder="Remarks"
            value={receiptData.remarks}
            valueChangeEvent="input"
            onValueChange={(e) => handleChange("remarks", e)}
            showClearButton={true}
            maxLength={40}
            validationMessagePosition="down"
          >
            <Validator>
              <RequiredRule message="Please Enter Remarks" />
            </Validator>
          </TextBox>
        </div>

        <div className="d-flex justify-content-end gap-2 mt-3">
          <Button
            text="Cancel"
            type="normal"
            stylingMode="outlined"
            onClick={handleClose}
          />
          <Button
            useSubmitBehavior={true}
            text={selectedReceipt ? "Update" : "Save"}
            type="default"
            stylingMode="contained"
          />
        </div>
      </form>
    </Popup>
  );
};

export default ReceiptModal;
