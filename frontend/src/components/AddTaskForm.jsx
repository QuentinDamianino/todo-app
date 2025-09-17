import { useState } from "react";
import { Alert, Button, Form, InputGroup } from "react-bootstrap";

const AddTaskForm = ({ onAdd, isLoading, tasksCount }) => {
  const [taskName, setTaskName] = useState("");
  const [errors, setErrors] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canAddTask = tasksCount < 10;

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedName = taskName.trim();

    if (!trimmedName) {
      setErrors("Task cannot be empty.");
      return;
    }

    if (trimmedName.length > 150) {
      setErrors("Task name cannot be longer than 150 characters.");
      return;
    }

    if (!canAddTask) {
      setErrors("Maximum number of tasks (10) reached");
      return;
    }

    setIsSubmitting(true);
    setErrors("");

    try {
      await onAdd({ name: trimmedName });
      setTaskName("");
    } catch (error) {
      setErrors(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    setTaskName(e.target.value);
    if (errors) setErrors("");
  };

  return (
    <div className="card mb-4">
      <div className="card-header">
        <h5 className="mb-0">Add New Task</h5>
      </div>
      <div className="card-body">
        {!canAddTask && (
          <Alert variant="warning" className="mb-3">
            Maximum number of tasks (10) reached. Delete some tasks to add new
            ones.
          </Alert>
        )}

        <Form onSubmit={handleSubmit}>
          <InputGroup className="mb-3">
            <Form.Control
              type="text"
              placeholder="Enter task name..."
              value={taskName}
              onChange={handleInputChange}
              isInvalid={!!errors}
              disabled={isLoading || isSubmitting || !canAddTask}
              maxLength={150}
            />
            <Button
              type="submit"
              variant="primary"
              disabled={
                isLoading || isSubmitting || !canAddTask || !taskName.trim()
              }
            >
              {isSubmitting ? "Adding..." : "Add Task"}
            </Button>
          </InputGroup>

          {errors && (
            <Alert variant="danger" className="mb-0">
              {errors}
            </Alert>
          )}

          <div className="small text-muted">
            Tasks: {tasksCount}/10 | Characters: {taskName.length}/150
          </div>
        </Form>
      </div>
    </div>
  );
};

export default AddTaskForm;
