"use client";

import { useState, useEffect, FormEvent } from "react";
import { BsTrashFill, BsCheckCircleFill, BsCircle } from "react-icons/bs";

interface Task {
  id: string;
  title: string;
  is_complete: boolean;
  priority: number;
  created_at: string;
}

const PRIORITY_LABELS: { [key: number]: { label: string; color: string } } = {
  1: { label: "P1 - High", color: "priority-high" },
  2: { label: "P2 - Medium", color: "priority-medium" },
  3: { label: "P3 - Low", color: "priority-low" },
};

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newPriority, setNewPriority] = useState<number>(3);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/tasks");
      if (!res.ok) throw new Error(`API Error: ${res.status}`);
      const data: Task[] = await res.json();
      setTasks(data);
      setError(null);
    } catch (err: unknown) {
      console.error(err);
      setError("An error occurred while loading tasks.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleAddTask = async (e: FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const finalPriority = newPriority;

    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTaskTitle, priority: finalPriority }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(
          errorData.error || "An unknown error occurred while adding the task."
        );
      }

      setNewTaskTitle("");
      setNewPriority(1);
      fetchTasks();
    } catch (err: unknown) {
      if (err instanceof Error) alert(`Error: ${err.message}`);
      else alert("An unexpected error occurred.");
    }
  };

  const handleToggleComplete = async (task: Task) => {
    try {
      const res = await fetch("/api/tasks", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: task.id, is_complete: !task.is_complete }),
      });
      if (!res.ok)
        throw new Error("An error occurred while updating the task status.");
      fetchTasks();
    } catch (err: unknown) {
      alert("Update failed.");
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    try {
      const res = await fetch("/api/tasks", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok)
        throw new Error("An error occurred while deleting the task.");
      fetchTasks();
    } catch (err: unknown) {
      alert("Deletion failed.");
    }
  };

  const priorityClasses = (isComplete: boolean) =>
    isComplete ? "task-complete" : "task-pending";

  if (loading && tasks.length === 0)
    return <div className="container">Loading...</div>;
  if (error)
    return (
      <div className="container" style={{ color: "red" }}>
        Error: {error}
      </div>
    );

  return (
    <div className="container">
      <h1>Cloud-Based To-Do List</h1>

      <form onSubmit={handleAddTask} className="task-form">
        <div className="select-wrapper">
          <select
            value={Math.max(1, Math.min(3, newPriority))}
            onChange={(e) => setNewPriority(parseInt(e.target.value))}
          >
            <option value={1}>P1 - High</option>
            <option value={2}>P2 - Medium</option>
            <option value={3}>P3 - Low</option>
          </select>
        </div>

        <input
          type="text"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          placeholder="New task title..."
          className="task-input"
        />

        <button type="submit">Add Task</button>
      </form>

      <div className="task-list">
        {tasks.map((task) => (
          <div
            key={task.id}
            className={`task-item ${priorityClasses(task.is_complete)}`}
          >
            <button
              onClick={() => handleToggleComplete(task)}
              className="toggle-btn"
              title="Toggle status"
            >
              {task.is_complete ? (
                <BsCheckCircleFill size={24} color="#10b981" />
              ) : (
                <BsCircle size={24} color="#7597de" />
              )}
            </button>

            <span className="task-content">
              <span className="task-title">{task.title}</span>

              <span
                className={`priority-tag ${
                  PRIORITY_LABELS[task.priority]?.color ||
                  PRIORITY_LABELS[3].color
                }`}
              >
                {`P${task.priority}`}
              </span>
            </span>

            <button
              onClick={() => handleDeleteTask(task.id)}
              className="delete-btn"
              title="Delete task"
            >
              <BsTrashFill size={18} color="#ef4444" />
            </button>
          </div>
        ))}
      </div>

      <p className="stats">
        Total Tasks: {tasks.length} | API 5:{" "}
        <a href="/api/tasks/pending" target="_blank">
          Pending Test
        </a>
      </p>
    </div>
  );
}
