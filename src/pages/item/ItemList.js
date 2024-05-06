import React, { useCallback, useEffect, useRef, useState } from "react";
import ItemModal from "./ItemModal";
import { useNavigate } from "react-router-dom";
import { DeleteConfirmationModal, Header } from "../../components";
import DataGrid, {
  Column,
  Button as GridButton,
  FilterRow,
  Scrolling,
} from "devextreme-react/data-grid";
import { LoadPanel } from "devextreme-react/load-panel";
import "devextreme/data/odata/store";
import { deleteApi, getAPI, postAPI, putAPI } from "../../services";
import { useScreenSize } from "../../utils/media-query";
import { ShowAlert } from "../../utils/common-methods";

const ItemList = () => {
  const baseUrl = process.env.REACT_APP_BASE_URL;
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [itemsList, setItemsList] = useState([]);
  const initialData = {
    itemName: "",
  };
  const [item, setItem] = useState(initialData);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState(null);
  const deleteMessage = "Are you sure you want to delete this item?";
  const [inUseError, setInUseError] = useState(false);
  const [loadPanelVisible, setLoadPanelVisible] = useState(false);
  const [primaryKey, setPrimaryKey] = useState(null);
  const [focusedRowKey, setfocusedRowKey] = useState(0);
  const { isXSmall } = useScreenSize();
  const DataGridRef = useRef(null);

  useEffect(() => {
    if (!token) {
      navigate("/");
    }
  }, []);

  const getItemsList = async () => {
    setLoadPanelVisible(true);
    try {
      const apiUrl = `${baseUrl}Item/GetList`;
      const responseData = await getAPI(apiUrl, token);
      setItemsList(responseData);
      setLoadPanelVisible(false);
    } catch (error) {
      console.error("Error:", error.message);
      setLoadPanelVisible(false);
    }
    setfocusedRowKey(primaryKey);
    setPrimaryKey(0);
  };

  useEffect(() => {
    getItemsList();
  }, []);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
    setItem(initialData);
  };

  const handleAddClick = () => {
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    // e.preventDefault();
    if (selectedItem) {
      const updatedItemData = {
        itemID: selectedItem,
        itemName: item.itemName,
      };
      // Update Item
      try {
        const apiUrl = `${baseUrl}Item/Update/`;
        await putAPI(apiUrl, updatedItemData, token);
        getItemsList();
        handleCloseModal();
      } catch (error) {
        console.error("Error:", error.message);
      }
    } else {
      // Add new item
      const newItem = { ItemName: item.itemName };
      try {
        const apiUrl = `${baseUrl}Item/Insert`;
        await postAPI(apiUrl, newItem, token);
        getItemsList();
        handleCloseModal();
      } catch (error) {
        console.error("Error:", error.message);
      }
    }
  };

  const handleEditClick = (item) => {
    // setSelectedItem(item);
    setIsModalOpen(true);
    setSelectedItem(item.ItemID);
  };

  const handleDeleteClick = async (itemId) => {
    setDeleteItemId(itemId);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirmed = async () => {
    try {
      const apiUrl = `${baseUrl}Item/Delete`;
      await deleteApi(apiUrl, deleteItemId, token);
      getItemsList();
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error("Error:", error.message);
      if (
        error.response &&
        error.response.data.includes("The statement has been terminated")
      ) {
        setIsDeleteModalOpen(false);
        { ShowAlert ("Cannot delete.Selected record exists in Appointments.", "Items")}
        setInUseError(true);
      }
    }
  };

  const handleChange = useCallback((name, args) => {
    // const { name, value } = args;
    console.log("args", name, args);
    setItem((prevState) => ({
      ...prevState,
      [name]: args,
    }));
  }, []);

  const handleDeleteModalClose = () => {
    setIsDeleteModalOpen(false);
    setInUseError(false);
  };

  function onFocusedRowChanged(e) {
    setfocusedRowKey(e.component.option("focusedRowKey"));
  }

  return (
    <React.Fragment>
      <Header
        title={"Items"}
        menuToggleEnabled={isXSmall}
        handleAdd={handleAddClick}
        GetRecord={getItemsList}
        dataGridRef={DataGridRef}
      />
      <div className="mx-2">
        <LoadPanel shadingColor="rgba(0,0,0,0.4)" visible={loadPanelVisible} />

        <DataGrid
          keyExpr="ItemID"
          ref={DataGridRef}
          dataSource={itemsList}
          showBorders={true}
          showRowLines={true}
          focusedRowEnabled={true}
          focusedRowKey={focusedRowKey}
          wordWrapEnabled={true}
          hoverStateEnabled={true}
          autoNavigateToFocusedRow={true}
          onFocusedRowChanged={onFocusedRowChanged}
          // onRowDblClick={(row) => handleEditClick(row.data)}
          className="mt-2"
          height={450}
        >
          <Scrolling mode="virtual"></Scrolling>
          {/* <Paging defaultPageSize={5}  /> */}
          {/* <Pager showPageSizeSelector={true} showInfo={true}  /> */}
          <FilterRow visible={true} />

          <Column dataField={"ItemName"} caption={"Item Name"} minWidth={250} />
          <Column type="buttons">
            <GridButton
            text="Edit"
            icon="edit"
            onClick={(row) => handleEditClick(row.row.data)}
          />
            <GridButton
              text="Delete"
              icon="trash"
              onClick={(row) => handleDeleteClick(row.row.data.ItemID)}
              cssClass="text-danger"
            />
          </Column>
        </DataGrid>

        {isModalOpen && (
          <ItemModal
            show={isModalOpen}
            handleClose={handleCloseModal}
            handleSave={handleSave}
            selectedItem={selectedItem}
            item={item}
            setItem={setItem}
            handleChange={handleChange}
          />
        )}
        <DeleteConfirmationModal
          show={isDeleteModalOpen}
          handleClose={handleDeleteModalClose}
          handleDelete={handleDeleteConfirmed}
          deleteMessage={deleteMessage}
          inUseError={inUseError}
        />
      </div>
    </React.Fragment>
  );
};

export default ItemList;
