import React from "react";
import { Popup } from "devextreme-react";
import Button from "devextreme-react/button";

const DeleteConfirmationModal = ({
  show,
  handleClose,
  handleDelete,
  deleteMessage,
  inUseError,
}) => {
  return (
    <Popup
      visible={show}
      onHiding={handleClose}
      dragEnabled={false}
      hideOnOutsideClick={true}
      showTitle={true}
      title="Delete Confirmation"
      showCloseButton={true}
      maxWidth={400}
      maxHeight={195}
    >
      <div>
        <div>{deleteMessage}</div>
        <p className="text-danger">
          {inUseError ? "This is already in use." : ""}
        </p>
        <div className="d-flex justify-content-end gap-2 mt-4 ">
          <Button text="Cancel" onClick={handleClose} />
          <Button text="Delete" onClick={handleDelete} type="danger" />
        </div>
      </div>
    </Popup>
  );
};

export default DeleteConfirmationModal;
