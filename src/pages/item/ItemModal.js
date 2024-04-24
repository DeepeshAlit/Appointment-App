import React, { useEffect } from "react";
import { Popup } from "devextreme-react/popup";
import TextBox from "devextreme-react/text-box";
import Button from "devextreme-react/button";
import Validator, { RequiredRule, AsyncRule } from "devextreme-react/validator";
import { checkDuplicate } from "../../services";

const ItemModal = ({
  show,
  handleClose,
  handleSave,
  selectedItem,
  item,
  setItem,
  handleChange,
}) => {
  const token = localStorage.getItem("token");
  const baseUrl = process.env.REACT_APP_BASE_URL;
  useEffect(() => {
    if (selectedItem) {
      setItem({ ...item, itemName: selectedItem.ItemName });
    }
  }, [selectedItem]);

  async function sendRequest(value) {
    if (!selectedItem || selectedItem.ItemName !== value) {
      try {
        const apiUrl =
          `${baseUrl}Item/CheckDuplicateItemName/`;
        const isDuplicate = await checkDuplicate(apiUrl, value, token);
        if (isDuplicate == 200) {
          return true;
        } else {
          return false;
        }
      } catch (error) {
        console.error("Error:", error.message);
      }
    } else if (selectedItem.ItemName == value) {
      return true;
    }
  }

  function asyncValidation(params) {
    debugger;
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
      title={selectedItem ? "Edit Item" : "Add Item"}
      container=".dx-viewport"
      maxWidth={300}
      maxHeight={250}
    >
      <form onSubmit={handleSave}>
        <TextBox
          name="itemName"
          label="Item Name"
          labelMode="floating"
          placeholder="Enter Item Name"
          value={item.itemName}
          onValueChange={(e) => handleChange("itemName", e)}
          valueChangeEvent="input"
          maxLength={20}
          showClearButton={true}
          validationMessagePosition="down"
        >
          <Validator>
            <RequiredRule message="Item Name is Required" />
            <AsyncRule
              message="Item Already Exist"
              validationCallback={asyncValidation}
            />
          </Validator>
        </TextBox>

        <div className="d-flex justify-content-end mt-3 gap-2">
          
          <Button
            text="Cancel"
            type="normal"
            stylingMode="outlined"
            onClick={handleClose}
          />
         
          <Button
            useSubmitBehavior={true}
            text={selectedItem ? "Update" : "Save"}
            type="default"
            stylingMode="contained"
          />
        </div>
      </form>
    </Popup>
  );
};

export default ItemModal;
