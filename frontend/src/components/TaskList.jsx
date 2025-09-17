import { useEffect, useState } from "react";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { taskService } from "../services/api.js";
import { Alert, Col, Container, Row, Spinner } from "react-bootstrap";
import TaskItem from "./TaskItem.jsx";
import AddTaskForm from "./AddTaskForm.jsx";

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await taskService.getTasks();
      const sortedTasks = data.sort((a, b) => a.position - b.position);
      setTasks(sortedTasks);
    } catch (error) {
      setError("Failed to load tasks: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async (taskData) => {
    setActionLoading(true);
    try {
      const newTask = await taskService.createTask(taskData);
      setTasks((prevState) =>
        [...prevState, newTask].sort((a, b) => a.position - b.position),
      );
      setError("");
    } catch (error) {
      throw new Error("Failed to add task: " + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateTask = async (id, taskData) => {
    setActionLoading(true);
    try {
      const updatedTask = await taskService.updateTask(id, taskData);
      setTasks((prevState) =>
        prevState
          .map((task) => (task.id === id ? updatedTask : task))
          .sort((a, b) => a.position - b.position),
      );
      setError("");
    } catch (error) {
      throw new Error("Failed to update task: " + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteTask = async (id) => {
    setActionLoading(true);
    try {
      await taskService.deleteTask(id);
      setTasks((prevState) => prevState.filter((task) => task.id !== id));
      setError("");
    } catch (error) {
      setError("Failed to delete task: " + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = tasks.findIndex((task) => task.id === active.id);
    const newIndex = tasks.findIndex((task) => task.id === over.id);

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    const newTasks = arrayMove(tasks, oldIndex, newIndex);

    const tasksWithNewPositions = newTasks.map((task, index) => ({
      ...task,
      position: index + 1,
    }));

    setTasks(tasksWithNewPositions);

    setActionLoading(true);
    try {
      const movedTask = tasks[oldIndex];
      const newPosition = newIndex + 1;

      await taskService.updateTask(movedTask.id, { position: newPosition });
      setError("");
    } catch (error) {
      setTasks(tasks);
      setError("Failed to update task positions: " + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-2">Loading tasks...</p>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Row>
        <Col lg={8} className="mx-auto">
          <div className="text-center mb-4">
            <h1 className="display-4 fw-bold text-primary">TODO List</h1>
          </div>

          {error && (
            <Alert
              variant="danger"
              dismissible
              onClose={() => setError("")}
              className="mb-4"
            >
              {error}
            </Alert>
          )}

          <AddTaskForm
            onAdd={handleAddTask}
            isLoading={actionLoading}
            tasksCount={tasks.length}
          />

          {tasks.length === 0 ? (
            <div className="text-center py-5">
              <div className="text-muted">
                <h3>No tasks yet</h3>
                <p>Add your first task to get started!</p>
              </div>
            </div>
          ) : (
            <div>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h4>Your Tasks ({tasks.length}/10)</h4>
                <small className="text-muted">
                  Drag the <i className="bi bi-grip-vertical"></i> icon to
                  reorder tasks
                </small>
              </div>

              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={tasks.map((task) => task.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="task-list">
                    {tasks.map((task) => (
                      <TaskItem
                        key={task.id}
                        task={task}
                        onUpdate={handleUpdateTask}
                        onDelete={handleDeleteTask}
                        isLoading={actionLoading}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          )}

          {actionLoading && (
            <div className="text-center py-2">
              <Spinner animation="border" size="sm" className="me-2" />
              <small className="text-muted">Updating...</small>
            </div>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default TaskList;
