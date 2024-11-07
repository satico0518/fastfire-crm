import { useLocation } from "react-router-dom"
import TasksTable from "../../components/table/TasksTableComponent";


export const TasksbyGroupPage = () => {
    const {state: {wg}} = useLocation();
  return (
    <div style={{width: '100%'}}>
        <h4>{wg.name}</h4>
        <TasksTable workgroup={wg}/>
    </div>
  )
}
