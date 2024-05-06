import React, { useCallback, useEffect, useState } from "react";
import { Popup } from "devextreme-react/popup";
import TextBox from "devextreme-react/text-box";
import { Button } from "devextreme-react/button";
import {
  Validator,
  RequiredRule,
  AsyncRule,
  CustomRule,
} from "devextreme-react/validator";
import { checkDuplicate, getById, postAPI, putAPI } from "../../services";
import PopupHeader from "../../layouts/popup-header-footer/PopupHeader";

const SpecialtyModal = ({ show, handleClose, selectedSpecialty }) => {
  const token = localStorage.getItem("token");
  const baseUrl = process.env.REACT_APP_BASE_URL;
  const initialData = {
    SpecialityName: "",
    Description: "",
  };
  const [speciality, setSpeciality] = useState(initialData);
  const ValidationGroupName = "SpecialityModalValidation";
  const [selectedSpecialityName,setSelectedSpecialityName] = useState();
  

  const GetSpecialityById = async (id) => {
    try {
      const apiUrl = `${baseUrl}Speciality/GetById/`;
      const response = await getById(apiUrl, id, token);
      setSelectedSpecialityName(response.SpecialityName)
      setSpeciality({
        ...speciality,
        SpecialityName: response.SpecialityName,
        Description: response.Description,
      });
    } catch (error) {
      console.error("Error:", error.message);
    }
  };

  useEffect(() => {
    if (selectedSpecialty) {
      GetSpecialityById(selectedSpecialty);
    }
  }, []);

  const asyncSpecialityNameValidation = async (e) => {
    const value = e?.value;
    if (!selectedSpecialty || selectedSpecialityName !== value) {
      const apiUrl = `${baseUrl}Speciality/CheckDuplicateSpecialityName/`;
      const result = await checkDuplicate(apiUrl, value, token);
      if (!result.isOk) {
        e.rule.isValid = result.isOk;
        e.validator.validate();
        return false;
      }
    } else if (selectedSpecialityName == value) {
      return true;
    }
  };

  const handleSave = async (e) => {
    // e.preventDefault();
    if (selectedSpecialty) {
      const updatedData = {
        specialityID: selectedSpecialty,
        specialityName: speciality?.SpecialityName,
        isGynac: false,
        description: speciality?.Description,
      };
      try {
        const apiUrl = `${baseUrl}Speciality/Update/`;
        await putAPI(apiUrl, updatedData, token);
        // getSpecialityList();
        // handleCloseModal();
        handleClose();
      } catch (error) {
        console.error("Error:", error.message);
      }
    } else {
      const data = {
        specialityName: speciality.SpecialityName,
        description: speciality.Description,
      };

      try {
        const apiUrl = `${baseUrl}Speciality/Insert`;
        const response = await postAPI(apiUrl, data, token);
        console.log("reponseInsertSpeciality", response);
        // getSpecialityList();
        // handleCloseModal();
        handleClose();
      } catch (error) {
        console.error("Error:", error.message);
      }
    }
  };
  const handleChange = useCallback((name, value) => {
    setSpeciality((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  }, []);

  const handleSaveSpeciality=(e)=>{
    e.preventDefault();
    handleSave();
  }

  const PopupTitle = () => {
    return (
      <>
        <PopupHeader
          ValidationGroupName={ValidationGroupName}
          onClosePopup={handleClose}
          title={[<span key={"header_title"} className="base-accent-text">{selectedSpecialty?"Edit " : "Add "}</span>, "Specialty"]}
          onSubmit={handleSave}
        />
      </>
    )
  }

  return (
    <Popup
      visible={show}
      onHiding={handleClose}
      dragEnabled={false}
      hideOnOutsideClick={true}
      showCloseButton={true}
      showTitle={true}
      // title={selectedSpecialty ? "Edit Specialty" : "Add Specialty"}
      titleRender={PopupTitle}
      container=".dx-viewport"
      maxWidth={400}
      maxHeight={280}
    >
      <form onSubmit={handleSaveSpeciality}>
        <div className="d-flex flex-column gap-2 mb-2">
          <TextBox
            name="SpecialityName"
            label="Speciality Name"
            labelMode="floating"
            placeholder="Enter Specialty Name"
            value={speciality?.SpecialityName}
            onValueChange={(e) => handleChange("SpecialityName", e)}
            // valueChangeEvent="input"
            showClearButton={true}
            maxLength={20}
            validationMessagePosition="down"
          >
            <Validator validationGroup={ValidationGroupName}>
              <RequiredRule message="Please Enter Speciality Name" />
              <CustomRule
                message="Can't accept duplicate Speciality Name"
                validationCallback={asyncSpecialityNameValidation}
                ignoreEmptyValue={true}
              />
            </Validator>
          </TextBox>
          <TextBox
            name="Description"
            label="Description"
            labelMode="floating"
            placeholder="Enter Description"
            value={speciality?.Description}
            onValueChange={(e) => handleChange("Description", e)}
            // valueChangeEvent="input"
            showClearButton={true}
            maxLength={20}
            validationMessagePosition="down"
          >
            <Validator validationGroup={ValidationGroupName}>
              <RequiredRule message="Please Enter Description" />
            </Validator>
          </TextBox>
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
            text={selectedSpecialty ? "Update" : "Save"}
            type="default"
            stylingMode="contained"
            validationGroup={ValidationGroupName}
          />
        </div>
      </form>
    </Popup>
  );
};

export default SpecialtyModal;
