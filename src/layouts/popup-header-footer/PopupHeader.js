import { Button, Toolbar } from 'devextreme-react';
import { Item } from 'devextreme-react/toolbar';
import React from 'react';
import './PopupHeaderFooter.scss';
import { useScreenSize } from '../../utils/media-query';

export default function PopupHeader({ onClosePopup, title, ValidationGroupName, onSubmit }) {

  const { isXSmall, isXXSmall, isExSmall, } = useScreenSize();

  const SaveForm = (e) => {
    var formValid = e.validationGroup.validate();
    if (formValid.isValid) {
      onSubmit && onSubmit();
    }
  }

  return (
    <div className='popup_header shadow-sm '>
      <div className='row  mx-1'>

        <Toolbar>
          {title &&
          <Item
            location="before"
          >
            <div className={`${(isXSmall || isXXSmall || isExSmall) ? 'font-semiBold-14' : 'font-semiBold-18'} fw-semibold`}>{title}</div>
          </Item>
          }
          {
            
            <Item location='before'>
              <span className="vertical-line">|</span>
            </Item>
          }
          {
            

            <Item location='before'>
              <Button
                icon='save'
                className='rounded-5 save-icon'
                type='default'
                hint='Save'
                stylingMode='outlined'
                useSubmitBehavior={true}
                onClick={SaveForm}
                validationGroup={ValidationGroupName}
              />
            </Item>
          }
          <Item
            location="after"
          >
            <Button
              icon='close'
              type='default'
              hint='Close'
              stylingMode='outlined'
              className='rounded-5 remove-icon'
              hoverStateEnabled={false}
              activeStateEnabled={false}
              focusStateEnabled={false}
              onClick={onClosePopup}
            >
            </Button>
          </Item>
        </Toolbar>
      </div>
    </div>
  )
}
