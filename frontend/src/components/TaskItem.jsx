import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { Button, Form, InputGroup } from "react-bootstrap";
import { CSS } from "@dnd-kit/utilities";

const TaskItem = ({ task, onUpdate, onDelete, isLoading }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(task.name);
  const [errors, setErrors] = useState("");

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleStartEdit = () => {
    setIsEditing(true);
    setEditValue(task.name);
    setErrors("");
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditValue(task.name);
    setErrors("");
  };

  const handleSaveEdit = async () => {
    const trimmedValue = editValue.trim();

    if (!trimmedValue) {
      setErrors("Task cannot be empty.");
      return;
    }

    if (trimmedValue.length > 150) {
      setErrors("Task name cannot be longer than 150 characters");
    }

    try {
      await onUpdate(task.id, { name: trimmedValue });
      setIsEditing(false);
      setErrors("");
    } catch (error) {
      setErrors(error.message);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSaveEdit();
    } else if (e.key === "Escape") {
      handleCancelEdit();
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      await onDelete(task.id);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`card mb-2 ${isDragging ? "shadow-lg" : "shadow-sm"}`}
    >
      <div className="card-body py-2">
        <div className="d-flex">
          <div
            {...attributes}
            {...listeners}
            className="drag-handle me-3 text-muted"
            style={{
              cursor: isDragging ? "grabbing" : "grab",
              fontSize: "1.2rem",
            }}
            title="Drag to reorder"
          >
            <i className="bi bi-grip-vertical"></i>
          </div>

          <div className="flex-grow-1">
            {isEditing ? (
              <div>
                <InputGroup className="mb-1">
                  <Form.Control
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={handleKeyPress}
                    isInvalid={!!errors}
                    disabled={isLoading}
                    autoFocus
                    maxLength={150}
                  />
                  <Button
                    variant="success"
                    size="sm"
                    onClick={handleSaveEdit}
                    disabled={isLoading}
                  >
                    ✓
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleCancelEdit}
                    disabled={isLoading}
                  >
                    ✕
                  </Button>
                </InputGroup>
                {errors && <div className="text-danger small">{errors}</div>}
                <div className="small text-muted">
                  Press Enter to save, Escape to cancel
                </div>
              </div>
            ) : (
              <div
                className="task-name"
                onClick={handleStartEdit}
                style={{ cursor: "pointer" }}
                title="Click to edit"
              >
                <span className="fw-medium">{task.name}</span>
                <small className="text-muted ms-2">(Click to edit)</small>
              </div>
            )}
          </div>

          {!isEditing && (
            <div className="ms-2 flex-shrink-0 align-self-start">
              <Button
                variant="outline-primary"
                size="sm"
                onClick={handleStartEdit}
                disabled={isLoading}
                className="me-1"
              >
                Edit
              </Button>
              <Button
                variant="outline-danger"
                size="sm"
                onClick={handleDelete}
                disabled={isLoading}
              >
                Delete
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskItem;
