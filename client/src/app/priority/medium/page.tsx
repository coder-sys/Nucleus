import React from "react";
import ReusablePriorityPage from "../reusablePriorityPage";
import { Priority } from "@/state/api";

const MediumPriorityPage = () => {
  return <ReusablePriorityPage priority={Priority.Medium} />;
};

export default MediumPriorityPage;
