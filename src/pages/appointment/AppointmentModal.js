import React, { useState, useEffect, useRef } from "react";
import { Popup } from "devextreme-react/popup";
import TextBox from "devextreme-react/text-box";
import {
  SelectBox,
  Button as TextBoxButton,
} from "devextreme-react/select-box";
import { NumberBox } from "devextreme-react/number-box";
import { Button } from "devextreme-react/button";
import {
  Validator,
  RequiredRule,
  StringLengthRule,
} from "devextreme-react/validator";
import DateBox from "devextreme-react/date-box";
import { getAPI } from "../../services";
import SpecialtyModal from "../specialty/SpecialtyModal";
import DoctorModal from "../doctor/DoctorModal";
import PopupHeader from "../../layouts/popup-header-footer/PopupHeader";

const AppointmentModal = ({
  show,
  handleClose,
  handleSave,
  selectedAppointment,
  handleChange,
  patientAppointment,
  handleDoctorChange,
  handleSpecialtyChange,
  stateList,
  handleStateChange,
  cityList,
  handleCityChange,
  setPatientAppointment,
  handleGenderChange,
  handleMaritalStatusChange,
  onDateTimeValueChanged,
  onDateValueChanged,
}) => {
  const token = localStorage.getItem("token");
  const baseUrl = process.env.REACT_APP_BASE_URL;
  const [specialtiesList, setSpecialtiesList] = useState([]);
  const [doctorsList, setDoctorsList] = useState([]);
  const [filterDoctor, setFilterDoctor] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDocModalOpen, setDocIsModalOpen] = useState(false);
  const now = new Date();
  const SelectBoxSpecialityRef = useRef(null)
  const SelectBoxDoctorRef = useRef(null)
  const ValidationGroupName = "AppointmentModalValidation";

  const fetchSpecialtyList = async () => {
    try {
      const apiUrl = `${baseUrl}Speciality/GetLookupList`;
      const responseData = await getAPI(apiUrl, token);
      setSpecialtiesList(responseData);
    } catch (error) {
      console.error("Error:", error.message);
    }
  };

  const fetchDoctorList = async () => {
    try {
      const apiUrl = `${baseUrl}Doctor/GetLookupList`;
      const responseData = await getAPI(apiUrl, token);
      setDoctorsList(responseData);
    } catch (error) {
      console.error("Error:", error.message);
    }
  };

  useEffect(() => {
    fetchSpecialtyList();
    fetchDoctorList();
  }, []);

  useEffect(() => {
    let filterDoctor = doctorsList.filter(
      (doctor) =>
        doctor.SpecialityID === parseInt(patientAppointment.specialityID)
    );
    setFilterDoctor(filterDoctor);
  }, [patientAppointment.specialityID, doctorsList]);

  useEffect(() => {
    if (selectedAppointment) {
      setPatientAppointment({
        ...patientAppointment,
        appointmentID: selectedAppointment.AppointmentID,
        appointmentDateTime: selectedAppointment.AppointmentDateTime,
        firstName: selectedAppointment.FirstName,
        lastName: selectedAppointment.LastName,
        fullName: selectedAppointment.FullName,
        dob: selectedAppointment.DOB,
        gender: selectedAppointment.Gender,
        mobileNo: selectedAppointment.MobileNo,
        maritalStatus: selectedAppointment.MaritalStatus,
        address: selectedAppointment.Address,
        stateID: selectedAppointment.StateID,
        cityID: selectedAppointment.CityID,
        reasonForAppointment: selectedAppointment.ReasonForAppointment,
        specialityID: selectedAppointment.SpecialityID,
        doctorID: selectedAppointment.DoctorID,
      });
    }
  }, [selectedAppointment, patientAppointment.appointmentID]);

  const formattedDoctorOptions = filterDoctor.map((doctor) => ({
    Name: doctor.DoctorName,
    ID: doctor.DoctorID,
  }));

  const formattedSpecialtyOptions = specialtiesList.map((specialty) => ({
    Name: specialty.SpecialityName,
    ID: specialty.SpecialityID,
  }));

  const formattedStateOptions = stateList.map((state) => ({
    Name: state.StateName,
    ID: state.StateID,
  }));

  const formattedCityOptions = cityList.map((city) => ({
    Name: city.CityName,
    ID: city.CityID,
  }));

  const genderOptions = [
    { ID: 0, Name: "Male" },
    { ID: 1, Name: "Female" },
    { ID: 2, Name: "Others" },
  ];
  const maritalStatusOptions = [
    { ID: 0, Name: "Married" },
    { ID: 1, Name: "UnMarried" },
  ];

  const minDate = new Date();
  minDate.setFullYear(minDate.getFullYear() - 10);

  const min = new Date(1900, 0, 1);
  const max = new Date();

  const tenYearsAgo = new Date();
  tenYearsAgo.setFullYear(tenYearsAgo.getFullYear() - 10);

  const AddSpecialityButton = {
    icon: "plus",
    stylingMode: "text",
    onClick: () => {
      setIsModalOpen(!isModalOpen);
    },
  };
  const AddDoctorButton = {
    icon: "plus",
    stylingMode: "text",
    onClick: () => {
      setDocIsModalOpen(!isDocModalOpen);
    },
  };

  const DoctorDownArrow = {
    icon: "spindown",
    stylingMode: "text",
    onClick: (e) => {
      var selectBoxInstance = SelectBoxDoctorRef.current?.instance;
      var isOpened = selectBoxInstance.option("opened");
      if (isOpened) {
        selectBoxInstance.close();
      } else {
        selectBoxInstance.open();
        selectBoxInstance.focus();
      }
    }
  };
  const SpecialityDownArrow = {
    icon: "spindown",
    stylingMode: "text",
    onClick: (e) => {
      var selectBoxInstance = SelectBoxSpecialityRef.current?.instance;
      var isOpened = selectBoxInstance.option("opened");
      if (isOpened) {
        selectBoxInstance.close();
      } else {
        selectBoxInstance.open();
        selectBoxInstance.focus();
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    fetchSpecialtyList();
  };
  const handleDocModalClose = () => {
    setDocIsModalOpen(false);
    fetchSpecialtyList();
    fetchDoctorList();
  };

  const handleSaveAppointment=(e)=>{
    e.preventDefault();
    handleSave();
  }

  const PopupTitle = () => {
    return (
      <>
        <PopupHeader
          ValidationGroupName={ValidationGroupName}
          onClosePopup={handleClose}
          title={[<span key={"header_title"} className="base-accent-text">{selectedAppointment?"Edit " : "Add "}</span>, "Appointment"]}
          onSubmit={handleSave}
        />
      </>
    )
  }

  return (
    <div>
      <Popup
        visible={show}
        onHiding={handleClose}
        dragEnabled={false}
        hideOnOutsideClick={true}
        showCloseButton={true}
        showTitle={true}
        titleRender={PopupTitle}
        maxWidth={600}
        height={510}
        maxHeight={"95vh"}

      >
        <form onSubmit={handleSave}>
          <DateBox
            type="datetime"
            defaultValue={now}
            value={patientAppointment.appointmentDateTime}
            min={min}
            maxLength={50}
            label="Date and Time"
            labelMode="floating"
            onValueChanged={onDateTimeValueChanged}
            validationMessagePosition="down"
            pickerType={"calendar"}
            useMaskBehavior={true}
          />
          <div className="d-md-flex my-2 gap-2">
            <TextBox
              name="firstName"
              label="First Name"
              labelMode="floating"
              placeholder="Enter First Name"
              value={patientAppointment.firstName}
              onValueChange={(e) => handleChange("firstName", e)}
              valueChangeEvent="input"
              showClearButton={true}
              maxLength={20}
              validationMessagePosition="down"
            >
              <Validator validationGroup={ValidationGroupName}>
                <RequiredRule message="Please Enter First Name" />
              </Validator>
            </TextBox>

            <TextBox
              name="lastName"
              label="Last Name"
              labelMode="floating"
              placeholder="Enter Last Name"
              value={patientAppointment.lastName}
              onValueChange={(e) => handleChange("lastName", e)}
              valueChangeEvent="input"
              showClearButton={true}
              maxLength={20}
              validationMessagePosition="down"
            >
              <Validator validationGroup={ValidationGroupName}>
                <RequiredRule message="Please Enter Last Name" />
              </Validator>
            </TextBox>
            <TextBox
              name="fullName"
              label="Full Name"
              labelMode="floating"
              placeholder="Enter Full Name"
              value={patientAppointment.fullName}
              onValueChange={(e) => handleChange("fullName", e)}
              valueChangeEvent="input"
              showClearButton={true}
              maxLength={20}
              validationMessagePosition="down"
            >
              <Validator validationGroup={ValidationGroupName}>
                <RequiredRule message="Please Enter Full Name" />
              </Validator>
            </TextBox>
          </div>
          <div className="d-md-flex my-2 gap-2">
            <DateBox
              type="date"
              value={patientAppointment.dob}
              max={tenYearsAgo}
              maxLength={50}
              label="DOB"
              labelMode="floating"
              onValueChanged={onDateValueChanged}
              validationMessagePosition="down"
              pickerType={"calendar"}
              useMaskBehavior={true}
            />

            <SelectBox
              searchEnabled={true}
              dataSource={genderOptions}
              displayExpr={"Name"}
              valueExpr={"ID"}
              value={patientAppointment.gender}
              onValueChanged={handleGenderChange}
              showDropDownButton={true}
              label="Gender"
              labelMode="floating"
              validationMessagePosition="down"
            >
              <Validator validationGroup={ValidationGroupName}>
                <RequiredRule message="Please Select the Gender" />
              </Validator>
            </SelectBox>

            <NumberBox
              name="mobileNo"
              mode="tel"
              min={0}
              step={0}
              value={patientAppointment?.mobileNo}
              maxLength={10}
              valueChangeEvent="input"
              label="Mobile Number"
              labelMode="floating"
              onValueChange={(e) => handleChange("mobileNo", e)}
              validationMessagePosition="bottom"
            >
              <Validator validationGroup={ValidationGroupName}>
                <RequiredRule message="Mobile Number is Required" />
                <StringLengthRule
                  min={10}
                  max={10}
                  message="Mobile number must be 10 digits"
                />
              </Validator>
            </NumberBox>

            <SelectBox
              searchEnabled={true}
              dataSource={maritalStatusOptions}
              displayExpr={"Name"}
              valueExpr={"ID"}
              value={patientAppointment.maritalStatus}
              onValueChanged={handleMaritalStatusChange}
              showDropDownButton={true}
              label="Marital Status"
              labelMode="floating"
              validationMessagePosition="down"
            >
              <Validator validationGroup={ValidationGroupName}>
                <RequiredRule message="Please Select the Marital Status" />
              </Validator>
            </SelectBox>
          </div>
          <div className="d-md-flex my-2 gap-2">
            <TextBox
              name="address"
              label="Address"
              labelMode="floating"
              placeholder="Enter Address"
              value={patientAppointment.address}
              onValueChange={(e) => handleChange("address", e)}
              valueChangeEvent="input"
              showClearButton={true}
              maxLength={20}
              validationMessagePosition="down"
            >
              <Validator validationGroup={ValidationGroupName}>
                <RequiredRule message="Please Enter Address" />
              </Validator>
            </TextBox>

            <SelectBox
              searchEnabled={true}
              dataSource={formattedStateOptions}
              displayExpr={"Name"}
              valueExpr={"ID"}
              value={patientAppointment.stateID}
              onValueChanged={handleStateChange}
              showDropDownButton={true}
              label="State"
              labelMode="floating"
              validationMessagePosition="down"
            >
              <Validator validationGroup={ValidationGroupName}>
                <RequiredRule message="Please Select the State" />
              </Validator>
            </SelectBox>

            <SelectBox
              searchEnabled={true}
              dataSource={formattedCityOptions}
              displayExpr={"Name"}
              valueExpr={"ID"}
              value={patientAppointment.cityID}
              onValueChanged={handleCityChange}
              showDropDownButton={true}
              label="City"
              labelMode="floating"
              validationMessagePosition="down"
            >
              <Validator validationGroup={ValidationGroupName}>
                <RequiredRule message="Please Select the City" />
              </Validator>
            </SelectBox>
          </div>
          <TextBox
            name="reasonForAppointment"
            label="Reason For Appointment"
            labelMode="floating"
            placeholder="Reason For Appointment"
            value={patientAppointment.reasonForAppointment}
            onValueChange={(e) => handleChange("reasonForAppointment", e)}
            valueChangeEvent="input"
            showClearButton={true}
            maxLength={20}
            validationMessagePosition="down"
          >
            <Validator validationGroup={ValidationGroupName}>
              <RequiredRule message="Please Enter Reason For Appointment" />
            </Validator>
          </TextBox>
          <div className="d-flex my-2 justify-content-between gap-2">
            <SelectBox
              ref={SelectBoxSpecialityRef}
              className="w-100"
              searchEnabled={true}
              dataSource={formattedSpecialtyOptions}
              displayExpr={"Name"}
              valueExpr={"ID"}
              value={patientAppointment.specialityID}
              onValueChanged={handleSpecialtyChange}
              showDropDownButton={true}
              label="Speciality"
              labelMode="floating"
              validationMessagePosition="down"
            >
              <Validator validationGroup={ValidationGroupName}>
                <RequiredRule message="Please Select the Speciality" />
              </Validator>
              <TextBoxButton
                name="speciality"
                location="after"
                options={AddSpecialityButton}
              />
              <TextBoxButton
                name="dropdown"
                location="after"
                options={SpecialityDownArrow}
              />
            </SelectBox>
            <SelectBox
            ref={SelectBoxDoctorRef}
              className="w-100"
              searchEnabled={true}
              dataSource={formattedDoctorOptions}
              displayExpr={"Name"}
              valueExpr={"ID"}
              value={patientAppointment.doctorID}
              onValueChanged={handleDoctorChange}
              showDropDownButton={true}
              label="Doctor"
              labelMode="floating"
              validationMessagePosition="down"
            >
              <Validator validationGroup={ValidationGroupName}>
                <RequiredRule message="Please Select the Doctor" />
              </Validator>
              <TextBoxButton
                name="doctor"
                location="after"
                options={AddDoctorButton}
              />
              <TextBoxButton
                name="dropdown"
                location="after"
                options={DoctorDownArrow}
              />
            </SelectBox>
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
              text={selectedAppointment ? "Update" : "Save"}
              type="default"
              stylingMode="contained"
              validationGroup={ValidationGroupName}
            />
          </div>
        </form>
      </Popup>
      {isModalOpen && (
        <SpecialtyModal show={isModalOpen} handleClose={handleCloseModal} />
      )}
      {isDocModalOpen && (
        <DoctorModal show={isDocModalOpen} handleClose={handleDocModalClose} />
      )}
    </div>
  );
};

export default AppointmentModal;
