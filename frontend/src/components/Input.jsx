import React from "react";
//type, placeholder, value, onChange

const Input = ({ type, placeholder, value, onChange }) => {
  return (
    <>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
    </>
  );
};

export default Input;
