import React, { useCallback, useEffect, useState } from "react";
import { Button } from "devextreme-react";
import AppointmentModal from "./AppointmentModal";
import { useNavigate } from "react-router-dom";
import { DeleteConfirmationModal } from "../../components";
import moment from "moment";
import DataGrid, {
  Column,
  Button as GridButton,
  GroupPanel,
  Sorting,
  FilterRow,
  HeaderFilter,
  Pager,
  Paging,
} from "devextreme-react/data-grid";
import { LoadPanel } from "devextreme-react/load-panel";
import { deleteApi, getAPI, postAPI, putAPI } from "../../services";

const AppointmentList = () => {
  const token = localStorage.getItem("token");
  const baseUrl = process.env.REACT_APP_BASE_URL;
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [stateList, setStateList] = useState([]);
  const [filterCity, setFilterCity] = useState([]);
  const [cityList, setCityList] = useState([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteAppointmentId, setDeleteAppointmentId] = useState(null);
  const tenYearsAgo = new Date();
  tenYearsAgo.setFullYear(tenYearsAgo.getFullYear() - 10);
  const initialData = {
    appointmentID: 0,
    appointmentDateTime: moment().toDate(),
    firstName: "",
    lastName: "",
    fullName: "",
    dob: tenYearsAgo,
    gender: null,
    mobileNo: "",
    maritalStatus: null,
    address: "",
    stateID: null,
    cityID: null,
    reasonForAppointment: "",
    specialityID: null,
    doctorID: null,
  };
  const [patientAppointment, setPatientAppointment] = useState(initialData);
  const deleteMessage = "Are you sure you want to delete this Appointment?";
  const [loadPanelVisible, setLoadPanelVisible] = useState(false);
  const [primaryKey, setPrimaryKey] = useState(null);
  const [focusedRowKey, setfocusedRowKey] = useState(0);

  useEffect(() => {
    if (!token) {
      navigate("/");
    }
  }, []);

  useEffect(() => {
    let filteredCities = cityList.filter(
      (city) => city.StateID === parseInt(patientAppointment.stateID)
    );
    setFilterCity(filteredCities);
  }, [patientAppointment.stateID]);

  const fetchPatientList = async () => {
    setLoadPanelVisible(true);
    try {
      const apiUrl = `${baseUrl}Patient/GetList`;
      const responseData = await getAPI(apiUrl, token);
      setAppointments(responseData);
      setLoadPanelVisible(false);
    } catch (error) {
      console.error("Error:", error.message);
      setLoadPanelVisible(false);
    }
    setfocusedRowKey(primaryKey);
    setPrimaryKey(0);
  };

  const fetchStateList = async () => {
    try {
      const apiUrl = `${baseUrl}State/GetList`;
      const responseData = await getAPI(apiUrl, token);
      setStateList(responseData);
    } catch (error) {
      console.error("Error:", error.message);
    }
  };

  const fetchCityList = async () => {
    try {
      const apiUrl = `${baseUrl}City/GetList`;
      const responseData = await getAPI(apiUrl, token);
      setCityList(responseData);
    } catch (error) {
      console.error("Error:", error.message);
    }
  };

  useEffect(() => {
    fetchPatientList();
    fetchStateList();
    fetchCityList();
  }, []);

  const handleCloseModal = () => {
    setPatientAppointment(initialData);
    setIsModalOpen(false);
    setSelectedAppointment(null);
  };

  const handleAddClick = () => {
    setSelectedAppointment(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (appointment) => {
    setSelectedAppointment(appointment);
    setIsModalOpen(true);
  };

  const handleSaveAppointment = async (e) => {
    e.preventDefault();
    debugger;
    if (selectedAppointment) {
      const selectedDateTime = new Date(patientAppointment.appointmentDateTime);
      // Get the timezone offset in minutes
      const timezoneOffset = selectedDateTime.getTimezoneOffset();
      // Adjust the date and time by subtracting the timezone offset
      selectedDateTime.setMinutes(
        selectedDateTime.getMinutes() - timezoneOffset
      );
      // Convert the adjusted date and time to ISO 8601 format
      const isoDateTime = selectedDateTime.toISOString();
      const updatedPatientData = {
        appointmentID: patientAppointment.appointmentID,
        appointmentDateTime: isoDateTime,
        firstName: patientAppointment.firstName,
        lastName: patientAppointment.lastName,
        fullName: patientAppointment.fullName,
        dob: patientAppointment.dob,
        gender: parseInt(patientAppointment.gender),
        mobileNo: patientAppointment.mobileNo.toString(),
        maritalStatus: parseInt(patientAppointment.maritalStatus),
        address: patientAppointment.address,
        stateID: parseInt(patientAppointment.stateID),
        cityID: parseInt(patientAppointment.cityID),
        reasonForAppointment: patientAppointment.reasonForAppointment,
        specialityID: parseInt(patientAppointment.specialityID),
        doctorID: parseInt(patientAppointment.doctorID),
      };
      try {
        const apiUrl = `${baseUrl}Patient/Update/`;
        await putAPI(apiUrl, updatedPatientData, token);
        fetchPatientList();
        handleCloseModal();
      } catch (error) {
        console.error("Error:", error.message);
      }
    } else {
      const selectedDateTime = new Date(patientAppointment.appointmentDateTime);
      // Get the timezone offset in minutes
      const timezoneOffset = selectedDateTime.getTimezoneOffset();
      // Adjust the date and time by subtracting the timezone offset
      selectedDateTime.setMinutes(
        selectedDateTime.getMinutes() - timezoneOffset
      );
      // Convert the adjusted date and time to ISO 8601 format
      const isoDateTime = selectedDateTime.toISOString();
      const patientData = {
        appointmentID: 0,
        appointmentDateTime: isoDateTime,
        firstName: patientAppointment.firstName,
        lastName: patientAppointment.lastName,
        fullName: patientAppointment.fullName,
        dob: patientAppointment.dob,
        gender: parseInt(patientAppointment.gender),
        mobileNo: patientAppointment.mobileNo.toString(),
        maritalStatus: parseInt(patientAppointment.maritalStatus),
        address: patientAppointment.address,
        stateID: parseInt(patientAppointment.stateID),
        cityID: parseInt(patientAppointment.cityID),
        reasonForAppointment: patientAppointment.reasonForAppointment,
        specialityID: parseInt(patientAppointment.specialityID),
        doctorID: parseInt(patientAppointment.doctorID),
      };
      try {
        const apiUrl = `${baseUrl}Patient/Insert`;
        await postAPI(apiUrl, patientData, token);
        handleCloseModal();
        fetchPatientList();
      } catch (error) {
        console.error("Error:", error.message);
      }
    }
  };

  const handleDeleteClick = async (appointmentId) => {
    setDeleteAppointmentId(appointmentId);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirmed = async () => {
    try {
      const apiUrl = `${baseUrl}Patient/Delete`;
      await deleteApi(apiUrl, deleteAppointmentId, token);
      fetchPatientList();
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error("Error:", error.message);
    }
  };

  const handleDeleteModalClose = () => {
    setIsDeleteModalOpen(false);
  };

  const handleChange = useCallback((name, value) => {
    setPatientAppointment((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  }, []);

  const handleDateChange = (value) => {
    setPatientAppointment({ ...patientAppointment, dob: value });
  };

  const onDateTimeValueChanged = useCallback((args) => {
    setPatientAppointment((prevApp) => ({
      ...prevApp,
      appointmentDateTime: args.value,
    }));
  }, []);
  const onDateValueChanged = useCallback((args) => {
    setPatientAppointment((prevApp) => ({
      ...prevApp,
      dob: args.value,
    }));
  }, []);

  const handleDoctorChange = (selectedOption) => {
    setPatientAppointment({
      ...patientAppointment,
      doctorID: selectedOption.value,
    });
  };

  const handleSpecialtyChange = useCallback((args) => {
    setPatientAppointment((prevApp) => ({
      ...prevApp,
      specialityID: args.value,
    }));
  }, []);

  const handleStateChange = useCallback((args) => {
    setPatientAppointment((prevApp) => ({
      ...prevApp,
      stateID: args.value,
    }));
  }, []);

  const handleGenderChange = useCallback((args) => {
    setPatientAppointment((prevApp) => ({
      ...prevApp,
      gender: args.value,
    }));
  }, []);
  const handleMaritalStatusChange = useCallback((args) => {
    setPatientAppointment((prevApp) => ({
      ...prevApp,
      maritalStatus: args.value,
    }));
  }, []);

  const handleCityChange = useCallback((args) => {
    setPatientAppointment((prevApp) => ({
      ...prevApp,
      cityID: args.value,
    }));
  }, []);

  function onFocusedRowChanged(e) {
    setfocusedRowKey(e.component.option("focusedRowKey"));
  }

  return (
    <React.Fragment>
      <LoadPanel shadingColor="rgba(0,0,0,0.4)" visible={loadPanelVisible} />
      <h2 className={"content-block ms-0"}>Appointments</h2>
      <div className="w-100 d-flex justify-content-end">
        <Button variant="primary" onClick={handleAddClick}>
          Add
        </Button>
      </div>
      <DataGrid
        keyExpr="AppointmentID"
        dataSource={appointments}
        showBorders={true}
        showRowLines={true}
        allowColumnReordering={true}
        focusedRowEnabled={true}
        focusedRowKey={focusedRowKey}
        wordWrapEnabled={true}
        hoverStateEnabled={true}
        autoNavigateToFocusedRow={true}
        onFocusedRowChanged={onFocusedRowChanged}
        onRowDblClick={(row) => handleEditClick(row.data)}
        width="100%"
      >
        <Paging defaultPageSize={10} />
        <Pager showPageSizeSelector={true} showInfo={true} />
        <GroupPanel visible={true} />
        <Sorting mode="multiple" />
        <FilterRow visible={true} />
        <HeaderFilter visible={true} allowSearch="true" />
        <Column dataField="FullName" caption="Full Name" minWidth={200} />
        <Column
          dataField="Gender"
          caption="Gender"
          minWidth={200}
          alignment="left"
          cellRender={(data) =>
            data.value === 0 ? <td>Male</td> : <td>Female</td>
          }
        >
          <HeaderFilter
            allowSelectAll={true}
            dataSource={[
              { value: 0, text: "Male" },
              { value: 1, text: "Female" },
            ]}
          ></HeaderFilter>
        </Column>
        <Column
          dataField="SpecialityName"
          caption="Speciality Name"
          minWidth={200}
        />
        <Column dataField="DoctorName" caption="Doctor Name" minWidth={200} />
        <Column type="buttons" minWidth={250}>
          {/* <GridButton
            text="Edit"
            icon="edit"
            onClick={(row) => handleEditClick(row.row.data)}
          /> */}
          <GridButton
            text="Delete"
            icon="trash"
            onClick={(row) => handleDeleteClick(row.row.data.AppointmentID)}
            cssClass="text-danger"
          />
        </Column>
      </DataGrid>

      {isModalOpen && (
        <AppointmentModal
          show={isModalOpen}
          handleClose={handleCloseModal}
          handleSave={handleSaveAppointment}
          selectedAppointment={selectedAppointment}
          patientAppointment={patientAppointment}
          handleChange={handleChange}
          handleDateChange={handleDateChange}
          handleDoctorChange={handleDoctorChange}
          handleSpecialtyChange={handleSpecialtyChange}
          stateList={stateList}
          handleStateChange={handleStateChange}
          cityList={filterCity}
          handleCityChange={handleCityChange}
          setPatientAppointment={setPatientAppointment}
          handleGenderChange={handleGenderChange}
          handleMaritalStatusChange={handleMaritalStatusChange}
          onDateTimeValueChanged={onDateTimeValueChanged}
          onDateValueChanged={onDateValueChanged}
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

export default AppointmentList;
