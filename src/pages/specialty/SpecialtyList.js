import React, { useCallback, useEffect, useState } from "react";
import { Button } from "devextreme-react";
import SpecialtyModal from "./SpecialtyModal";
import { useNavigate } from "react-router-dom";
import { DeleteConfirmationModal } from "../../components";
import DataGrid, {
  Column,
  Button as GridButton,
  Sorting,
  FilterRow,
  Pager,
  Paging,
} from "devextreme-react/data-grid";
import { LoadPanel } from "devextreme-react/load-panel";
import { deleteApi, getAPI, postAPI, putAPI } from "../../services";

const SpecialtyList = () => {
  const token = localStorage.getItem("token");
  const baseUrl = process.env.REACT_APP_BASE_URL;
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [specialties, setSpecialties] = useState([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState(null);
  const [deleteSpecialtyId, setDeleteSpecialtyId] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [inUseError, setInUseError] = useState(false);
  const deleteMessage = "Are you sure you want to delete this Specialty?";
  const [loadPanelVisible, setLoadPanelVisible] = useState(false);
  const [focusedRowKey, setfocusedRowKey] = useState(0);
  const [primaryKey, setPrimaryKey] = useState(null);

  useEffect(() => {
    if (!token) {
      navigate("/");
    }
  }, []);

  const getSpecialityList = async () => {
    setLoadPanelVisible(true);
    try {
      const apiUrl = `${baseUrl}Speciality/GetList`;
      const responseData = await getAPI(apiUrl, token);
      console.log("specialityList", responseData);
      setSpecialties(responseData);
      setLoadPanelVisible(false);
    } catch (error) {
      console.error("Error:", error.message);
      setLoadPanelVisible(false);
    }
    setfocusedRowKey(primaryKey);
    setPrimaryKey(0);
  };

  useEffect(() => {
    getSpecialityList();
  }, []);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSpecialty(null);
    // setSpeciality(initialData);
    getSpecialityList();
  };

  const handleAddClick = () => {
    setIsModalOpen(true);
  };

  const handleEditClick = (specialty) => {
    setSelectedSpecialty(specialty.SpecialityID);
    setIsModalOpen(true);
  };

  const handleDeleteClick = async (id) => {
    setDeleteSpecialtyId(id);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirmed = async () => {
    try {
      const apiUrl = `${baseUrl}Speciality/Delete`;
      await deleteApi(apiUrl, deleteSpecialtyId, token);
      getSpecialityList();
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error("Error:", error.message);
      if (
        error.response &&
        error.response.data.includes("Selected record exists in Doctors.")
      ) {
        setInUseError(true);
      }
    }
  };

  const handleDeleteModalClose = () => {
    setIsDeleteModalOpen(false);
    setInUseError(false);
  };

  function onFocusedRowChanged(e) {
    setfocusedRowKey(e.component.option("focusedRowKey"));
  }

  return (
    <React.Fragment>
      <LoadPanel shadingColor="rgba(0,0,0,0.4)" visible={loadPanelVisible} />
      <h2 className={"content-block ms-0"}>Specialities</h2>
      <div className="w-100 d-flex justify-content-end mb-3">
        <Button variant="primary" onClick={handleAddClick}>
          Add
        </Button>
      </div>
      <DataGrid
        dataSource={specialties}
        keyExpr="SpecialityID"
        showBorders={true}
        showRowLines={true}
        focusedRowEnabled={true}
        focusedRowKey={focusedRowKey}
        wordWrapEnabled={true}
        hoverStateEnabled={true}
        autoNavigateToFocusedRow={true}
        onFocusedRowChanged={onFocusedRowChanged}
        onRowDblClick={(row) => handleEditClick(row.data)}
      >
        <Paging defaultPageSize={5} />
        <Pager showPageSizeSelector={true} showInfo={true} />
        <Sorting mode="single" />
        <FilterRow visible={true} />
        <Column
          dataField="SpecialityName"
          caption="Speciality Name"
          minWidth={200}
        ></Column>
        <Column type="buttons">
          {/* <GridButton
            text="Edit"
            icon="edit"
            onClick={(row) => handleEditClick(row.row.data)}
          /> */}
          <GridButton
            text="Delete"
            icon="trash"
            onClick={(row) => handleDeleteClick(row.row.data.SpecialityID)}
            cssClass="text-danger"
          />
        </Column>
      </DataGrid>

      {isModalOpen && (
        <SpecialtyModal
          show={isModalOpen}
          handleClose={handleCloseModal}
          selectedSpecialty={selectedSpecialty}
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

export default SpecialtyList;
