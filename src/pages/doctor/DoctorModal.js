import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  SelectBox,
  Button as TextBoxButton,
} from "devextreme-react/select-box";
import Validator, {
  RequiredRule,
  AsyncRule,
  CustomRule,
} from "devextreme-react/validator";
import Button from "devextreme-react/button";
import TextBox from "devextreme-react/text-box";
import { Popup } from "devextreme-react/popup";
import {
  checkDuplicate,
  getAPI,
  getById,
  postAPI,
  putAPI,
} from "../../services";
import SpecialtyModal from "../specialty/SpecialtyModal";
import PopupHeader from "../../layouts/popup-header-footer/PopupHeader";

const DoctorModal = ({
  show,
  handleClose,
  selectedDoctor
}) => {
  const token = localStorage.getItem("token");
  const baseUrl = process.env.REACT_APP_BASE_URL;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const ValidationGroupName = "DoctorModalValidation";
  const [specialtiesList, setSpecialtiesList] = useState([]);
  const initialData = {
    DoctorName: "",
    SpecialityID: null,
    Education: "",
  };
  const [doctor, setDoctor] = useState(initialData);
  const [selectedDoctorName,setSelectedDoctorName] = useState();
  const SelectBoxRef = useRef(null)

  const GetDoctorById = async (id) => {
    try {
      const apiUrl = `${baseUrl}Doctor/GetById/`;
      const response = await getById(apiUrl, id, token);
      setSelectedDoctorName(response.DoctorName)
      setDoctor({
        ...doctor,
        DoctorName: response.DoctorName,
        SpecialityID: response.SpecialityID,
        Education: response.Education,
      });
    } catch (error) {
      console.error("Error:", error.message);
    }
  };

  useEffect(() => {
    if (selectedDoctor) {
      GetDoctorById(selectedDoctor);
    }
  }, []);

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
    fetchSpecialtyList();
  }, []);

  const formattedSpecialtyOptions = specialtiesList.map((specialty) => ({
    Name: specialty.SpecialityName,
    ID: specialty.SpecialityID,
  }));

  const asyncDoctorNameValidation = async (e) => {
    const value = e?.value;
    if (!selectedDoctor || selectedDoctorName !== value) {
    const apiUrl = `${baseUrl}Doctor/CheckDuplicateDoctorName/`;
    const result = await checkDuplicate(apiUrl, value, token);
    if (!result.isOk) {
      e.rule.isValid = result.isOk;
      e.validator.validate();
      return false;
    }
  }else if (selectedDoctorName == value) {
    return true;
  }
}

  const AddButton = {
    icon: "plus",
    stylingMode: "text",
    onClick: () => {
      // props.setDropDownClick && props.setDropDownClick(true);
      setIsModalOpen(!isModalOpen);
    },
  };
  

  const DownArrow = {
    icon: "spindown",
    stylingMode: "text",
    onClick: (e) => {
      var selectBoxInstance = SelectBoxRef.current?.instance;
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

  const handleChange = useCallback((name, args) => {
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

  const handleSave = async (e) => {
    // e.preventDefault();
    if (selectedDoctor) {
      const updatedDoctorData = {
        doctorID: selectedDoctor,
        doctorName: doctor.DoctorName,
        specialityID: doctor.SpecialityID,
        education: doctor.Education,
      };
      try {
        const apiUrl = `${baseUrl}Doctor/Update/`;
        await putAPI(apiUrl, updatedDoctorData, token);
        fetchSpecialtyList();
        handleClose();
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
        fetchSpecialtyList();
        handleClose();
      } catch (error) {
        console.error("Error:", error.message);
      }
    }
  };

  const handleSaveDoctor=(e)=>{
    e.preventDefault();
    handleSave();
  }

  const PopupTitle = () => {
    return (
      <>
        <PopupHeader
          ValidationGroupName={ValidationGroupName}
          onClosePopup={handleClose}
          title={[<span key={"header_title"} className="base-accent-text">{selectedDoctor?"Edit " : "Add "}</span>, "Doctor"]}
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
        // title={selectedDoctor ? "Edit Doctor" : "Add Doctor"}
        titleRender={PopupTitle}
        // container=".dx-viewport"
        maxWidth={500}
        maxHeight={340}
      >
        <form onSubmit={handleSaveDoctor}>
          <div className="d-flex flex-column gap-2">
            <TextBox
              name="DoctorName"
              label="Doctor Name"
              labelMode="floating"
              placeholder="Enter Doctor Name"
              value={doctor?.DoctorName}
              onValueChange={(e) => handleChange("DoctorName", e)}
              // valueChangeEvent="input"
              maxLength={20}
              showClearButton={true}
              validationMessagePosition="down"
            >
              <Validator validationGroup={ValidationGroupName}>
                <RequiredRule message="Doctor Name is required" />
                <CustomRule
                  message="Can't accept duplicate Doctor Name"
                  validationCallback={asyncDoctorNameValidation}
                  ignoreEmptyValue={true}
                />
              </Validator>
            </TextBox>
            <SelectBox
             ref={SelectBoxRef}
              searchEnabled={true}
              dataSource={formattedSpecialtyOptions}
              displayExpr={"Name"}
              valueExpr={"ID"}
              value={doctor?.SpecialityID}
              onValueChanged={handleSpecialtyChange}
              // elementAttr={selectBoxAttributes}
              showDropDownButton={true}
              label="Specialty"
              labelMode="floating"
              validationMessagePosition="down"
            >
              <TextBoxButton
                name="speciality"
                location="after"
                options={AddButton}
              />
              <TextBoxButton
                name="dropdown"
                location="after"
                options={DownArrow}
              />
              <Validator validationGroup={ValidationGroupName}>
                <RequiredRule message="Please Select the Specialty" />
              </Validator>
            </SelectBox>
            <TextBox
              label="Education"
              labelMode="floating"
              placeholder="Enter Education"
              value={doctor?.Education}
              onValueChange={(e) => handleChange("Education", e)}
              // valueChangeEvent="input"
              maxLength={20}
              showClearButton={true}
              validationMessagePosition="down"
            >
              <Validator validationGroup={ValidationGroupName}>
                <RequiredRule message="Education is required" />
              </Validator>
            </TextBox>
          </div>
          <div className="d-flex justify-content-end gap-2 mt-4">
            <Button
              text="Cancel"
              type="normal"
              stylingMode="outlined"
              onClick={handleClose}
            />

            <Button
              useSubmitBehavior={true}
              text={selectedDoctor ? "Update" : "Save"}
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
    </div>
  );
};

export default DoctorModal;
