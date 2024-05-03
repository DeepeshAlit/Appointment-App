import React, { useCallback, useEffect, useRef, useState } from "react";
import ReceiptModal from "./ReceiptModal";
import { useNavigate } from "react-router-dom";
import { DeleteConfirmationModal, Header } from "../../components";
import DataGrid, {
  Column,
  Button as GridButton,
  GroupPanel,
  Sorting,
  FilterRow,
  HeaderFilter,
  Scrolling,
  ColumnChooser,
} from "devextreme-react/data-grid";
import { LoadPanel } from "devextreme-react/load-panel";
import moment from "moment";
import { deleteApi, getAPI, postAPI, putAPI } from "../../services";
import { alert } from "devextreme/ui/dialog";

const ReceiptList = () => {
  const token = localStorage.getItem("token");
  const baseUrl = process.env.REACT_APP_BASE_URL;
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [receipts, setReceipts] = useState([]);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [itemList, setItemList] = useState([]);
  const [deleteReceiptId, setDeleteReceiptId] = useState(null);
  const [loadPanelVisible, setLoadPanelVisible] = useState(false);
  const [primaryKey, setPrimaryKey] = useState(null);
  const [focusedRowKey, setfocusedRowKey] = useState(0);
  const DataGridRef = useRef(null);

  const initialData = {
    receiptID: 0,
    receiptNo: `${new Date().getFullYear()}${Math.floor(
      Math.random() * 10000
    )}`,
    personName: "",
    receiptDate: "",
    doctorID: 14,
    netAmount: 0,
    remarks: "",
    receiptDetail: [],
  };

  const [receiptData, setReceiptData] = useState(initialData);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const deleteMessage = "Are you sure you want to delete this Receipt?";

  useEffect(() => {
    if (!token) {
      navigate("/");
    }
  }, []);

  const fetchReceiptList = async () => {
    setLoadPanelVisible(true);
    try {
      const apiUrl = `${baseUrl}Receipt/GetList`;
      const responseData = await getAPI(apiUrl, token);
      console.log("responseList", responseData);
      setReceipts(responseData);
      setLoadPanelVisible(false);
    } catch (error) {
      console.error("Error:", error.message);
      setLoadPanelVisible(false);
    }
    setfocusedRowKey(primaryKey);
    setPrimaryKey(0);
  };
  const fetchItemsList = async () => {
    try {
      const apiUrl = `${baseUrl}Item/GetLookupList`;
      const responseData = await getAPI(apiUrl, token);
      setItemList(responseData);
    } catch (error) {
      console.error("Error:", error.message);
    }
  };

  useEffect(() => {
    fetchReceiptList();
    fetchItemsList();
  }, []);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedReceipt(null);
    setReceiptData(initialData);
  };

  const handleAddClick = () => {
    setSelectedReceipt(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    if (!receiptData.receiptDetail.length) {
      alert("Please add row before Save.");
    }
    e.preventDefault();
    if (selectedReceipt) {
      const extractReceiptDetailItems = () => {
        const extractedItems = receiptData.receiptDetail.map((detail) => ({
          receiptDetailID: detail.receiptDetailID,
          receiptID: detail.receiptID,
          itemID: detail.itemID,
          quantity: parseFloat(detail.quantity),
          rate: parseFloat(detail.rate),
          discount: parseFloat(detail.discountPercent),
          amount: detail.amount,
        }));

        return extractedItems;
      };
      const extractedItems = extractReceiptDetailItems();
      const updatedReceiptData = {
        receiptID: selectedReceipt.receiptID,
        receiptNo: parseFloat(receiptData.receiptNo),
        receiptDate: receiptData.receiptDate,
        doctorID: 14,
        netAmount: parseFloat(receiptData.netAmount),
        remarks: receiptData.remarks,
        receiptDetail: extractedItems,
      };

      try {
        const apiUrl = `${baseUrl}Receipt/Update/`;
        await putAPI(apiUrl, updatedReceiptData, token);
        fetchReceiptList();
        handleCloseModal();
      } catch (error) {
        console.error("Error:", error.message);
      }
    } else {
      const extractReceiptDetailItems = () => {
        const extractedItems = receiptData.receiptDetail.map((detail) => ({
          receiptDetailID: 0,
          receiptID: 0,
          itemID: detail.itemID,
          quantity: parseFloat(detail.quantity),
          rate: parseFloat(detail.rate),
          discount: parseFloat(detail.discountPercent),
          amount: detail.amount,
        }));

        return extractedItems;
      };
      const extractedItems = extractReceiptDetailItems();
      const receiptAddData = {
        receiptID: 0,
        receiptNo: parseFloat(receiptData.receiptNo),
        receiptDate: receiptData.receiptDate,
        doctorID: 14,
        netAmount: parseFloat(receiptData.netAmount),
        remarks: receiptData.remarks,
        receiptDetail: extractedItems,
      };
      try {
        const apiUrl = `${baseUrl}Receipt/Insert`;
        await postAPI(apiUrl, receiptAddData, token);
        fetchReceiptList();
        handleCloseModal();
      } catch (error) {
        console.error("Error:", error.message);
      }
    }
  };

  const fetchReceiptById = async (receiptId) => {
    try {
      const apiUrl = `${baseUrl}Receipt/GetById/${receiptId}`;
      const responseData = await getAPI(apiUrl, token);
      setSelectedReceipt({ ...responseData, receiptID: receiptId });
    } catch (error) {
      console.error("Error:", error.message);
    }
  };

  const handleEditClick = (receipt) => {
    fetchReceiptById(receipt.ReceiptID);

    setIsModalOpen(true);
  };

  const handleDeleteClick = async (id) => {
    setDeleteReceiptId(id);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirmed = async () => {
    try {
      const apiUrl = `${baseUrl}Receipt/Delete`;
      await deleteApi(apiUrl, deleteReceiptId, token);
      fetchReceiptList();
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error("Error:", error.message);
    }
  };

  const handleDateChange = useCallback((args) => {
    setReceiptData((prevApp) => ({
      ...prevApp,
      receiptDate: args.value,
    }));
  }, []);

  const handleChange = useCallback((name, value) => {
    setReceiptData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  }, []);

  const formatReceiptDate = (receiptDate) => {
    return moment(receiptDate).format("YYYY-MM-DD");
  };

  const handleDeleteModalClose = () => {
    setIsDeleteModalOpen(false);
  };

  function onFocusedRowChanged(e) {
    setfocusedRowKey(e.component.option("focusedRowKey"));
  }

  return (
    <React.Fragment>
      <Header
        title={"Receipts"}
        handleAdd={handleAddClick}
        GetRecord={fetchReceiptList}
        dataGridRef={DataGridRef}
      />
      <div className="mx-2 mt-2">
        <LoadPanel shadingColor="rgba(0,0,0,0.4)" visible={loadPanelVisible} />
        <DataGrid
          keyExpr="ReceiptID"
          ref={DataGridRef}
          dataSource={receipts}
          showBorders={true}
          width="100%"
          showRowLines={true}
          focusedRowEnabled={true}
          focusedRowKey={focusedRowKey}
          wordWrapEnabled={true}
          hoverStateEnabled={true}
          autoNavigateToFocusedRow={true}
          onFocusedRowChanged={onFocusedRowChanged}
          onRowDblClick={(row) => handleEditClick(row.data)}
          height={450}
        >
          <Scrolling mode="virtual" />
          <ColumnChooser enabled={true} mode="dragAndDrop" />
          {/* <Paging defaultPageSize={10} /> */}
          {/* <Pager showPageSizeSelector={true} showInfo={true} /> */}
          <GroupPanel visible={true} />
          <Sorting mode="multiple" />
          <FilterRow visible={true} />
          <HeaderFilter visible={true} allowSearch="true" />
          <Column
            dataField="ReceiptNo"
            caption="Receipt No"
            minWidth={150}
            alignment="left"
          />
          <Column
            dataField="ReceiptDate"
            caption="Receipt Date"
            minWidth={250}
            cellRender={(data) => formatReceiptDate(data.data.ReceiptDate)}
            dataType="date"
          ></Column>
          <Column
            dataField="NetAmount"
            caption="Net Amount"
            minWidth={250}
            alignment="left"
          />
          <Column dataField="Remarks" caption="Remarks" minWidth={300}></Column>
          <Column type="buttons">
            {/* <GridButton
            text="Edit"
            icon="edit"
            onClick={(row) => handleEditClick(row.row.data)}
          /> */}
            <GridButton
              text="Delete"
              icon="trash"
              onClick={(row) => handleDeleteClick(row.row.data.ReceiptID)}
              cssClass="text-danger"
            />
          </Column>
        </DataGrid>
      </div>
      {isModalOpen && (
        <ReceiptModal
          show={isModalOpen}
          handleClose={handleCloseModal}
          handleSave={handleSave}
          selectedReceipt={selectedReceipt}
          receiptData={receiptData}
          setReceiptData={setReceiptData}
          handleDateChange={handleDateChange}
          handleChange={handleChange}
          itemList={itemList}
        />
      )}

      <DeleteConfirmationModal
        show={isDeleteModalOpen}
        handleClose={handleDeleteModalClose}
        handleDelete={handleDeleteConfirmed}
        deleteMessage={deleteMessage}
      />
    </React.Fragment>
  );
};

export default ReceiptList;
