import React, { useEffect, useRef, useState } from "react";
import SpecialtyModal from "./SpecialtyModal";
import { useNavigate } from "react-router-dom";
import { DeleteConfirmationModal, Header } from "../../components";
import DataGrid, {
  Column,
  Button as GridButton,
  Sorting,
  FilterRow,
  Pager,
  Paging,
  Scrolling,
} from "devextreme-react/data-grid";
import { LoadPanel } from "devextreme-react/load-panel";
import { deleteApi, getAPI } from "../../services";
import { ShowAlert } from "../../utils/common-methods";

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
  const DataGridRef = useRef(null);

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
        setIsDeleteModalOpen(false);
        { ShowAlert(error.response.data, "Speciality")}
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
       <Header
             title={"Specialities"}
            handleAdd={handleAddClick}
            GetRecord={getSpecialityList}
            dataGridRef={DataGridRef}
          />
          <div className="mx-2 mt-2">
      <LoadPanel shadingColor="rgba(0,0,0,0.4)" visible={loadPanelVisible} />
      <DataGrid
        ref={DataGridRef}
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
        // onRowDblClick={(row) => handleEditClick(row.data)}
        height={450}
      >
        <Scrolling mode="virtual"></Scrolling>
        {/* <Paging defaultPageSize={5} /> */}
        {/* <Pager showPageSizeSelector={true} showInfo={true} /> */}
        <Sorting mode="single" />
        <FilterRow visible={true} />
        <Column
          dataField="SpecialityName"
          caption="Speciality Name"
          minWidth={200}
        ></Column>
        <Column type="buttons">
          <GridButton
            text="Edit"
            icon="edit"
            onClick={(row) => handleEditClick(row.row.data)}
          />
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
      </div>
    </React.Fragment>
  );
};

export default SpecialtyList;
