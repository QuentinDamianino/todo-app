import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./App.css";
import TaskList from "./components/TaskList.jsx";

function App() {
  return (
    <div className="App min-vh-100 bg-light">
      <TaskList />
    </div>
  );
}

export default App;
