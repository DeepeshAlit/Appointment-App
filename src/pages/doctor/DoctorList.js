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
import { deleteApi, getAPI, postAPI, putAPI } from "../../services";
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
  const initialData = {
    DoctorName: "",
    SpecialityID: null,
    Education: "",
  };
  const [doctor, setDoctor] = useState(initialData);
  const [inUseError, setInUseError] = useState(false);
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
    setDoctor(initialData);
  };

  const handleSaveDoctor = async (e) => {
    e.preventDefault();
    if (selectedDoctor) {
      console.log("Selected Doctor", selectedDoctor);
      const updatedDoctorData = {
        doctorID: selectedDoctor.DoctorID,
        doctorName: doctor.DoctorName,
        specialityID: doctor.SpecialityID,
        education: doctor.Education,
      };
      try {
        const apiUrl = `${baseUrl}Doctor/Update/`;
        await putAPI(apiUrl, updatedDoctorData, token);
        fetchDoctorList();
        handleCloseModal();
      } catch (error) {
        console.error("Error:", error.message);
      }
    } else {
      // Add New Doctor
      const data = {
        doctorName: doctor?.DoctorName,
        specialityID: doctor?.SpecialityID,
        education: doctor?.Education,
      };
      try {
        const apiUrl = `${baseUrl}Doctor/Insert`;
        await postAPI(apiUrl, data, token);
        fetchDoctorList();
        handleCloseModal();
      } catch (error) {
        console.error("Error:", error.message);
      }
    }
  };

  const handleEditDoctor = (doctor) => {
    setSelectedDoctor(doctor);
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

  const handleChange = useCallback((name, args) => {
    // const { name, value } = args;
    console.log("args", name, args);
    setDoctor((prevState) => ({
      ...prevState,
      [name]: args,
    }));
  }, []);

  const handleSpecialtyChange = useCallback((args) => {
    setDoctor((prevDoctor) => ({
      ...prevDoctor,
      SpecialityID: args.value,
    }));
  }, []);

  const handleDeleteModalClose = () => {
    setIsDeleteModalOpen(false);
    setInUseError(false);
  };

  const formattedSpecialtyOptions = specialtiesList.map((specialty) => ({
    Name: specialty.SpecialityName,
    ID: specialty.SpecialityID,
  }));

  const [loadPanelVisible, setLoadPanelVisible] = useState(false);

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
        allowColumnReordering={true}
        dataSource={doctorsList}
        showBorders={true}
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
          <GridButton
            text="Edit"
            icon="edit"
            onClick={(row) => handleEditDoctor(row.row.data)}
          />
          <GridButton
            text="Delete"
            icon="trash"
            onClick={(row) => handleDeleteDoctor(row.row.data.DoctorID)}
          />
        </Column>
      </DataGrid>

      {isModalOpen && (
        <DoctorModal
          show={isModalOpen}
          handleClose={handleCloseModal}
          handleSave={handleSaveDoctor}
          selectedDoctor={selectedDoctor}
          doctor={doctor}
          handleChange={handleChange}
          setDoctor={setDoctor}
          specialtiesList={specialtiesList}
          handleSpecialtyChange={handleSpecialtyChange}
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
