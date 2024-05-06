import React from "react";
import Toolbar, { Item } from "devextreme-react/toolbar";
import Button from "devextreme-react/button";
import UserPanel from "../user-panel/UserPanel";
import "./Header.scss";
import { Template } from "devextreme-react/core/template";
import { useScreenSize } from "../../utils/media-query";
import { DropDownButton } from "devextreme-react";
import { camelCase } from "../../utils/common-methods";
import { Workbook } from "exceljs";
import { exportDataGrid } from "devextreme/excel_exporter";
import saveAs from "file-saver";

export default function Header({
  title,
  handleAdd,
  GetRecord,
  dataGridRef,
  exportFileName,
}) {
  const { isSmall, isXSmall, isXXSmall, isExSmall } = useScreenSize();
  const DataGridRef = dataGridRef;

  const onAddButtonClick = () => {
    handleAdd();
  };

  const onRefreshButtonClick = async () => {
    GetRecord && (await GetRecord());
  };

  const onResetButtonClick = () => {
    DataGridRef.current?.instance.state(null);
    DataGridRef.current?.instance.clearFilter();
  };

  const dropdownItems = [
    { id: 1, name: "Excel", icon: "exportxlsx" },
    { id: 2, name: "CSV", icon: "xlsfile" },
  ];

  const dropDownOptions = {
    width: "100px",
  };

  const onItemClick = (e) => {
    var fileName = camelCase(title);
    if (exportFileName !== undefined && exportFileName !== null) {
      fileName = camelCase(exportFileName);
    }

    if (e.itemData.id === 1) {
      var workbook = new Workbook();
      var worksheet = workbook.addWorksheet("SheetName");
      exportDataGrid({
        component: DataGridRef.current?.instance,
        worksheet: worksheet,
      }).then(function () {
        workbook.xlsx.writeBuffer().then(function (buffer) {
          saveAs(
            new Blob([buffer], { type: "application/octet-stream" }),
            fileName + ".xlsx"
          );
        });
      });
    } else if (e.itemData.id === 2) {
      const workbook = new Workbook();
      const worksheet = workbook.addWorksheet("Report");
      exportDataGrid({
        component: DataGridRef.current?.instance,
        worksheet: worksheet,
      }).then(function () {
        workbook.csv.writeBuffer().then(function (buffer) {
          saveAs(
            new Blob([buffer], { type: "application/octet-stream" }),
            fileName + ".csv"
          );
        });
      });
    }
  };

  return (
    <header className={"header-component"}>
      <Toolbar className={"header-toolbar"}>
        <Item
          location={"before"}
          cssClass={"header-title ps-2"}
          visible={!!title}
        >
          <span
            className={
              isExSmall || isXXSmall || isXSmall || isSmall
                ? "ps-4 ms-3"
                : "ps-2"
            }
          >
            {title}
          </span>
        </Item>
        { dataGridRef &&
          <Item location={"before"}>
            <span className="vertical-line px-1">|</span>
          </Item>
        }
        { dataGridRef &&
          <Item location="before" locateInMenu="auto">
            <Button
              icon="plus"
              className="rounded-5 default-button"
              id="Add"
              onClick={onAddButtonClick}
              stylingMode="outlined"
              type="default"
              hint="Add"
            ></Button>
          </Item>
        }

        { dataGridRef &&
          <Item location="after" locateInMenu="auto">
            <Button
              icon="refresh"
              className="mx-md-1 rounded-5 default-button"
              id="refresh"
              onClick={onRefreshButtonClick}
              stylingMode="outlined"
              type="default"
              hint="Refresh"
            ></Button>
          </Item>
        }

        { dataGridRef &&
          <Item location="after" locateInMenu="auto">
            <DropDownButton
              displayExpr={"name"}
              className={"mx-md-1 export-dropdown-btn "}
              items={dropdownItems}
              id={"export"}
              icon={"export"}
              hint="Export"
              dropDownOptions={dropDownOptions}
              stylingMode="outlined"
              type="default"
              elementAttr={{ role: "button" }}
              showArrowIcon={false}
              onItemClick={onItemClick}
              // width={37}
            ></DropDownButton>
          </Item>
        }

        { dataGridRef &&
          <Item location="after" locateInMenu="auto">
            <Button
              icon="pulldown"
              className="mx-md-1 rounded-5 default-button ResetButton "
              id="reset"
              onClick={onResetButtonClick}
              stylingMode="outlined"
              type="default"
              hint="Reset"
            ></Button>
          </Item>
        }
        { dataGridRef &&
          <Item location={"after"}>
            <span className="vertical-line px-1">|</span>
          </Item>
        }

        <Item
          location={"after"}
          locateInMenu={"auto"}
          menuItemTemplate={"userPanelTemplate"}
        >
          <Button
            className={"user-button authorization"}
            width={155}
            height={"100%"}
            stylingMode={"text"}
          >
            <UserPanel menuMode={"context"} />
          </Button>
        </Item>
        <Template name={"userPanelTemplate"}>
          <UserPanel menuMode={"list"} />
        </Template>
      </Toolbar>
    </header>
  );
}
