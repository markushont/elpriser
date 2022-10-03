import React from "react";
import { ToggleButton } from "./Buttons"

export default function ToggleButtonGroup(props) {
  
  const onClick = (event, clickedType) => {
    event.preventDefault();
    props.onClickCallback(clickedType);
  };

  return (
    <div>
      {props.types.map((type) => (
        <ToggleButton active={props.active === type} onClick={(event) => onClick(event, type)}>
          {type}
        </ToggleButton>
      ))}
    </div>
  );
}
