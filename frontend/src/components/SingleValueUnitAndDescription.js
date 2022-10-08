import React from "react";

export default function SingleValueAndDescription(props) {

    return (
        <div
            style={{
                width: "150px",
                minHeight: "150px",
                border: "1px solid rgba(200,200,200,0.5)",
                padding: "5px 15px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-around",
                margin: "5px"
        }}>
            <p style={{flexBasis: "content", fontSize: "80px", lineHeight: "80px", fontWeight: "bold", margin: 0}}>
                {props.val}
            </p>
            <p style={{flexBasis: "auto", fontSize: "30px", fontWeight: "bold", margin: 0}}>
                {props.unit}
            </p>
            <p style={{flexBasis: "auto", fontSize: "15px", fontWeight: "bold", margin: "5px"}}>
                {props.desc}
            </p>
        </div>
    )
}
