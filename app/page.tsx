"use client";

import { useState, useEffect, FormEvent } from "react";
import { BsTrashFill, BsCheckCircleFill, BsCircle } from "react-icons/bs";

interface Task {
  id: string;
  title: string;
  is_complete: boolean;
  created_at: string;
}

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/tasks");
      if (!res.ok) {
        throw new Error(`API Error: ${res.status}`);
      }
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

    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title: newTaskTitle }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(
          errorData.error || "An unknown error occurred while adding the task."
        );
      }

      setNewTaskTitle("");
      fetchTasks();
    } catch (err: unknown) {
      if (err instanceof Error) {
        alert(`Error: ${err.message}`);
      } else {
        alert("An unexpected error occurred.");
      }
    }
  };

  const handleToggleComplete = async (task: Task) => {
    try {
      const res = await fetch("/api/tasks", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: task.id, is_complete: !task.is_complete }),
      });

      if (!res.ok) {
        throw new Error("An error occurred while updating the task status.");
      }

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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) {
        throw new Error("An error occurred while deleting the task.");
      }

      fetchTasks();
    } catch (err: unknown) {
      alert("Deletion failed.");
    }
  };

  const styles = {
    container: "max-w-xl mx-auto p-4 bg-gray-50 shadow-lg rounded-lg mt-10",
    header: "text-3xl font-bold text-center text-indigo-700 mb-6",
    form: "flex mb-6",
    input:
      "flex-grow p-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-indigo-500",
    button:
      "px-6 py-3 bg-indigo-600 text-white font-semibold rounded-r-lg hover:bg-indigo-700 transition duration-150",
    list: "space-y-3",
    listItem: (isComplete: boolean) =>
      `flex items-center justify-between p-3 border border-gray-200 rounded-lg transition duration-150 ${
        isComplete ? "bg-green-100" : "bg-white"
      }`,
    title: (isComplete: boolean) =>
      `text-lg ${isComplete ? "line-through text-gray-500" : "text-gray-800"}`,
    actionButton:
      "text-gray-400 hover:text-indigo-600 ml-3 transition duration-150",
  };

  if (loading && tasks.length === 0)
    return <div className={styles.container}>Loading...</div>;
  if (error)
    return (
      <div className={styles.container} style={{ color: "red" }}>
        Error: {error}
      </div>
    );

  return (
    <div className={styles.container}>
      <h1 className={styles.header}>Cloud-Based To-Do List</h1>

      <form onSubmit={handleAddTask} className={styles.form}>
        <input
          type="text"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          placeholder="New task title..."
          className={styles.input}
        />
        <button type="submit" className={styles.button}>
          Add
        </button>
      </form>

      <div className={styles.list}>
        {tasks.map((task) => (
          <div key={task.id} className={styles.listItem(task.is_complete)}>
            <button
              onClick={() => handleToggleComplete(task)}
              className={styles.actionButton}
              title="Toggle status"
            >
              {task.is_complete ? (
                <BsCheckCircleFill size={20} className="text-green-500" />
              ) : (
                <BsCircle size={20} />
              )}
            </button>

            <span
              className={`flex-grow mx-3 ${styles.title(task.is_complete)}`}
            >
              {task.title}
            </span>

            <button
              onClick={() => handleDeleteTask(task.id)}
              className={styles.actionButton}
              title="Delete task"
            >
              <BsTrashFill size={18} className="hover:text-red-500" />
            </button>
          </div>
        ))}
      </div>

      <p className="text-center mt-6 text-sm text-gray-500">
        Total Tasks: {tasks.length}
      </p>

      <p className="text-center mt-2 text-xs text-gray-400">
        API 5: Pending Tasks -
        <a
          href="http://localhost:3000/api/tasks/pending"
          target="_blank"
          className="text-indigo-400 hover:underline ml-1"
        >
          Test Endpoint
        </a>
      </p>
    </div>
  );
}
