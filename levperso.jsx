import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { GiUpgrade, GiCheckMark, GiCancel, GiTrashCan } from "react-icons/gi";
import { motion } from "framer-motion";

const readData = () => {
  try {
    const data = localStorage.getItem("todoXpData");
    const parsedData = data ? JSON.parse(data) : { xp: 0, tasks: {} };
    return {
      xp: parsedData.xp || 0,
      tasks: {
        penalty: parsedData.tasks.penalty || [],
        daily: parsedData.tasks.daily || [],
        weekly: parsedData.tasks.weekly || [],
        epic: parsedData.tasks.epic || [],
        legendary: parsedData.tasks.legendary || []
      }
    };
  } catch (error) {
    return { xp: 0, tasks: { penalty: [], daily: [], weekly: [], epic: [], legendary: [] } };
  }
};

const writeData = (data) => {
  localStorage.setItem("todoXpData", JSON.stringify(data));
};

export default function TodoXpTracker() {
  const initialData = readData();
  const [xp, setXp] = useState(initialData.xp);
  const [tasks, setTasks] = useState(initialData.tasks);
  const [newTask, setNewTask] = useState({ category: "daily", name: "", xp: 0 });

  useEffect(() => {
    writeData({ xp, tasks });
  }, [xp, tasks]);

  const getLevel = () => Math.floor(xp / 1000);
  const getProgress = () => (xp % 1000) / 10;

  const addTask = () => {
    if (newTask.name.trim() === "") return;
    setTasks(prev => ({
      ...prev,
      [newTask.category]: [...prev[newTask.category], { name: newTask.name, xp: newTask.xp }]
    }));
    setNewTask({ category: "daily", name: "", xp: 0 });
  };

  const completeTask = (category, index) => {
    const taskXp = tasks[category][index].xp;
    setXp(prevXp => category === "penalty" ? Math.max(0, prevXp - taskXp) : prevXp + taskXp);
    deleteTask(category, index);
  };

  const deleteTask = (category, index) => {
    setTasks(prev => ({
      ...prev,
      [category]: prev[category].filter((_, i) => i !== index)
    }));
  };

  const adjustXp = (value) => {
    setXp((prevXp) => Math.max(0, prevXp + value));
  };

  return (
    <div className="p-6 space-y-4 bg-gray-900 text-white min-h-screen font-mono">
      <h1 className="text-4xl font-bold text-center">⚔️ Solo Leveling</h1>
      <div className="text-center font-semibold text-xl flex justify-center items-center gap-2">
        Level: {getLevel()} <GiUpgrade className="text-yellow-400" />
      </div>
      <div className="text-center text-lg font-semibold">XP: {xp}</div>
      <Progress value={getProgress()} className="h-4 bg-gray-600" />
      
      <div className="flex justify-center gap-2 mt-4">
        {[100, 50, 20, 5].map(value => (
          <Button key={value} onClick={() => adjustXp(value)}>+{value}</Button>
        ))}
        {[100, 50, 20, 5].map(value => (
          <Button key={-value} onClick={() => adjustXp(-value)}>-{value}</Button>
        ))}
      </div>
      
      <div className="mt-6 p-4 bg-gray-800 rounded-lg">
        <h2 className="text-lg font-bold">Add Quest</h2>
        <input 
          type="text" 
          placeholder="Quest Name" 
          value={newTask.name} 
          onChange={(e) => setNewTask({ ...newTask, name: e.target.value })} 
          className="p-2 border rounded w-full mt-2 bg-gray-900 text-white" 
        />
        <input 
          type="number" 
          placeholder="XP" 
          value={newTask.xp} 
          onChange={(e) => setNewTask({ ...newTask, xp: parseInt(e.target.value) || 0 })} 
          className="p-2 border rounded w-full mt-2 bg-gray-900 text-white" 
        />
        <select 
          value={newTask.category} 
          onChange={(e) => setNewTask({ ...newTask, category: e.target.value })} 
          className="p-2 border rounded w-full mt-2 bg-gray-900 text-white"
        >
          <option value="penalty">Penalty Quest</option>
          <option value="daily">Daily Quest</option>
          <option value="weekly">Weekly Quest</option>
          <option value="epic">Epic Quest</option>
          <option value="legendary">Legendary Quest</option>
        </select>
        <Button onClick={addTask} className="mt-2">Add Quest</Button>
      </div>

      <div className="mt-6">
        {Object.entries(tasks).map(([category, quests]) => (
          <div key={category} className="mt-4">
            <h2 className={`text-lg font-bold capitalize ${category === 'penalty' ? 'text-red-500' : ''}`}>{category} Quests</h2>
            <div className="space-y-2">
              {quests.map((task, index) => (
                <Card key={index} className={`p-2 flex justify-between items-center ${category === 'penalty' ? 'bg-red-700' : category === 'legendary' ? 'bg-yellow-500 text-black' : 'bg-violet-600 text-white'}`}>
                  <CardContent>{task.name} ({category === 'penalty' ? '-' : '+'}{task.xp} XP)</CardContent>
                  <div className="flex gap-2">
                    <Button onClick={() => completeTask(category, index)}>
                      <GiCheckMark className="text-green-400" />
                    </Button>
                    <Button onClick={() => deleteTask(category, index)}>
                      <GiTrashCan className="text-red-400" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
