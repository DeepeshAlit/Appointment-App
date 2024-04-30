import React, { useCallback, useEffect, useState } from "react";
import { Button } from "devextreme-react";
import ItemModal from "./ItemModal";
import { useNavigate } from "react-router-dom";
import { DeleteConfirmationModal } from "../../components";
import DataGrid, {
  Column,
  Button as GridButton,
  FilterRow,
  Pager,
  Paging,
  Sorting,
} from "devextreme-react/data-grid";
import { LoadPanel } from "devextreme-react/load-panel";
import "devextreme/data/odata/store";
import { deleteApi, getAPI, postAPI, putAPI } from "../../services";

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
    console.log("selected",selectedItem)
    debugger
    e.preventDefault();
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
    setSelectedItem(item.ItemID)
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
      <h2 className={"content-block d-flex ms-0"}>Items</h2>
      <div className="w-100 d-flex justify-content-end mb-3">
        <Button variant="primary" onClick={handleAddClick}>
          Add
        </Button>
      </div>
      <LoadPanel shadingColor="rgba(0,0,0,0.4)" visible={loadPanelVisible} />

      <DataGrid
        keyExpr="ItemID"
        dataSource={itemsList}
        showBorders={true}
        showRowLines={true}
        focusedRowEnabled={true}
        focusedRowKey={focusedRowKey}
        wordWrapEnabled={true}
        hoverStateEnabled={true}
        autoNavigateToFocusedRow={true}
        onFocusedRowChanged={onFocusedRowChanged}
        onRowDblClick={(row)=>handleEditClick(row.data)}
      >
        <Paging defaultPageSize={10} />
        <Pager showPageSizeSelector={true} showInfo={true} />
        <FilterRow visible={true} />

        <Column dataField={"ItemName"} caption={"Item Name"} minWidth={250} />
        <Column type="buttons">
          {/* <GridButton
            text="Edit"
            icon="edit"
            onClick={(row) => handleEditClick(row.row.data)}
          /> */}
          <GridButton
            text="Delete"
            icon="trash"
            onClick={(row) => handleDeleteClick(row.row.data.ItemID)}
            cssClass='text-danger'
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
    </React.Fragment>
  );
};

export default ItemList;
