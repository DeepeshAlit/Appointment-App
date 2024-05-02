import React, { useEffect } from "react";
import { Popup } from "devextreme-react/popup";
import TextBox from "devextreme-react/text-box";
import Button from "devextreme-react/button";
import Validator, {
  RequiredRule,
  CustomRule,
} from "devextreme-react/validator";
import { checkDuplicate,getById } from "../../services";

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
  const ValidationGroupName = "ItemPopupValidation";

  const GetItemById =async(id)=> {
    try {
      const apiUrl = `${baseUrl}Item/GetById/`;
      const item = await getById(apiUrl, id, token);
      setItem({ ...item, itemName: item.ItemName });
    } catch (error) {
      console.error("Error:", error.message);
    }
  }

  useEffect(() => {
    if (selectedItem) {
      GetItemById(selectedItem);
    }
  }, []);

  const asyncItemNameValidation = async (e) => {
    const value = e?.value;
    if (!selectedItem || item.ItemName !== value) {
    const apiUrl = `${baseUrl}Item/CheckDuplicateItemName/`;
    const result = await checkDuplicate(apiUrl, value, token);
    if (!result.isOk) {
      e.rule.isValid = result.isOk;
      e.validator.validate();
      return false;
    }
  }
   else if (item.ItemName == value) {
        return true;
      }
  };

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
          // valueChangeEvent="input"
          maxLength={20}
          showClearButton={true}
          validationMessagePosition="down"
        >
          <Validator
           validationGroup={ValidationGroupName}
           >
            <RequiredRule message="Item Name is Required" />
            <CustomRule
              message="Can't accept duplicate Item Name"
              validationCallback={asyncItemNameValidation}
              ignoreEmptyValue={true}
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
            validationGroup={ValidationGroupName}
          />
        </div>
      </form>
    </Popup>
  );
};

export default ItemModal;
