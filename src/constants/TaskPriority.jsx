import React from "react";
import { HiOutlineDotsHorizontal } from "react-icons/hi";
import {
  MdOutlineSignalCellularAlt,
  MdOutlineSignalCellularAlt2Bar,
} from "react-icons/md";
import { RiErrorWarningFill } from "react-icons/ri";

export const PRIORITY_ICONS = [
  {
    value: "0",
    label: "No Priority",
    icon: <HiOutlineDotsHorizontal />,
  },
  {
    value: "1",
    label: "Urgent",
    icon: <RiErrorWarningFill style={{ color: "red" }} />,
  },
  {
    value: "2",
    label: "High",
    icon: <MdOutlineSignalCellularAlt />,
  },
  {
    value: "3",
    label: "Medium",
    icon: <MdOutlineSignalCellularAlt2Bar />,
  },
  {
    value: "4",
    label: "Low",
    icon: <MdOutlineSignalCellularAlt2Bar />,
  },
];

// Bura yeni komponenti əlavə edirik:
export const TaskPriority = ({ value, onClick, style, title }) => {
  if (value === undefined || value === null) return null;

  // Gələn priority rəqəmini string edib massivdən axtarırıq
  const found = PRIORITY_ICONS.find((p) => p.value === value.toString());

  if (!found) return null;

  // Tapılsa ikonu render edirik
  return (
    <span
      onClick={onClick}
      title={title || found.label}
      style={{
        cursor: onClick ? "pointer" : "default",
        display: "inline-flex",
        alignItems: "center",
        ...style,
      }}
    >
      {found.icon}
    </span>
  );
};
