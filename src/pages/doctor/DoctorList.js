import React, { useCallback, useEffect, useState } from "react";
import { Button } from "devextreme-react";
import DoctorModal from "./DoctorModal";
import { useNavigate } from "react-router-dom";
import { DeleteConfirmationModal } from "../../components";
import { LoadPanel } from "devextreme-react/load-panel";
import DataGrid, {
  Column,
  Button as GridButton,
  HeaderFilter,
  FilterRow,
  Sorting,
  Grouping,
  GroupPanel,
  Lookup,
  Paging,
  Pager,
} from "devextreme-react/data-grid";
import { deleteApi, getAPI } from "../../services";
const DoctorList = () => {
  const baseUrl = process.env.REACT_APP_BASE_URL;
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [doctorsList, setDoctorsList] = useState([]);
  const [specialtiesList, setSpecialtiesList] = useState([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteDoctorId, setDeleteDoctorId] = useState(null);
  const [primaryKey, setPrimaryKey] = useState(null);
  const [focusedRowKey, setfocusedRowKey] = useState(0);
  const [inUseError, setInUseError] = useState(false);
  const [loadPanelVisible, setLoadPanelVisible] = useState(false);
  const deleteMessage = "Are you sure you want to delete this Doctor?";

  useEffect(() => {
    if (!token) {
      navigate("/");
    }
  }, []);

  const fetchDoctorList = async () => {
    setLoadPanelVisible(true);
    try {
      const apiUrl = `${baseUrl}Doctor/GetList`;
      const responseData = await getAPI(apiUrl, token);
      setDoctorsList(responseData);
      setLoadPanelVisible(false);
    } catch (error) {
      console.error("Error:", error.message);
      setLoadPanelVisible(false);
    }
    setfocusedRowKey(primaryKey);
    setPrimaryKey(0);
  };

  const fetchSpecialtyList = async () => {
    try {
      const apiUrl = `${baseUrl}Speciality/GetLookupList`;
      const responseData = await getAPI(apiUrl, token);
      setSpecialtiesList(responseData);
    } catch (error) {
      console.error("Error:", error.message);
    }
  };

  useEffect(() => {
    fetchDoctorList();
    fetchSpecialtyList();
  }, []);

  const handleAddClick = () => {
    setSelectedDoctor(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    fetchDoctorList();
    fetchSpecialtyList();
    // setDoctor(initialData);
  };

  const handleEditDoctor = (doctor) => {
    setSelectedDoctor(doctor.DoctorID);
    setIsModalOpen(true);
  };

  const handleDeleteDoctor = async (id) => {
    setDeleteDoctorId(id);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirmed = async () => {
    try {
      const apiUrl = `${baseUrl}Doctor/Delete`;
      await deleteApi(apiUrl, deleteDoctorId, token);
      fetchDoctorList();
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error("Error:", error.message);
      if (
        error.response &&
        error.response.data.includes("Selected record exists in Patients")
      ) {
        setInUseError(true);
      }
    }
  };


  const handleDeleteModalClose = () => {
    setIsDeleteModalOpen(false);
    setInUseError(false);
  };

  const formattedSpecialtyOptions = specialtiesList.map((specialty) => ({
    Name: specialty.SpecialityName,
    ID: specialty.SpecialityID,
  }));

  function onFocusedRowChanged(e) {
    setfocusedRowKey(e.component.option("focusedRowKey"));
  }

  return (
    <React.Fragment>
      <h2 className={"content-block ms-0"}>Doctors</h2>
      <div className="w-100 d-flex justify-content-end my-2">
        <Button variant="primary" onClick={handleAddClick}>
          Add
        </Button>
      </div>
      <LoadPanel shadingColor="rgba(0,0,0,0.4)" visible={loadPanelVisible} />
      <DataGrid
        id="dataGrid"
        keyExpr="DoctorID"
        allowColumnReordering={true}
        dataSource={doctorsList}
        showBorders={true}
        showRowLines={true}
        focusedRowEnabled={true}
        focusedRowKey={focusedRowKey}
        wordWrapEnabled={true}
        hoverStateEnabled={true}
        autoNavigateToFocusedRow={true}
        onFocusedRowChanged={onFocusedRowChanged}
        onRowDblClick={(row) => handleEditDoctor(row.data)}
      >
        <Paging defaultPageSize={10} />
        <Pager showPageSizeSelector={true} showInfo={true} />

        <Grouping autoExpandAll={true} />
        <GroupPanel visible={true} />
        <Sorting mode="multiple" />
        <FilterRow visible={true} />
        <HeaderFilter visible={true} allowSearch="true" />
        <Column
          dataField="DoctorName"
          caption="Doctor Name"
          minWidth={250}
        ></Column>
        <Column
          dataField="SpecialityID"
          caption="Speciality Name"
          minWidth={250}
        >
          <Lookup
            dataSource={formattedSpecialtyOptions}
            displayExpr="Name"
            valueExpr="ID"
          />
        </Column>
        <Column
          dataField="Education"
          caption="Education"
          minWidth={250}
        ></Column>
        <Column type="buttons" minWidth={100}>
          {/* <GridButton
            text="Edit"
            icon="edit"
            onClick={(row) => handleEditDoctor(row.row.data)}
          /> */}
          <GridButton
            text="Delete"
            icon="trash"
            onClick={(row) => handleDeleteDoctor(row.row.data.DoctorID)}
            cssClass="text-danger"
          />
        </Column>
      </DataGrid>

      {isModalOpen && (
        <DoctorModal
          show={isModalOpen}
          handleClose={handleCloseModal}
          selectedDoctor={selectedDoctor}
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

export default DoctorList;
