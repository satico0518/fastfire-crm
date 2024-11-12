import { useLocation, useNavigate } from "react-router-dom";
import TasksTable from "../../components/table/TasksTableComponent";

export const TasksbyGroupPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  if (state && Object.prototype.hasOwnProperty.call(state, "wg")) {
    return (
      <div style={{ width: "100%" }}>
        <h4>{state?.wg?.name}</h4>
        <TasksTable workgroup={state?.wg} />
      </div>
    );
  }
  
  navigate("/home");
};
