import { AiFillCheckCircle, AiFillCloseCircle } from "react-icons/ai";
import { TbArrowLeftRight } from "react-icons/tb";
import { LuCircleDashed } from "react-icons/lu";
import { FaRegCircle } from "react-icons/fa";

export const BASE_CATEGORIES = [
  {
    key: "triage",
    title: "Triage",
    icon: (
      <TbArrowLeftRight
        style={{ width: "19px", height: "19px", color: "#FF7336" }}
      />
    ),
  },
  {
    key: "backlog",
    title: "Backlog",
    icon: (
      <LuCircleDashed
        style={{ width: "19px", height: "19px", color: "#6C6E71" }}
      />
    ),
  },
  {
    key: "discussion",
    title: "Discussion",
    icon: (
      <FaRegCircle
        style={{ width: "19px", height: "19px", color: "#E2E2E2" }}
      />
    ),
  },
  {
    key: "reject",
    title: "Reject",
    icon: (
      <AiFillCloseCircle
        style={{ width: "19px", height: "19px", color: "#5E6AD2" }}
      />
    ),
  },
  {
    key: "todo",
    title: "Todo",
    icon: (
      <FaRegCircle
        style={{ width: "19px", height: "19px", color: "#E2E2E2" }}
      />
    ),
  },
  {
    key: "in_progress",
    title: "In Progress",
    icon: (
      <AiFillCheckCircle
        style={{ width: "19px", height: "19px", color: "#E5B600" }}
      />
    ),
  },
  {
    key: "in_review",
    title: "In Review",
    icon: (
      <AiFillCheckCircle
        style={{ width: "19px", height: "19px", color: "#8B5CF6" }}
      />
    ),
  },
  {
    key: "done",
    title: "Done",
    icon: (
      <AiFillCheckCircle
        style={{ width: "19px", height: "19px", color: "#26A644" }}
      />
    ),
  },
  {
    key: "accept",
    title: "Accept",
    icon: (
      <AiFillCheckCircle
        style={{ width: "19px", height: "19px", color: "#0EA5E9" }}
      />
    ),
  },
  {
    key: "cancelled",
    title: "Cancelled",
    icon: (
      <AiFillCloseCircle
        style={{ width: "19px", height: "19px", color: "#5E6AD2" }}
      />
    ),
  },
  {
    key: "duplicate",
    title: "Duplicate",
    icon: (
      <AiFillCloseCircle
        style={{ width: "19px", height: "19px", color: "#9CA3AF" }}
      />
    ),
  },
];
