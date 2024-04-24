import React, { useEffect } from "react";
import { Popup } from "devextreme-react/popup";
import TextBox from "devextreme-react/text-box";
import { Button } from "devextreme-react/button";
import { Validator, RequiredRule, AsyncRule } from "devextreme-react/validator";
import { checkDuplicate } from "../../services";

const SpecialtyModal = ({
  show,
  handleClose,
  handleSave,
  selectedSpecialty,
  handleChange,
  speciality,
  setSpeciality,
}) => {
  const token = localStorage.getItem("token");
  const baseUrl = process.env.REACT_APP_BASE_URL;
  useEffect(() => {
    if (selectedSpecialty) {
      setSpeciality({
        ...speciality,
        SpecialityName: selectedSpecialty.SpecialityName,
        Description: selectedSpecialty.Description,
      });
    }
  }, [selectedSpecialty]);

  async function sendRequest(value) {
    if (!selectedSpecialty || selectedSpecialty.SpecialityName !== value ) {
    try {
        const apiUrl = `${baseUrl}Speciality/CheckDuplicateSpecialityName/`;
        const isDuplicate = await checkDuplicate(apiUrl, value, token);
         if (isDuplicate == 200) {
          return true;
        } else {
          return false;
        }

    } catch (error) {
        console.error('Error:', error.message);
    }
    } else if (selectedSpecialty.SpecialityName == value) {
      return true;
    }
  }

  function asyncValidation(params) {
    return sendRequest(params.value);
  }

  return (
    <Popup
      visible={show}
      onHiding={handleClose}
      dragEnabled={false}
      hideOnOutsideClick={true}
      showCloseButton={true}
      showTitle={true}
      title={selectedSpecialty ? "Edit Specialty" : "Add Specialty"}
      container=".dx-viewport"
      maxWidth={400}
      maxHeight={280}
    >
      <form onSubmit={handleSave}>
        <div className="d-flex flex-column gap-2 mb-2">
          <TextBox
            name="SpecialityName"
            label="Speciality Name"
            labelMode="floating"
            placeholder="Enter Specialty Name"
            value={speciality.SpecialityName}
            onValueChange={(e) => handleChange("SpecialityName", e)}
            valueChangeEvent="input"
            showClearButton={true}
            maxLength={20}
            validationMessagePosition="down"
          >
            <Validator>
              <RequiredRule message="Please Enter Specialty Name" />
              <AsyncRule
                message="Specialty Already Exist"
                validationCallback={asyncValidation}
              />
            </Validator>
          </TextBox>
          <TextBox
            name="Description"
            label="Description"
            labelMode="floating"
            placeholder="Enter Description"
            value={speciality.Description}
            onValueChange={(e) => handleChange("Description", e)}
            valueChangeEvent="input"
            showClearButton={true}
            maxLength={20}
            validationMessagePosition="down"
          >
            <Validator>
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
            text="Save"
            type="default"
            stylingMode="contained"
          />
        </div>
      </form>
    </Popup>
  );
};

export default SpecialtyModal;
