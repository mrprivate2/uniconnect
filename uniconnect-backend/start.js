import { spawn } from "child_process";

// Backend
const backend = spawn("npm", ["run", "dev"], {
  cwd: "uniconnect-backend",
  shell: true,
  stdio: "inherit",
});

// Frontend
const frontend = spawn("npm", ["run", "dev"], {
  cwd: "uniconnect",
  shell: true,
  stdio: "inherit",
});

// Handle exit
backend.on("close", (code) => {
  console.log(`Backend exited with code ${code}`);
});

frontend.on("close", (code) => {
  console.log(`Frontend exited with code ${code}`);
});