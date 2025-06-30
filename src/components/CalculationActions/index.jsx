import React from "react";
import CalculationDropdownMenu from "../ui/dropdown-menu-calculation";

const CalculationActions = ({ calculation, onEdit, onDelete, onToggleFavorite }) => {
  return (
    <CalculationDropdownMenu 
      calculation={calculation}
      onEdit={onEdit}
      onDelete={onDelete}
      onToggleFavorite={onToggleFavorite}
    />
  );
};

export default CalculationActions;
